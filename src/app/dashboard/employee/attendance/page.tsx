"use client";

import { useRef, useState } from "react";
import { Camera, MapPin, Clock, CheckCircle, LogOut, X } from "lucide-react";

export default function HomeasyMarkAttendance() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Start Camera
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
    } catch (err) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(imageData);
    return imageData;
  };

  // Get Current Location
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(loc);
          resolve(loc);
        },
        (error) => {
          alert("Unable to get location. Please enable GPS.");
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  // Mark Attendance
  const markAttendance = async (type: "checkin" | "checkout") => {
    if (!capturedImage) {
      alert("Please capture your photo first");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      const currentLocation = location || (await getCurrentLocation());

      const res = await fetch(`/api/attendance/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: capturedImage,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setStatusMessage(data.error);
      } else {
        setStatusMessage(`✅ ${type === "checkin" ? "Checked In" : "Checked Out"} successfully!`);
        // Reset after success
        setTimeout(() => {
          setCapturedImage(null);
          setLocation(null);
        }, 2000);
      }
    } catch (err) {
      setStatusMessage("Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraOn(false);
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Mark Attendance</h1>
            <p className="text-slate-600 mt-1">Face recognition + GPS verification</p>
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden mb-6">
            {!isCameraOn ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                  <Camera className="w-10 h-10" />
                </div>
                <p className="text-slate-400">Camera is off</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {capturedImage && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-h-full rounded-2xl border-4 border-white shadow-2xl"
                />
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls */}
          <div className="flex flex-wrap gap-3">
            {!isCameraOn ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-3xl flex items-center justify-center gap-3 transition-all"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  disabled={!!capturedImage}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 rounded-3xl transition-all disabled:opacity-50"
                >
                  Capture Photo
                </button>

                <button
                  onClick={stopCamera}
                  className="flex items-center justify-center px-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-3xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-2xl text-center font-medium ${statusMessage.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => markAttendance("checkin")}
            disabled={loading || !capturedImage}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-5 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-200"
          >
            <CheckCircle className="w-6 h-6" />
            {loading ? "Processing..." : "Check In"}
          </button>

          <button
            onClick={() => markAttendance("checkout")}
            disabled={loading || !capturedImage}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-5 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-200"
          >
            <LogOut className="w-6 h-6" />
            {loading ? "Processing..." : "Check Out"}
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