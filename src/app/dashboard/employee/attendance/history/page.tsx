"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, X, ZoomIn } from "lucide-react";

type AttendanceRecord = {
  _id: string;
  date: string;
  status?: string;
  checkIn?: {
    time: string;
    location?: {
      type: string;
      coordinates: number[];
    };
    imageUrl?: string;
  };
  checkOut?: {
    time?: string;
    location?: {
      coordinates: number[];
    };
  };
};

export default function HomeasyEmployeeAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance/history");
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getHoursWorked = (record: AttendanceRecord): number | null => {
    const inTime = record.checkIn?.time;
    const outTime = record.checkOut?.time;

    if (!inTime) return null;
    if (!outTime) return null;

    const diffMs = new Date(outTime).getTime() - new Date(inTime).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0 || diffHours > 24) return null;
    return Math.round(diffHours * 10) / 10;
  };

  const getStatus = (
    record: AttendanceRecord,
    hours: number | null
  ): { label: string; color: string } => {
    if (record.checkIn?.time && !record.checkOut?.time) {
      return { label: "In Progress", color: "bg-blue-100 text-blue-700" };
    }
    if (!record.checkIn?.time) {
      return { label: "Absent", color: "bg-red-100 text-red-700" };
    }
    if (hours === null) {
      return { label: "Absent", color: "bg-red-100 text-red-700" };
    }
    if (hours >= 8) {
      return { label: "Present", color: "bg-emerald-100 text-emerald-700" };
    }
    if (hours >= 4) {
      return { label: "Half Day", color: "bg-amber-100 text-amber-700" };
    }
    return { label: "Short Day", color: "bg-orange-100 text-orange-700" };
  };

  const stats = useMemo(() => {
    const computed = attendance.map((r) => ({
      hours: getHoursWorked(r),
      hasCheckedIn: !!r.checkIn?.time,
      hasCheckedOut: !!r.checkOut?.time,
    }));

    const fullDays = computed.filter((c) => (c.hours ?? 0) >= 8).length;
    const totalHours = computed.reduce((sum, c) => sum + (c.hours ?? 0), 0);

    const presentDays = computed.filter(
      (c) => c.hasCheckedIn && (c.hasCheckedOut || (c.hours ?? 0) > 0)
    ).length;

    const attendanceRate =
      attendance.length > 0
        ? Math.round((presentDays / attendance.length) * 100)
        : 0;

    return { fullDays, totalHours, attendanceRate };
  }, [attendance]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              My Attendance
            </h1>
            <p className="text-slate-600 mt-1">
              Track your daily check-ins and work hours
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-8 shadow-sm border">
            <p className="text-sm text-slate-500">FULL DAYS</p>
            <p className="text-5xl font-bold mt-4">
              {loading ? "..." : stats.fullDays}
            </p>
            <p className="text-emerald-600 text-sm mt-1">8+ hours</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border">
            <p className="text-sm text-slate-500">TOTAL HOURS</p>
            <p className="text-5xl font-bold mt-4">
              {loading ? "..." : stats.totalHours.toFixed(1)}
            </p>
            <p className="text-teal-600 text-sm mt-1">Hours worked</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border">
            <p className="text-sm text-slate-500">ATTENDANCE RATE</p>
            <p className="text-5xl font-bold mt-4">
              {loading ? "..." : `${stats.attendanceRate}%`}
            </p>
            <p className="text-emerald-600 text-sm mt-1">This period</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="px-8 py-6 border-b bg-slate-50">
            <h2 className="font-semibold">Attendance History</h2>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              Loading records...
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              No records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-5">Photo</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Check In</th>
                    <th className="px-6 py-5">Check Out</th>
                    <th className="px-6 py-5">Hours</th>
                    <th className="px-8 py-5 text-center">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {attendance.map((record) => {
                    const hours = getHoursWorked(record);
                    const status = getStatus(record, hours);
                    const imageUrl = record.checkIn?.imageUrl;

                    return (
                      <tr key={record._id} className="hover:bg-slate-50">
                        {/* Photo */}
                        <td className="px-6 py-5">
                          {imageUrl ? (
                            <button
                              onClick={() => setPreviewImage(imageUrl)}
                              className="relative group w-11 h-11 rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-teal-400 transition-colors cursor-pointer"
                            >
                              <img
                                src={imageUrl}
                                alt="Check-in"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                              <span className="text-slate-400 text-xs">N/A</span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5 font-medium">
                          {formatDate(record.date)}
                        </td>

                        <td className="px-6 py-5">
                          {formatTime(record.checkIn?.time)}
                        </td>

                        <td className="px-6 py-5">
                          {formatTime(record.checkOut?.time)}
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          {hours !== null
                            ? `${hours.toFixed(1)} hrs`
                            : "—"}
                        </td>

                        <td className="px-8 py-5 text-center">
                          <span
                            className={`px-4 py-1 rounded-2xl text-sm font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <X className="w-5 h-5" />
              Close
            </button>

            {/* Image */}
            <img
              src={previewImage}
              alt="Check-in preview"
              className="w-full rounded-2xl shadow-2xl"
            />

            {/* Caption */}
            <p className="text-center text-white/50 text-sm mt-4">
              Check-in photo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}