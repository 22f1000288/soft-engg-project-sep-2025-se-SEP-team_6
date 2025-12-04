# backend/interviewBot.py
import os
import io
import uuid
import json
import wave
import struct
import asyncio
from typing import Optional

from dotenv import load_dotenv

# Try to import Groq client (optional)
try:
    from groq import Groq
except Exception:
    Groq = None

load_dotenv()

# --- Configuration ---
BASE_DIR = os.getcwd()
CONVERSATIONS_DIR = os.path.join(BASE_DIR, "conversations")
DATABASE_DIR = os.path.join(BASE_DIR, "database")
GLOBAL_DB = os.path.join(DATABASE_DIR, "database.json")
AUDIO_FOLDER = CONVERSATIONS_DIR  # we'll store under conversations/<conv_id>/

os.makedirs(CONVERSATIONS_DIR, exist_ok=True)
os.makedirs(DATABASE_DIR, exist_ok=True)

# Initialize Groq client defensively
_groq_api_key = os.environ.get("GROQ_API_KEY")
client = None
if _groq_api_key and Groq is not None:
    try:
        client = Groq(api_key=_groq_api_key)
        print("Groq client initialized.")
    except Exception as e:
        print("Warning: failed to init Groq client:", e)
        client = None
else:
    if _groq_api_key:
        print("Groq SDK missing; GROQ_API_KEY set but groq module not available.")
    else:
        print("GROQ_API_KEY not set; running in fallback mode.")


# --- Helper utilities ---
def _ensure_conv_folder(conv_id: str) -> str:
    folder = os.path.join(CONVERSATIONS_DIR, conv_id)
    os.makedirs(folder, exist_ok=True)
    return folder


async def _write_file_threaded(path: str, data: bytes):
    def _write():
        with open(path, "wb") as f:
            f.write(data)

    await asyncio.to_thread(_write)


async def _safe_json_read(path: str):
    def _read():
        if not os.path.exists(path):
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    return await asyncio.to_thread(_read)


async def _safe_json_write(path: str, obj):
    def _write():
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=4)

    await asyncio.to_thread(_write)


def _silent_wav_bytes(duration_s: int = 1, framerate: int = 16000):
    """Return bytes for a short silent WAV (16-bit mono)."""
    nframes = int(duration_s * framerate)
    silence = struct.pack("<h", 0) * nframes
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(framerate)
        wf.writeframes(silence)
    return buf.getvalue()


