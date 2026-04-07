"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";

type AttendanceRecord = {
  _id: string;
  date: string;
  checkIn?: { time: string };
  checkOut?: { time: string };
  hoursWorked?: number;
  status?: string;
};

export default function HomeasyEmployeeAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance/history");
      const data = await res.json();
      setAttendance(data);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

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
    return new Date(timeStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (hours?: number) => {
    if (!hours) return { label: "Absent", color: "bg-red-100 text-red-700" };
    if (hours >= 8) return { label: "Present", color: "bg-emerald-100 text-emerald-700" };
    return { label: "Half Day", color: "bg-amber-100 text-amber-700" };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">My Attendance</h1>
            <p className="text-slate-600 mt-1">Track your daily check-ins and work hours</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">THIS MONTH</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {attendance.filter(a => a.hoursWorked && a.hoursWorked >= 8).length}
            </p>
            <p className="text-emerald-600 text-sm mt-1">Full Days</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">TOTAL HOURS</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)}
            </p>
            <p className="text-teal-600 text-sm mt-1">Hours Worked</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">ATTENDANCE RATE</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {attendance.length > 0 
                ? Math.round((attendance.filter(a => a.hoursWorked && a.hoursWorked >= 8).length / attendance.length) * 100)
                : 0}%
            </p>
            <p className="text-emerald-600 text-sm mt-1">This month</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="font-semibold text-slate-900">Attendance History</h2>
            <p className="text-sm text-slate-500">Showing all records</p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading your attendance records...</div>
          ) : attendance.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
                📅
              </div>
              <h3 className="text-xl font-semibold text-slate-700">No records yet</h3>
              <p className="text-slate-500 mt-2">Your attendance history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-8 py-6 text-left font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Check In</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Check Out</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Hours Worked</th>
                    <th className="px-8 py-6 text-center font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((record) => {
                    const status = getStatus(record.hoursWorked);
                    return (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-medium text-slate-900">
                          {formatDate(record.date)}
                        </td>

                        <td className="px-6 py-6 text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {formatTime(record.checkIn?.time)}
                          </div>
                        </td>

                        <td className="px-6 py-6 text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {formatTime(record.checkOut?.time)}
                          </div>
                        </td>

                        <td className="px-6 py-6 font-semibold text-slate-900">
                          {record.hoursWorked ? `${record.hoursWorked.toFixed(1)} hrs` : "—"}
                        </td>

                        <td className="px-8 py-6 text-center">
                          <span className={`inline-block px-5 py-1.5 text-sm font-medium rounded-3xl ${status.color}`}>
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

        <p className="text-center text-xs text-slate-400 mt-10">
          Homeasy • Smart Living, Perfected
        </p>
      </div>
    </div>
  );
}