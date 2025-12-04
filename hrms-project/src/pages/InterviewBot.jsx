import React, { useState, useRef } from "react";
import config from "../../public/config.json";

const InterviewBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioResponse, setAudioResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingInterval = useRef(null);
  const audioPlayer = useRef(null);

  // Join URL safely
  const joinUrl = (base, path) => {
    if (!base) return path;
    const b = base.replace(/\/+$/g, "");
    const p = (path || "").replace(/^\/+/g, "");
    return `${b}/${p}`;
  };

  // RECORDING
  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        await new Promise((r) => setTimeout(r, 80));
        sendAudioToBackend();
      };

      recorder.start();
      setIsRecording(true);

      recordingInterval.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      setErrorMessage("Microphone access denied. Please check permissions.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder) {
      try {
        recorder.stop();
      } catch {}
      recorder.stream?.getTracks()?.forEach((t) => t.stop());
    }

    setIsRecording(false);
    clearInterval(recordingInterval.current);
  };

  // SEND TO BACKEND
  const sendAudioToBackend = async () => {
    const chunks = audioChunksRef.current;
    if (!chunks.length) return;

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const backendBase = `${config.backend}${config.port ? `:${config.port}` : ""}`;

      const response = await fetch(joinUrl(backendBase, "/talk"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process audio");

      const data = await response.json();
      const transcript = data.transcript ?? lastTranscript;
      const assistantText = data.response ?? lastResponse;

      setLastTranscript(transcript);
      setLastResponse(assistantText);

      const audioPath = data.audio_file;
      const audioUrl = audioPath?.startsWith("http")
        ? audioPath
        : joinUrl(backendBase, audioPath);

      setConversationHistory((prev) => [
        ...prev,
        { type: "user", text: transcript, time: new Date().toLocaleTimeString() },
        { type: "assistant", text: assistantText, audioUrl, time: new Date().toLocaleTimeString() },
      ]);

      if (audioUrl && audioPlayer.current) {
        audioPlayer.current.src = audioUrl;
        setTimeout(async () => {
          try {
            await audioPlayer.current.play();
            setIsSpeaking(true);
          } catch {}
        }, 120);
      }

      audioChunksRef.current = [];
    } catch (err) {
      setErrorMessage("Failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const replayAudio = async () => {
    try {
      audioPlayer.current.currentTime = 0;
      await audioPlayer.current.play();
      setIsSpeaking(true);
    } catch {
      setErrorMessage("Replay failed.");
    }
  };

  const onAudioEnded = () => setIsSpeaking(false);

  // AVATAR ANIMATION
  const avatarPulse = isSpeaking
    ? "animate-[pulse_1.5s_infinite_ease-in-out]"
    : isRecording
    ? "animate-[ping_1.2s_infinite]"
    : "";

  const avatarGlow = isSpeaking
    ? "shadow-[0_0_25px_rgba(0,255,180,0.7)]"
    : isRecording
    ? "shadow-[0_0_25px_rgba(255,90,120,0.7)]"
    : "";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 overflow-x-hidden p-4 flex justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* HEADER */}
        <header className="text-center my-6">
          <h1 className="text-4xl font-bold text-white drop-shadow">
            AI Interview Assistant
          </h1>
          <p className="text-white/80 mt-2 text-lg">
            Speak naturally — your virtual HR is listening.
          </p>
        </header>

        {/* AVATAR */}
        <div className="flex justify-center my-10">
          <div
            className={`w-44 h-44 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 ${avatarPulse} ${avatarGlow}`}
          >
            {/* Animated HR Avatar */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/921/921071.png"
              alt="HR Avatar"
              className={`w-32 transition-all duration-300 ${
                isSpeaking ? "scale-110" : ""
              }`}
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="text-center text-white text-xl mb-4 h-8">
          {isRecording && "🎙 Listening..."}
          {isProcessing && "⚡ Processing..."}
          {isSpeaking && "🔊 Speaking..."}
        </div>

        {/* MAIN MIC BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={toggleRecording}
            className={`px-10 py-4 rounded-full text-xl font-bold shadow-lg transition-all ${
              isRecording
                ? "bg-red-500 text-white scale-105"
                : "bg-white text-indigo-600 hover:bg-gray-50"
            }`}
          >
            {isRecording ? "⏹ Stop" : "🎙 Start"}
          </button>
        </div>

        {/* REPLAY BUTTON */}
        {audioResponse && !isSpeaking && (
          <div className="flex justify-center mt-4">
            <button
              onClick={replayAudio}
              className="px-8 py-3 rounded-full font-semibold bg-green-400 text-white shadow-md hover:bg-green-500"
            >
              🔄 Replay Response
            </button>
          </div>
        )}

        {/* HISTORY */}
        <div className="mt-10 bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white shadow-xl max-h-80 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4">Conversation</h3>

          {conversationHistory.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl my-3 ${
                msg.type === "user"
                  ? "bg-indigo-500/30 border-l-4 border-indigo-300"
                  : "bg-green-500/30 border-l-4 border-green-300"
              }`}
            >
              <div className="text-sm opacity-80">
                {msg.time} — {msg.type === "user" ? "You" : "Assistant"}
              </div>
              <div className="mt-2 text-base">{msg.text}</div>
            </div>
          ))}
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 bg-red-500 text-white p-4 rounded-xl shadow-lg">
            ⚠ {errorMessage}
          </div>
        )}

        <audio ref={audioPlayer} onEnded={onAudioEnded} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default InterviewBot;
