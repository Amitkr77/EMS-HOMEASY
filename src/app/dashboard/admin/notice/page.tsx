"use client";

import { useState } from "react";
import { Send, Bell, Mail, X } from "lucide-react";

export default function HomeasyAdminNotice() {
    const [form, setForm] = useState({
        title: "",
        message: "",
        sendEmail: true,
    });

    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            return showNotification("error", "Please enter both title and message");
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/notice/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.error) {
                showNotification("error", data.error);
            } else {
                showNotification("success", "Notice sent successfully to the team!");
                // Reset form after successful send
                setForm({
                    title: "",
                    message: "",
                    sendEmail: true,
                });
            }
        } catch {
            showNotification("error", "Failed to send notice. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
                        <Bell className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Send Notice</h1>
                        <p className="text-slate-600 mt-1">Broadcast important updates to your Homeasy team</p>
                    </div>
                </div>

                {/* Notification Toast */}
                {notification && (
                    <div
                        className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 text-white font-medium transition-all ${
                            notification.type === "success" ? "bg-teal-600" : "bg-red-600"
                        }`}
                    >
                        {notification.type === "success" ? "✅" : "⚠️"} {notification.message}
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
                    <div className="space-y-8">
                        {/* Title Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Notice Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Emergency Maintenance Schedule"
                                className="w-full px-6 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all text-lg"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        {/* Message Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Message
                            </label>
                            <textarea
                                placeholder="Write your notice here... Be clear and concise."
                                className="w-full h-48 px-6 py-5 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all resize-y min-h-[180px] text-base"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                        </div>

                        {/* Email Option */}
                        <div className="flex items-center justify-between bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Send via Email</p>
                                    <p className="text-sm text-slate-500">Notify team members instantly</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.sendEmail}
                                    onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-12">
                        <button
                            onClick={() => {
                                setForm({ title: "", message: "", sendEmail: true });
                            }}
                            className="flex-1 py-4 text-slate-600 font-semibold hover:bg-slate-100 rounded-3xl transition-colors"
                        >
                            Clear
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !form.title.trim() || !form.message.trim()}
                            className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-3xl transition-all flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending Notice...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send Notice to Team
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Helpful Tip */}
                <div className="mt-8 text-center text-sm text-slate-400">
                    Notices will be visible to all active team members on their dashboard.
                </div>
            </div>
        </div>
    );
}