import React, { useState, useRef } from "react";
import { uploadService } from "../../services/api";

const VoiceRecorderArea = ({ voices = [], onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await handleVoiceUpload(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Tidak dapat mengakses mikrofon: " + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleVoiceUpload = async (audioBlob) => {
    try {
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const response = await uploadService.uploadVoice(file, recordingTime);
      const newVoice = {
        filename: response.data.filename,
        originalName: response.data.originalName,
        url: response.data.url,
        mimetype: response.data.mimetype,
        size: response.data.size,
        duration: response.data.duration,
      };

      onChange([...voices, newVoice]);
    } catch (error) {
      console.error("Error uploading voice:", error);
      alert("Gagal mengupload rekaman: " + error.message);
    }
  };

  const removeVoice = (index) => {
    const newVoices = voices.filter((_, i) => i !== index);
    onChange(newVoices);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold">Voice Note</h3>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } transition`}
        >
          {isRecording ? "⏹️ Stop Rekam" : "🎤 Mulai Rekam"}
        </button>

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Klik tombol di atas untuk mulai merekam suara
      </div>

      {voices.length > 0 && (
        <div className="space-y-3 mt-3">
          {voices.map((voice, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white rounded border"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">
                  Rekaman Suara {index + 1}
                </div>
                <div className="text-xs text-gray-500">
                  Durasi: {formatTime(voice.duration)} • {voice.originalName}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <audio controls className="h-8">
                  <source src={voice.url} type={voice.mimetype} />
                  Browser tidak mendukung audio.
                </audio>
                <button
                  type="button"
                  onClick={() => removeVoice(index)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorderArea;
