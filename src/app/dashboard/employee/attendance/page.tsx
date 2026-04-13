"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle,
  LogOut,
  X,
  Clock,
  Loader2,
  Aperture,
  ShieldCheck,
} from "lucide-react";

export default function MarkAttendance() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // ✅ Enhanced State Management
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const startCamera = async () => {
    try {
      setStatusMessage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 1280 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraOn(true);
      setCapturedImage(null);
    } catch {
      setStatusMessage("Camera access denied. Please allow camera permissions in your browser settings.");
      setStatusType("error");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));
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
    setFetchingLocation(true);
    setStatusMessage(null);

    try {
      let latitude: number;
      let longitude: number;

      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 10000,
          }),
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (geoError) {
        console.error("Failed to get location", geoError);
        throw new Error("Location access denied. Please enable GPS/Location services.");
      } finally {
        setFetchingLocation(false);
      }

      const res = await fetch(`/api/attendance/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: capturedImage,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setStatusMessage(data.error);
        setStatusType("error");
      } else {
        const actionText = type === "checkin" ? "Checked In" : "Checked Out";
        setStatusMessage(`Successfully ${actionText} at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`);
        setStatusType("success");
        
        // Clear captured image after viewing success briefly
        setTimeout(() => setCapturedImage(null), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setStatusMessage(message);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Mark Attendance
            </h1>
            <p className="text-slate-600 mt-1">
              Face verification & GPS location tracking
            </p>
          </div>
        </div>

        {/* Camera Scanner Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="relative aspect-[3/4] md:aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
            
            {/* Empty State */}
            {!isCameraOn && !capturedImage && (
              <div className="flex flex-col items-center gap-4 text-slate-600 z-10">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Camera is Off</p>
                  <p className="text-sm text-slate-500 mt-1">Click the button below to start</p>
                </div>
              </div>
            )}

            {/* Live Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${isCameraOn ? "block" : "hidden"}`}
            />
            
            {/* Captured Image */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className={`w-full h-full object-cover ${statusType === "success" ? "" : "scale-x-[-1]"}`}
              />
            )}

            {/* Viewfinder Overlay (only when camera is active) */}
            {isCameraOn && (
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                <div className="w-4/5 max-w-xs aspect-square relative">
                  {/* Scanning Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-2xl" />
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">Scanning</span>
                </div>
              </div>
            )}

            {/* Success Overlay */}
            {capturedImage && statusType === "success" && (
              <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-emerald-300" />
                </div>
                <p className="text-2xl font-bold">Verified</p>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            {!isCameraOn ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
                {capturedImage ? "Retake Photo" : "Start Camera"}
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border-2 border-dashed border-slate-300 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Aperture className="w-5 h-5" />
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-white hover:bg-red-50 text-red-500 border border-red-100 px-5 rounded-2xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Status Message Box */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-start gap-3 border transition-all ${
              statusType === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {statusType === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{statusMessage}</p>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => markAttendance("checkin")}
            disabled={loading || !capturedImage}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-semibold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200/50 disabled:shadow-none"
          >
            {loading && fetchingLocation ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
            <span className="text-base">
              {loading && fetchingLocation ? "Fetching GPS..." : "Check In"}
            </span>
          </button>

          <button
            onClick={() => markAttendance("checkout")}
            disabled={loading || !capturedImage}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-semibold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-red-200/50 disabled:shadow-none"
          >
            {loading && fetchingLocation ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <LogOut className="w-6 h-6" />
            )}
            <span className="text-base">
              {loading && fetchingLocation ? "Fetching GPS..." : "Check Out"}
            </span>
          </button>
        </div>

        {/* Security Notice Footer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Secure Verification</h4>
              <p className="text-slate-500 text-xs leading-relaxed mt-1">
                For security purposes, your face geometry and exact GPS coordinates are captured and securely sent to the server. Please ensure you are within your designated office premises and in good lighting.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Homeasy • Smart Living, Perfected
        </p>
      </div>
    </div>
  );
}