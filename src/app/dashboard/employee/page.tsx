"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  LogIn,
  LogOut,
  Timer,
  History,
  Bell,
  ListTodo,
  PlaneTakeoff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import WeeklyChart from "@/components/WeeklyChart";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type WeeklyChartItem = {
  date: string;
  present: number;
  absent: number;
};

type DashboardData = {
  today?: {
    status?: string;
    checkInTime?: string;
    checkOutTime?: string;
    workedHours?: number;
  };
  thisMonth?: {
    present?: number;
    totalWorkingDays?: number;
    attendanceRate?: number;
  };
  leave?: {
    total?: number;
  };
  weeklyChart?: WeeklyChartItem[];
};

export default function EmployeeDashboard() {
  const { data: session, status } = useSession();
  const greeting = useMemo(() => getGreeting(), []);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "employee") {
      fetchDashboard();
    }
  }, [session]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safely format times
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "--:--";
    return new Date(timeStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Derive Today's Shift State
  const shiftStatus = useMemo(() => {
    if (!data?.today) return "loading";
    if (data.today.status === "not_checked_in") return "absent";
    if (data.today.checkOutTime) return "completed";
    return "active"; // Checked in but no check out
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="h-12 w-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-6 w-64 bg-slate-200 rounded-xl animate-pulse" />

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-2xl animate-pulse border"
              />
            ))}
          </div>

          {/* Today Status Skeleton */}
          <div className="h-32 bg-white rounded-2xl animate-pulse border" />

          {/* Chart Skeleton */}
          <div className="h-80 bg-white rounded-2xl animate-pulse border" />

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl animate-pulse border"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "employee") return null;

  const userName =
    session.user?.name?.split(" ")[0] ||
    session.user?.email?.split("@")[0] ||
    "Team Member";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-200">
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
              <p className="text-slate-600 mt-1 text-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                PRESENT THIS MONTH
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {data?.thisMonth?.present || 0}/
                {data?.thisMonth?.totalWorkingDays || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                ATTENDANCE RATE
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {data?.thisMonth?.attendanceRate || 0}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <PlaneTakeoff className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                LEAVE BALANCE
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {data?.leave?.total ?? "N/A"} Days
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Premium Today's Shift Status Banner */}
        <div
          className={`rounded-2xl p-6 md:p-8 border mb-8 transition-all ${
            shiftStatus === "active"
              ? "bg-gradient-to-r from-emerald-50 to-white border-emerald-200"
              : shiftStatus === "completed"
                ? "bg-gradient-to-r from-slate-50 to-white border-slate-200"
                : "bg-gradient-to-r from-red-50 to-white border-red-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Status Indicator */}
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  shiftStatus === "active"
                    ? "bg-emerald-100"
                    : shiftStatus === "completed"
                      ? "bg-slate-200"
                      : "bg-red-100"
                }`}
              >
                {shiftStatus === "active" ? (
                  <div className="relative">
                    <Timer className="w-7 h-7 text-emerald-600" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                ) : shiftStatus === "completed" ? (
                  <CheckCircle2 className="w-7 h-7 text-slate-600" />
                ) : (
                  <AlertCircle className="w-7 h-7 text-red-500" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Today&apos;s Shift
                </h2>
                <p
                  className={`text-sm font-medium mt-0.5 ${
                    shiftStatus === "active"
                      ? "text-emerald-600"
                      : shiftStatus === "completed"
                        ? "text-slate-500"
                        : "text-red-500"
                  }`}
                >
                  {shiftStatus === "active"
                    ? "Currently Working"
                    : shiftStatus === "completed"
                      ? "Shift Completed"
                      : "Not Checked In Yet"}
                </p>
              </div>
            </div>

            {/* Right: Time Metrics */}
            <div className="flex items-center gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <LogIn className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Check In
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatTime(data?.today?.checkInTime)}
                </p>
              </div>

              <div className="w-px h-10 bg-slate-200" />

              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Check Out
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatTime(data?.today?.checkOutTime)}
                </p>
              </div>

              <div className="w-px h-10 bg-slate-200" />

              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Hours
                  </span>
                </div>
                <p className="text-2xl font-bold text-teal-600">
                  {data?.today?.workedHours || 0}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        {data?.weeklyChart && (
          <div className="mb-8">
            <WeeklyChart data={data.weeklyChart} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Link
              href="/dashboard/employee/attendance"
              className="group bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-6 flex gap-5 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Mark Attendance
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check-in or check-out
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-emerald-500 self-center group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/dashboard/employee/attendance/history"
              className="group bg-white border border-slate-100 hover:border-teal-200 rounded-2xl p-6 flex gap-5 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <History className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                  Attendance History
                </h3>
                <p className="text-xs text-slate-500 mt-1">View past records</p>
              </div>
              <ArrowRight className="w-5 h-5 text-teal-300 group-hover:text-teal-500 self-center group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/dashboard/employee/leave"
              className="group bg-white border border-slate-100 hover:border-amber-200 rounded-2xl p-6 flex gap-5 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <PlaneTakeoff className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Apply for Leave
                </h3>
                <p className="text-xs text-slate-500 mt-1">Submit a request</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-300 group-hover:text-amber-500 self-center group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/dashboard/employee/tasks"
              className="group bg-white border border-slate-100 hover:border-violet-200 rounded-2xl p-6 flex gap-5 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                  My Tasks
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  View assigned work
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-violet-300 group-hover:text-violet-500 self-center group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/dashboard/employee/notices"
              className="group bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-6 flex gap-5 transition-all hover:shadow-md sm:col-span-2 lg:col-span-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Notices & Announcements
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Stay updated with the latest company news and updates from
                  admin
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-300 group-hover:text-blue-500 self-center group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xl font-semibold text-slate-900 capitalize">
                  {session.user?.name || userName}
                </p>
                <span className="px-4 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  👤 Team Member
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {session.user?.email}
              </p>
            </div>

            <div className="hidden md:block text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Portal Access
              </div>
              <div className="font-medium text-slate-700 text-sm mt-1">
                Employee Portal
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-10">
        Homeasy • Smart Living, Perfected
      </div>
    </div>
  );
}
