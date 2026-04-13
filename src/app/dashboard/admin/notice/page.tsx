"use client";

import { useState } from "react";
import { Send, Bell, Mail, Eye, Megaphone, AlertTriangle, Info, Zap } from "lucide-react";

type PriorityType = "normal" | "important" | "urgent";

export default function HomeasyAdminNotice() {
    const [form, setForm] = useState({
        title: "",
        message: "",
        sendEmail: true,
        priority: "normal" as PriorityType,
    });

    const [submitting, setSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const priorityConfig = {
        normal: { 
            label: "Normal", 
            desc: "Standard update", 
            color: "border-slate-200 hover:border-slate-300 bg-white text-slate-700", 
            activeColor: "border-slate-900 bg-slate-50 text-slate-900",
            icon: <Info className="w-5 h-5" />,
            dot: "bg-slate-400",
            badge: "bg-slate-100 text-slate-600"
        },
        important: { 
            label: "Important", 
            desc: "Action may be required", 
            color: "border-amber-200 hover:border-amber-300 bg-white text-amber-700", 
            activeColor: "border-amber-400 bg-amber-50 text-amber-800",
            icon: <Megaphone className="w-5 h-5" />,
            dot: "bg-amber-500",
            badge: "bg-amber-100 text-amber-700"
        },
        urgent: { 
            label: "Urgent", 
            desc: "Immediate attention", 
            color: "border-red-200 hover:border-red-300 bg-white text-red-700", 
            activeColor: "border-red-400 bg-red-50 text-red-800",
            icon: <AlertTriangle className="w-5 h-5" />,
            dot: "bg-red-500",
            badge: "bg-red-100 text-red-700"
        },
    };

    const validateForm = () => {
        const newErrors: { title?: string; message?: string } = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        else if (form.title.length > 100) newErrors.title = "Title must be under 100 characters";
        if (!form.message.trim()) newErrors.message = "Message cannot be empty";
        else if (form.message.length > 2000) newErrors.message = "Message must be under 2000 characters";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

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
                resetForm();
            }
        } catch {
            showNotification("error", "Failed to send notice. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setForm({ title: "", message: "", sendEmail: true, priority: "normal" });
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
                            <Bell className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Send Notice</h1>
                            <p className="text-slate-600 mt-1">Broadcast updates to your Homeasy team</p>
                        </div>
                    </div>

                    {/* Desktop Preview Toggle */}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            showPreview 
                                ? "bg-slate-900 text-white" 
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                </div>

                {/* Notification Toast */}
                {notification && (
                    <div
                        className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-medium transition-all duration-300 ${
                            notification.type === "success" ? "bg-teal-600" : "bg-red-600"
                        }`}
                    >
                        {notification.type === "success" ? "✅" : "⚠️"} {notification.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 h-fit">
                        <div className="space-y-7">
                            
                            {/* Title Field */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Notice Title <span className="text-red-400">*</span>
                                    </label>
                                    <span className={`text-xs font-medium ${form.title.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {form.title.length}/100
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    maxLength={100}
                                    placeholder="e.g. Emergency Maintenance Schedule"
                                    className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm ${
                                        errors.title ? "border-red-300 bg-red-50/30" : "border-slate-200"
                                    }`}
                                    value={form.title}
                                    onChange={(e) => {
                                        setForm({ ...form, title: e.target.value });
                                        if (errors.title) setErrors({ ...errors, title: undefined });
                                    }}
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.title}</p>}
                            </div>

                            {/* Message Field */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Message <span className="text-red-400">*</span>
                                    </label>
                                    <span className={`text-xs font-medium ${form.message.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {form.message.length}/2000
                                    </span>
                                </div>
                                <textarea
                                    maxLength={2000}
                                    placeholder="Write your notice here... Be clear and concise."
                                    className={`w-full h-44 px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none text-sm leading-relaxed ${
                                        errors.message ? "border-red-300 bg-red-50/30" : "border-slate-200"
                                    }`}
                                    value={form.message}
                                    onChange={(e) => {
                                        setForm({ ...form, message: e.target.value });
                                        if (errors.message) setErrors({ ...errors, message: undefined });
                                    }}
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.message}</p>}
                            </div>

                            {/* Priority Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Priority Level
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(priorityConfig).map(([key, config]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setForm({ ...form, priority: key as PriorityType })}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                form.priority === key ? config.activeColor : config.color
                                            }`}
                                        >
                                            <div className={`mb-1 ${form.priority !== key ? 'opacity-50' : ''}`}>
                                                {config.icon}
                                            </div>
                                            <p className={`font-semibold text-xs ${form.priority === key ? 'text-current' : 'text-slate-700'}`}>
                                                {config.label}
                                            </p>
                                            <p className={`text-[10px] mt-0.5 leading-tight ${form.priority === key ? 'text-current opacity-70' : 'text-slate-500'}`}>
                                                {config.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Email Option */}
                            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Send via Email</p>
                                        <p className="text-xs text-slate-500">Notify team instantly</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.sendEmail}
                                        onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-10 pt-8 border-t border-slate-100">
                            <button
                                onClick={resetForm}
                                disabled={submitting}
                                className="flex-1 py-3.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-2xl transition-colors text-sm disabled:opacity-50"
                            >
                                Clear
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !form.title.trim() || !form.message.trim()}
                                className="flex-[2] py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm shadow-lg shadow-teal-600/20"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Broadcasting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Notice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Live Preview Panel */}
                    <div className="h-fit">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700"
                        >
                            <Eye className="w-4 h-4" />
                            {showPreview ? "Hide Preview" : "Show Preview"}
                        </button>

                        <div className={`bg-slate-100 rounded-3xl p-6 border border-slate-200 transition-all duration-300 ${showPreview ? "block" : "hidden lg:block"}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Preview</p>
                            </div>

                            {/* The Notice Card itself */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                {/* Notice Header */}
                                <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${
                                    form.priority === "urgent" ? "bg-red-50" : 
                                    form.priority === "important" ? "bg-amber-50" : "bg-slate-50"
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            form.priority === "urgent" ? "bg-red-100" : 
                                            form.priority === "important" ? "bg-amber-100" : "bg-slate-200"
                                        }`}>
                                            {form.priority === "urgent" ? <Zap className="w-4 h-4 text-red-600" /> : 
                                             form.priority === "important" ? <Megaphone className="w-4 h-4 text-amber-600" /> : 
                                             <Bell className="w-4 h-4 text-slate-600" />}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wide ${
                                                form.priority === "urgent" ? "text-red-600" : 
                                                form.priority === "important" ? "text-amber-600" : "text-slate-500"
                                            }`}>
                                                {priorityConfig[form.priority].label}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>

                                {/* Notice Body */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 min-h-[28px]">
                                        {form.title.trim() || <span className="text-slate-300 italic font-medium">Notice title will appear here...</span>}
                                    </h3>
                                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                                        {form.message.trim() || <span className="text-slate-300 italic">Notice message content will appear here...</span>}
                                    </div>
                                </div>

                                {/* Notice Footer */}
                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {form.sendEmail ? "Email notification enabled" : "Dashboard only"}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500">Homeasy Admin</p>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                                This is exactly how the notice will appear on the employee&apos;s dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-10">
                    Homeasy • Smart Living, Perfected
                </p>
            </div>
        </div>
    );
}