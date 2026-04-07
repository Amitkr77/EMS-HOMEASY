"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar, User } from "lucide-react";

type Notice = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  // Optional fields if available from backend
  createdBy?: string;
};

export default function HomeasyEmployeeNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notice/all");
      const data = await res.json();
      setNotices(data);
    } catch (error) {
      console.error("Failed to fetch notices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Notices</h1>
            <p className="text-slate-600 mt-1">Important updates from the Homeasy team</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">TOTAL NOTICES</p>
              <p className="text-5xl font-bold text-slate-900 mt-3">{notices.length}</p>
            </div>
            <Bell className="w-16 h-16 text-teal-200" />
          </div>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-3xl py-20 text-center border border-slate-100">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-6xl">
              📢
            </div>
            <h3 className="text-2xl font-semibold text-slate-700">No notices yet</h3>
            <p className="text-slate-500 mt-3 max-w-sm mx-auto">
              Important announcements and updates from the team will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {notices.map((notice, index) => (
              <div
                key={notice._id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-all group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Bell className="w-6 h-6 text-teal-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-semibold text-slate-900 leading-tight group-hover:text-teal-600 transition-colors">
                      {notice.title}
                    </h2>

                    <p className="mt-4 text-slate-700 leading-relaxed text-[15.5px]">
                      {notice.message}
                    </p>

                    <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(notice.createdAt)}
                      </div>
                      {notice.createdBy && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          Posted by Admin
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-12">
          Homeasy • Smart Living, Perfected
        </p>
      </div>
    </div>
  );
}