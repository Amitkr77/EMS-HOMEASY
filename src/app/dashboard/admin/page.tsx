"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Calendar,
  ArrowRight,
  UserCheck,
  UserX,
  Clock,
  Building2,
  Activity,
  UserPlus,
  ZoomIn,
  X,
} from "lucide-react";
import Link from "next/link";

// Types based on your API response
interface DashboardData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  leaveToday: number;
  attendanceRate: number;
  recentEmployees: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
  departmentStats: {
    _id: string;
    count: number;
  }[];
  recentAttendance: {
    _id: string;
    employeeId: {
      _id: string;
      name: string;
      email: string;
    };
    date: string;
    status: string;
    checkIn: {
      time: string;
      imageUrl: string;
      location: {
        type: string;
        coordinates: number[];
      };
    };
    createdAt: string;
  }[];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate max department count for the bar chart widths
  const maxDeptCount = useMemo(() => {
    if (!data?.departmentStats?.length) return 1;
    return Math.max(...data.departmentStats.map((d) => d.count));
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="h-12 w-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-6 w-64 bg-slate-200 rounded-xl animate-pulse" />

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-3xl animate-pulse border"
              />
            ))}
          </div>

          {/* Middle Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-white rounded-3xl animate-pulse border" />
            <div className="h-64 bg-white rounded-3xl animate-pulse border" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || !data) return null;

  const isAdmin = session.user?.role === "admin";
  const userName =
    session.user?.name?.split(" ")[0] ||
    session.user?.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
              H
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                {greeting},{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                  {userName}
                </span>{" "}
                👋
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Welcome back to Homeasy • Smart Living, Perfected
              </p>
            </div>
          </div>

          <div className="hidden md:block text-right mt-4 md:mt-0">
            <p className="text-sm font-semibold text-slate-700">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Team */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                  Total Team
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-3">
                  {data.totalEmployees}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Registered members
                </p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Present Today */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                  Present Today
                </p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">
                  {data.presentToday}
                </p>
                <p className="text-xs text-emerald-500 mt-2">Active now</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Absent Today */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                  Absent Today
                </p>
                <p className="text-4xl font-bold text-red-600 mt-3">
                  {data.absentToday}
                </p>
                <p className="text-xs text-red-400 mt-2">Not checked in</p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <UserX className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </div>

          {/* On Leave */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                  On Leave
                </p>
                <p className="text-4xl font-bold text-amber-600 mt-3">
                  {data.leaveToday}
                </p>
                <p className="text-xs text-amber-400 mt-2">Approved leaves</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Rate, Departments, & Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left: Attendance Rate & Departments */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Attendance Rate */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-slate-900">
                    Today&apos;s Rate
                  </h3>
                </div>

                <div className="relative w-36 h-36 mx-auto mb-6">
                  <svg
                    className="w-36 h-36 transform -rotate-90"
                    viewBox="0 0 144 144"
                  >
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="#f1f5f9"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${(data.attendanceRate / 100) * 377} 377`}
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">
                      {data.attendanceRate}%
                    </span>
                    <span className="text-xs text-slate-500">Efficiency</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{" "}
                    Present
                  </span>
                  <span className="font-medium">{data.presentToday}</span>
                </div>
              </div>

              {/* Department Breakdown */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">Departments</h3>
                </div>

                <div className="space-y-5">
                  {data.departmentStats.map((dept) => (
                    <div key={dept._id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-700">
                          {dept._id}
                        </span>
                        <span className="text-slate-500">
                          {dept.count} members
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max((dept.count / maxDeptCount) * 100, 10)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.departmentStats.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No department data
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Activity Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <h3 className="font-semibold text-slate-900">Live Activity</h3>
              </div>
              <Link
                href="/dashboard/admin/attendance"
                className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
              {data.recentAttendance.length > 0 ? (
                data.recentAttendance.map((att) => (
                  <div
                    key={att._id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {att.checkIn?.imageUrl ? (
                      <button
                        onClick={() => setPreviewImage(att.checkIn.imageUrl)}
                        className="relative group w-10 h-10 rounded-lg overflow-hidden border-2 border-slate-100 group-hover:border-teal-400 flex-shrink-0 transition-colors cursor-pointer"
                      >
                        <img
                          src={att.checkIn.imageUrl}
                          alt={att.employeeId?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                        N/A
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {att.employeeId?.name}
                      </p>
                      <p className="text-xs text-slate-500">Checked in</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-slate-700">
                        {new Date(att.checkIn.time).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm py-10">
                  No activity yet today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Joins & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Recent Employees Added */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Recent Additions
                </h3>
              </div>
              <Link
                href="/dashboard/admin/employees"
                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                All Team <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {data.recentEmployees.length > 0 ? (
                data.recentEmployees.map((emp) => (
                  <div
                    key={emp._id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {emp.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {emp.email}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500">
                        Joined{" "}
                        {new Date(emp.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">
                  No recent additions
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 px-2">
              <Activity className="w-5 h-5 text-slate-600" />
              Quick Actions
            </h3>

            {isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/admin/employees"
                  className="group bg-white border border-slate-100 hover:border-teal-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                      Manage Team
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Add or edit members
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-teal-300 group-hover:text-teal-500 self-center group-hover:translate-x-1 transition-all hidden sm:block" />
                </Link>

                <Link
                  href="/dashboard/admin/attendance"
                  className="group bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Attendance
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      View logs & export
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-emerald-500 self-center group-hover:translate-x-1 transition-all hidden sm:block" />
                </Link>

                {/* Placeholder for future features */}
                <Link
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="group bg-white border border-slate-100 hover:border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md opacity-60 pointer-events-none"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      Leave Approvals
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Coming soon</p>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/employee/attendance"
                  className="group bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-6 flex gap-4 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Mark Attendance
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Check-in for today
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-emerald-500 self-center group-hover:translate-x-1 transition-all hidden sm:block" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-xl font-semibold text-slate-900 capitalize">
                  {session.user?.name || userName}
                </p>
                <span className="px-4 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  🛡️ Administrator
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {session.user?.email}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs text-slate-400">CURRENT ROLE</div>
              <div className="font-medium text-slate-700 mt-1">Full Access</div>
            </div>
          </div>
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
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <X className="w-5 h-5" />
              Close
            </button>
            <img
              src={previewImage}
              alt="Check-in preview"
              className="w-full rounded-2xl shadow-2xl"
            />
            <p className="text-center text-white/50 text-sm mt-4">
              Employee Check-in Verification
            </p>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="text-center mt-16 text-xs text-slate-400">
        Homeasy • Smart Living, Perfected
      </div>
    </div>
  );
}
