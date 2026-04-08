"use client";

import { useRef, useState } from "react";
import { Camera, MapPin, CheckCircle, LogOut, X, Clock } from "lucide-react";

export default function MarkAttendance() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraOn(true);
      setCapturedImage(null);
    } catch {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) {
      alert("Camera not ready yet.");
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOn(false);
  };

  const markAttendance = async (type: "checkin" | "checkout") => {
    if (!capturedImage) return;
    setLoading(true);
    setStatusMessage("");

    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: true,
        }),
      );

      const res = await fetch(`/api/attendance/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: capturedImage,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setStatusMessage(data.error);
      } else {
        setStatusMessage(
          `✅ ${type === "checkin" ? "Checked in" : "Checked out"} successfully!`,
        );
        setTimeout(() => setCapturedImage(null), 2500);
      }
    } catch {
      setStatusMessage("Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Mark Attendance
            </h1>
            <p className="text-slate-600 mt-1">
              Face recognition + GPS verification
            </p>
          </div>
        </div>
        {/* Camera preview */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
          <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
            {!isCameraOn && !capturedImage && (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Camera className="w-10 h-10" />
                <p className="text-sm">Camera off</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraOn ? "" : "hidden"}`}
            />
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="p-4 flex gap-3">
            {!isCameraOn ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 rounded-full flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {capturedImage ? "Retake" : "Start Camera"}
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-full"
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-100 hover:bg-red-200 text-red-600 px-5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Status */}
        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-2xl text-sm text-center font-medium ${
              statusMessage.includes("✅")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => markAttendance("checkin")}
            disabled={loading || !capturedImage}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium py-4 rounded-full flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {loading ? "..." : "Check In"}
          </button>
          <button
            onClick={() => markAttendance("checkout")}
            disabled={loading || !capturedImage}
            className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-medium py-4 rounded-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            {loading ? "..." : "Check Out"}
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          Location & Face verification required for attendance
        </div>
      </div>
    </div>
  );
}
