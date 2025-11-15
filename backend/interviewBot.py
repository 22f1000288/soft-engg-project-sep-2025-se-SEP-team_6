from groq import Groq
from dotenv import load_dotenv
import os
import tempfile
import uuid
import json
import asyncio
import io
import wave
import struct
import base64


load_dotenv()

# Directory where generated audio files will be stored.
# Make this absolute so other modules (main.py) can serve files reliably.
AUDIO_FOLDER = os.path.abspath(os.path.join(os.getcwd(), "temp_audio"))

# Initialize Groq client (may or may not provide audio features in your environment)
client = Groq(api_key=base64.b64decode(os.environ.get("GROQ_API_KEY")).decode('utf-8'))


class GroqInterview:
    """A thin wrapper around a chat + (optional) audio pipeline.

    Notes:
    - All public methods are async so callers (FastAPI) can `await` them.
    - Blocking work (file I/O, SDK calls) is run with `asyncio.to_thread`.
    - The class implements graceful fallbacks when the Groq client
      does not expose audio transcription / TTS APIs in the runtime.
    """

    async def transcribe_audio(self, file_like) -> dict:
        """Accept a file-like object (BytesIO or an object with .read()) and return
        a message dict: {"role": "user", "content": "...transcript..."}

        This function writes the content to a temporary file and calls the
        Groq client's transcription endpoint if available. Otherwise it raises
        a clear RuntimeError so caller can decide how to proceed.
        """
        # Read bytes from file-like in a non-blocking way
        if hasattr(file_like, "read"):
            file_bytes = await asyncio.to_thread(file_like.read)
        else:
            # If raw bytes were passed
            file_bytes = file_like

        if not file_bytes:
            raise ValueError("Audio file is empty")

        # Create a temporary WAV file synchronously inside a thread
        def _write_temp_file(bytes_data):
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            tmp.write(bytes_data)
            tmp.flush()
            tmp.close()
            return tmp.name

        tmp_path = await asyncio.to_thread(_write_temp_file, file_bytes)

        try:
            # Try to call Groq transcription if available. If not, raise informative error.
            if hasattr(client, "audio") and hasattr(client.audio, "transcriptions"):
                def _call_transcription():
                    with open(tmp_path, "rb") as audio_f:
                        return client.audio.transcriptions.create(
                            file=audio_f,
                            model="whisper-large-v3-turbo",
                            response_format="text",
                            language="en",
                        )

                transcription = await asyncio.to_thread(_call_transcription)

                # transcription might be a string or an object depending on SDK
                if isinstance(transcription, str):
                    transcript_text = transcription
                else:
                    # try common attributes
                    transcript_text = getattr(transcription, "text", None) or str(transcription)

                return {"role": "user", "content": transcript_text}
            else:
                # Clear error so caller knows what's missing
                raise RuntimeError(
                    "Groq client does not expose audio transcription in this environment."
                )
        finally:
            # best-effort cleanup of the temporary file
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    async def get_chat_response(self, user_message: dict) -> dict:
        """Send messages (including user_message) to the chat model and return assistant response.

        The function persists conversation history (database.json) after receiving the assistant reply.
        """
        messages = await self.load_messages()
        messages.append(user_message)

        if hasattr(client, "chat") and hasattr(client.chat, "completions"):
            def _call_chat():
                return client.chat.completions.create(messages=messages, model="llama-3.3-70b-versatile")

            chat_completion = await asyncio.to_thread(_call_chat)

            # SDKs differ in shape; attempt to extract content safely
            content = None
            try:
                # typical structure: chat_completion.choices[0].message.content
                content = chat_completion.choices[0].message.content
            except Exception:
                # fallback to string representation
                content = getattr(chat_completion, "text", None) or str(chat_completion)

            response = {"role": "assistant", "content": content}

            # save messages (user + assistant) to persistent history
            await self.save_messages(user_message, response)
            return response
        else:
            raise RuntimeError("Groq client chat completions not available in this environment.")

    async def save_messages(self, user_message: dict, response: dict):
        """Append user_message and response to database.json in a thread to avoid blocking."""
        file_path = "database.json"

        def _sync_write():
            # Ensure file exists and contains a JSON array
            if not os.path.exists(file_path):
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump([], f)

            # Read, append, write
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    if not isinstance(data, list):
                        data = []
                except json.JSONDecodeError:
                    data = []

            data.append(user_message)
            data.append(response)

            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)

        await asyncio.to_thread(_sync_write)

    async def load_messages(self) -> list:
        """Load conversation messages from database.json. If empty, return a default system prompt."""
        file_path = "database.json"

        def _sync_read():
            if not os.path.exists(file_path):
                # create an empty JSON array file
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump([], f)
                return []

            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    if not isinstance(data, list):
                        return []
                    return data
                except json.JSONDecodeError:
                    return []

        data = await asyncio.to_thread(_sync_read)

        if not data:
            # return a sensible system prompt as the initial context
            return [
                {
                    "role": "system",
                    "content": (
                        "You are interviewing the user for a behavioural round. Ask short questions "
                        "that are relevant to entry-level professionals from India. Keep responses under 30 words. "
                        "Your name is Alex."
                    ),
                }
            ]

        return data

    async def text_to_speech(self, text: str) -> str:
        """Generate speech audio from `text` and save to the AUDIO_FOLDER. Return the filename.

        If Groq's TTS is not available, this function will synthesize a short silent WAV file
        as a harmless fallback so the rest of the pipeline can continue to work.
        """
        os.makedirs(AUDIO_FOLDER, exist_ok=True)
        filename = f"{uuid.uuid4()}.wav"
        speech_file_path = os.path.join(AUDIO_FOLDER, filename)

        # If Groq provides TTS, call it (in a thread). Otherwise create a short silent WAV.
        if hasattr(client, "audio") and hasattr(client.audio, "speech"):
            def _call_tts():
                resp = client.audio.speech.create(model="playai-tts", voice="Fritz-PlayAI", input=text, response_format="wav")
                # SDKs often provide a method to write the response to file. Attempt it, otherwise write raw bytes.
                try:
                    resp.write_to_file(speech_file_path)
                except Exception:
                    # try to treat resp as bytes
                    with open(speech_file_path, "wb") as f:
                        f.write(resp)

            await asyncio.to_thread(_call_tts)
        else:
            # Fallback: create 1 second of silence WAV (16kHz, 16-bit)
            def _make_silence(path):
                framerate = 16000
                duration = 1  # seconds
                nframes = framerate * duration
                with wave.open(path, "w") as wf:
                    wf.setnchannels(1)
                    wf.setsampwidth(2)  # 16-bit
                    wf.setframerate(framerate)
                    silence = struct.pack('<h', 0) * nframes
                    wf.writeframes(silence)

            await asyncio.to_thread(_make_silence, speech_file_path)

        return filename


# Provide a module-level instance so main.py can import AUDIO_FOLDER and instantiate quickly.
# groq_instance = GroqInterview()