# --- Core interview class ---
class GroqInterview:
    def __init__(self, groq_client):
        self.client = groq_client

    async def transcribe_audio_and_save(self, file_bytes: bytes, conv_id: str) -> dict:
        if not file_bytes:
            raise ValueError("Empty audio file")

        # detect extension by simple heuristics
        ext = ".webm"
        if file_bytes[:4] == b"RIFF":
            ext = ".wav"
        elif file_bytes[:3] == b"Ogg":
            ext = ".ogg"
        elif file_bytes[:4] == b"fLaC":
            ext = ".flac"

        conv_folder = _ensure_conv_folder(conv_id)
        user_filename = f"user_{uuid.uuid4()}{ext}"
        user_path = os.path.join(conv_folder, user_filename)

        # Save file
        await _write_file_threaded(user_path, file_bytes)

        # Transcribe using Groq if available
        if self.client and hasattr(self.client, "audio") and hasattr(self.client.audio, "transcriptions"):
            def _call_transcription(path):
                with open(path, "rb") as audio_f:
                    return self.client.audio.transcriptions.create(
                        file=audio_f,
                        model="whisper-large-v3-turbo",
                        response_format="text",
                        language="en",
                    )

            try:
                transcription = await asyncio.to_thread(_call_transcription, user_path)
                if isinstance(transcription, str):
                    transcript_text = transcription
                else:
                    transcript_text = getattr(transcription, "text", None) or str(transcription)
            except Exception as ex:
                raise RuntimeError(f"Transcription failed: {ex}") from ex
        else:
            transcript_text = "(transcription unavailable - server running in fallback mode)"

        return {"role": "user", "content": transcript_text, "user_audio_filename": user_filename}

    async def load_messages(self, conv_id: str) -> list:
        conv_folder = _ensure_conv_folder(conv_id)
        messages_path = os.path.join(conv_folder, "messages.json")
        data = await _safe_json_read(messages_path)
        if not data:
            # default system prompt
            return [
                {
                    "role": "system",
                    "content": (
                        "You are interviewing the user for an interview. Ask short questions based on role the user is interviewing for "
                        "that are relevant to professionals from India. Keep responses under 30 words. "
                        "Your name is Alex."
                    ),
                }
            ]
        return data

    async def save_messages(self, conv_id: str, user_message: dict, assistant_message: dict):
        conv_folder = _ensure_conv_folder(conv_id)
        messages_path = os.path.join(conv_folder, "messages.json")

        def _sync():
            if not os.path.exists(messages_path):
                with open(messages_path, "w", encoding="utf-8") as f:
                    json.dump([], f)
            with open(messages_path, "r", encoding="utf-8") as f:
                try:
                    existing = json.load(f)
                    if not isinstance(existing, list):
                        existing = []
                except Exception:
                    existing = []
            existing.append(user_message)
            existing.append(assistant_message)
            with open(messages_path, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=4)

            # also append to global DB
            if not os.path.exists(GLOBAL_DB):
                with open(GLOBAL_DB, "w", encoding="utf-8") as gf:
                    json.dump([], gf)
            with open(GLOBAL_DB, "r", encoding="utf-8") as gf:
                try:
                    gdata = json.load(gf)
                    if not isinstance(gdata, list):
                        gdata = []
                except Exception:
                    gdata = []
            gdata.append(user_message)
            gdata.append(assistant_message)
            with open(GLOBAL_DB, "w", encoding="utf-8") as gf:
                json.dump(gdata, gf, indent=4)

        await asyncio.to_thread(_sync)

    async def get_chat_response(self, conv_id: str, user_message: dict) -> dict:
        messages = await self.load_messages(conv_id)

        api_user_msg = {"role": "user", "content": user_message.get("content", "")}
        messages_for_api = messages + [api_user_msg]

        if self.client and hasattr(self.client, "chat") and hasattr(self.client.chat, "completions"):
            def _call_chat(msgs):
                return self.client.chat.completions.create(messages=msgs, model="llama-3.3-70b-versatile")

            try:
                completion = await asyncio.to_thread(_call_chat, messages_for_api)
                try:
                    content = completion.choices[0].message.content
                except Exception:
                    content = getattr(completion, "text", None) or str(completion)
            except Exception as ex:
                raise RuntimeError(f"Chat completion failed: {ex}") from ex
        else:
            content = "(assistant unavailable - running in fallback mode)"

        assistant_message = {"role": "assistant", "content": content}

        saved_user = {"role": user_message.get("role", "user"), "content": user_message.get("content", "")}
        if "user_audio_filename" in user_message:
            saved_user["user_audio_filename"] = user_message["user_audio_filename"]

        saved_assistant = {"role": "assistant", "content": content}

        await self.save_messages(conv_id, saved_user, saved_assistant)
        return assistant_message

    async def text_to_speech_and_save(self, text: str, conv_id: str) -> str:
        conv_folder = _ensure_conv_folder(conv_id)
        filename = f"assistant_{uuid.uuid4()}.wav"
        path = os.path.join(conv_folder, filename)

        if self.client and hasattr(self.client, "audio") and hasattr(self.client.audio, "speech"):
            def _call_tts(p, txt):
                resp = self.client.audio.speech.create(
                    model="playai-tts",
                    voice="Fritz-PlayAI",
                    input=txt,
                    response_format="wav",
                )
                try:
                    resp.write_to_file(p)
                except Exception:
                    with open(p, "wb") as f:
                        f.write(resp)

            try:
                await asyncio.to_thread(_call_tts, path, text)
            except Exception:
                await _write_file_threaded(path, _silent_wav_bytes(1))
        else:
            await _write_file_threaded(path, _silent_wav_bytes(1))

        return filename


# module-level instance (optional convenience)
groq_instance = GroqInterview(client)
