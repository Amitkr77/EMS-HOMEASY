"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading only while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          {/* Homeasy Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl animate-pulse">
              H
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            <span className="text-slate-400 font-medium">Connecting to Homeasy...</span>
          </div>

          <p className="text-xs text-slate-500">Smart Living • Perfected</p>
        </div>
      </div>
    );
  }

  // Fallback loading state (in case of delay)
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
          H
        </div>

        <h1 className="text-2xl font-semibold text-white mb-2">Homeasy Portal</h1>
        <p className="text-slate-400 mb-8">Redirecting you securely...</p>

        <div className="flex justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}