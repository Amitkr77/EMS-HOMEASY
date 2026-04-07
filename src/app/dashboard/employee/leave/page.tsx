"use client";

import { useState } from "react";
import { Clock, Send } from "lucide-react";

export default function HomeasyApplyLeave() {
  const [form, setForm] = useState({
    leaveType: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const leaveTypes = [
    { value: "casual", label: "Casual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "paid", label: "Paid Leave" },
    { value: "emergency", label: "Emergency Leave" },
  ];

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leave/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        // Reset form after success
        setForm({
          leaveType: "casual",
          startDate: "",
          endDate: "",
          reason: "",
        });
      }
    } catch {
      setError("Failed to submit leave request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Apply for Leave</h1>
            <p className="text-slate-600 mt-1">Request time off from your Homeasy team</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-semibold text-emerald-700">Leave Request Submitted!</h3>
            <p className="text-emerald-600 mt-2">Your manager will review it shortly.</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 text-emerald-700 font-medium hover:underline"
            >
              Submit Another Request
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
          <div className="space-y-8">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Leave Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {leaveTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setForm({ ...form, leaveType: type.value })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      form.leaveType === type.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-6 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-6 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Duration Display */}
            {form.startDate && form.endDate && (
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm">
                <span className="font-medium text-teal-700">
                  Total Days: {calculateDays()} day{calculateDays() > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Reason for Leave
              </label>
              <textarea
                placeholder="Please provide a detailed reason..."
                className="w-full h-40 px-6 py-5 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all resize-y min-h-[140px]"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !form.startDate || !form.endDate || !form.reason.trim()}
            className="mt-10 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-4 rounded-3xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-teal-200"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Leave Request
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Your leave request will be reviewed by the admin • Homeasy • Smart Living, Perfected
        </p>
      </div>
    </div>
  );
}