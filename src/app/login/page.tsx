"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function HomeasyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(at_30%_20%,rgba(45,212,191,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(at_70%_60%,rgba(103,232,249,0.12),transparent)]" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-80 h-80 border border-teal-500/20 rounded-full" />
        <div className="absolute bottom-32 right-20 w-96 h-96 border border-cyan-400/10 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-xl">
                H
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tighter">Homeasy</h1>
                <p className="text-teal-400 text-sm -mt-1">Smart Living</p>
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-6xl font-bold leading-none tracking-tighter mb-6">
              Welcome to<br />
              the future<br />
              of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">smart living</span>
            </h2>

            <p className="text-xl text-slate-300 leading-relaxed mb-10">
              Secure access to your Homeasy team portal. 
              Manage your smart home operations effortlessly.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                "Real-time Monitoring",
                "Team Management",
                "Attendance Tracking",
                "Leave Management"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold">
              H
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Homeasy</h1>
              <p className="text-slate-500 text-sm">Team Portal</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Sign In</h2>
            <p className="mt-3 text-slate-600">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
              <div className="mt-0.5">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@homeasy.io"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all text-base pr-14"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-4 rounded-3xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-teal-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400">
              Secured with enterprise-grade encryption • Homeasy © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}