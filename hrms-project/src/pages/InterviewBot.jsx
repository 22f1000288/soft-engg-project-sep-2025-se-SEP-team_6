import React, { useState, useRef } from "react";
import config from '../../public/config.json'

const InterviewBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioResponse, setAudioResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef(null);
  const audioPlayer = useRef(null);

  // Helper to safely join base + path avoiding duplicate slashes
  const joinUrl = (base, path) => {
    if (!base) return path;
    const b = base.replace(/\/+$/g, "");
    const p = (path || "").replace(/^\/+/g, "");
    return `${b}/${p}`;
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setRecordingTime(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };
      // when stop fires we will send the gathered chunks
      recorder.onstop = () => sendAudioToBackend();

      recorder.start();
      setIsRecording(true);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      setErrorMessage("Failed to access microphone. Please check your permissions.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      try {
        mediaRecorder.stop();
      } catch (e) {
        // ignore if already stopped
      }
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const sendAudioToBackend = async () => {
    // if no chunks, nothing to send
    if (!audioChunks || audioChunks.length === 0) {
      setErrorMessage("No audio recorded.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // prefer recording as webm/ogg if produced by browser, but backend expects a wav - backend has fallback
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");

      const backendBase = `${config.backend}${config.port ? `:${config.port}` : ""}`;
      const response = await fetch(joinUrl(backendBase, "/talk"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Backend returned ${response.status} ${text}`);
      }

      const data = await response.json();

      // transcript fallback chain (user)
      const transcript = data?.transcript || data?.user_transcript || lastTranscript || "Transcript unavailable";
      // assistant text — try several likely field names
      const assistantText = data?.text || data?.assistant_text || data?.reply || data?.message || data?.assistant?.text || lastResponse || "";

      setLastTranscript(transcript);
      setLastResponse(assistantText);

      const audioPath = data?.audio_file || data?.audio_url || "";
      const audioUrl = audioPath
        ? audioPath.startsWith("http")
          ? audioPath
          : joinUrl(backendBase, audioPath)
        : null;

      // update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { type: "user", time: new Date().toLocaleTimeString(), text: transcript },
        {
          type: "assistant",
          time: new Date().toLocaleTimeString(),
          text: assistantText && assistantText.trim().length ? assistantText : "[Audio response — no transcript available]",
          audioUrl: audioUrl,
        },
      ]);

      // if audioUrl present, attach and play
      if (audioUrl) {
        setAudioResponse(audioUrl);
        // ensure audio element updated before play
        if (audioPlayer.current) {
          audioPlayer.current.src = audioUrl;
          // small delay to allow setting src to take effect on some browsers
          setTimeout(async () => {
            try {
              await audioPlayer.current.play();
              setIsSpeaking(true);
            } catch (playErr) {
              // autoplay may be blocked; user can click replay manually
              console.warn("Auto-play prevented:", playErr);
              setErrorMessage("Audio ready — click replay to listen.");
            }
          }, 120);
        }
      } else {
        setErrorMessage(null);
      }

      // clear recorded chunks for next recording
      setAudioChunks([]);
    } catch (error) {
      console.error("sendAudioToBackend error:", error);
      setErrorMessage("Failed to process the audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async () => {
    if (audioPlayer.current) {
      try {
        await audioPlayer.current.play();
        setIsSpeaking(true);
      } catch (err) {
        console.warn("Play failed:", err);
        setErrorMessage("Failed to play audio automatically. Click Replay.");
      }
    }
  };

  const replayAudio = async () => {
    if (audioPlayer.current) {
      audioPlayer.current.currentTime = 0;
      try {
        await audioPlayer.current.play();
        setIsSpeaking(true);
      } catch (err) {
        console.warn("Replay failed:", err);
        setErrorMessage("Failed to play audio. Please try again.");
      }
    }
  };

  const onAudioEnded = () => {
    setIsSpeaking(false);
  };

  const onAudioError = () => {
    setIsSpeaking(false);
    setErrorMessage("Failed to play audio response.");
  };

  // Animation classes for assistant circle
  let assistantCircleClass = "w-40 h-40 rounded-full bg-white flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl relative";
  if (isRecording) assistantCircleClass += " bg-gradient-to-br from-pink-300 to-pink-500 animate-pulse";
  else if (isProcessing) assistantCircleClass += " bg-gradient-to-br from-blue-400 to-cyan-300";
  else if (isSpeaking) assistantCircleClass += " bg-gradient-to-br from-green-400 to-teal-300 animate-pulse";

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-indigo-400 to-purple-600 font-sans p-4 overflow-x-hidden">
      <div className="max-w-xl w-full mx-auto px-2">
        {/* Header */}
        <header className="text-center text-white mb-8 pt-2">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3 text-white">
            <span className="text-3xl">🎤</span>
            InterviewBot
          </h1>
          <p className="text-base opacity-95 font-normal text-white">Your AI Interview Assistant</p>
        </header>

        {/* Main Assistant Display */}
        <div className="flex flex-col items-center my-10 mb-8 relative">
          <div className={assistantCircleClass} onClick={toggleRecording}>
            {isRecording && <div className="absolute w-40 h-40 rounded-full border-4 border-white/50 animate-ping" style={{ pointerEvents: "none" }}></div>}
            {isRecording && <div className="absolute w-40 h-40 rounded-full border-4 border-white/50 animate-ping delay-1000" style={{ pointerEvents: "none" }}></div>}
            <div className="text-5xl animate-fadeIn">
              {!isRecording && !isProcessing && !isSpeaking && <span>🎤</span>}
              {isRecording && <span className="animate-bounce">🎙️</span>}
              {isProcessing && <span className="animate-bounce">⚡</span>}
              {isSpeaking && <span className="animate-bounce">🔊</span>}
            </div>
          </div>
          {/* Status Text */}
          <div className="mt-6 text-center min-h-[28px]">
            {!isRecording && !isProcessing && !isSpeaking && <p className="text-white text-lg font-medium m-0">Click to start speaking</p>}
            {isRecording && <p className="text-white text-lg font-medium m-0 animate-fadeIn">Listening... <span className="animate-blink text-yellow-300 text-xl ml-1">●</span></p>}
            {isProcessing && <p className="text-white text-lg font-medium m-0 animate-fadeIn">Processing your response...</p>}
            {isSpeaking && <p className="text-white text-lg font-medium m-0 animate-fadeIn">Playing response...</p>}
          </div>
          {/* Recording Timer */}
          {isRecording && <div className="mt-3 text-white text-xl font-mono font-semibold bg-black/20 px-5 py-2 rounded-full">{recordingTime}s</div>}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 my-6 flex-wrap">
          <button
            onClick={toggleRecording}
            className={`px-8 py-3 text-base rounded-full font-semibold shadow-md flex items-center gap-2 transition-all ${isRecording ? "bg-pink-500 text-white" : "bg-white text-indigo-500"}`}
          >
            {isRecording ? "⏹️ Stop" : "🎙️ Start"}
          </button>
          {audioResponse && (
            <button
              onClick={replayAudio}
              className="px-8 py-3 text-base rounded-full font-semibold shadow-md flex items-center gap-2 transition-all bg-green-400 text-white"
              disabled={isSpeaking}
            >
              🔄 Replay
            </button>
          )}
        </div>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="bg-white/95 rounded-2xl p-5 my-6 shadow-xl max-h-72 overflow-y-auto">
            <h3 className="text-indigo-500 mb-4 text-lg">Conversation History</h3>
            <div className="flex flex-col gap-3">
              {conversationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.type === "user" ? "bg-indigo-400/15" : "bg-green-300/15"}`}
                >
                  <div className="text-2xl min-w-[35px] text-center">{item.type === "user" ? "👤" : "🤖"}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1 text-sm">{item.type === "user" ? "You" : "Assistant"}</div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                    {item.text && (
                      <div className="mt-1 text-gray-700 text-[0.95rem]">{item.text}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-pink-500/95 text-white px-5 py-4 rounded-xl my-5 flex items-center gap-3 shadow-md text-base animate-fadeIn">
            <span className="text-xl">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioPlayer}
          src={audioResponse || undefined}
          onPlay={() => setIsSpeaking(true)}
          onEnded={onAudioEnded}
          onError={onAudioError}
          style={{ display: "none" }}
        />
      </div>
      {/* Animations for Tailwind (add to tailwind.config.js if needed) */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
        .animate-blink { animation: blink 1s infinite; }
      `}</style>
    </div>
  );
};

export default InterviewBot;
