"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";

export default function HomeasyDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 w-80 bg-slate-200 rounded-2xl animate-pulse mb-3" />
          <div className="h-6 w-96 bg-slate-200 rounded-xl animate-pulse mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isAdmin = session.user?.role === "admin";
  const greeting = getGreeting();
  const userName = session.user?.name?.split(" ")[0] || 
                  session.user?.email?.split("@")[0] || "Team Member";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-inner">
              H
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">{userName}</span> 👋
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
                day: "numeric" 
              })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date().toLocaleTimeString("en-IN", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 tracking-widest">
                  {isAdmin ? "TOTAL TEAM" : "THIS MONTH"}
                </p>
                <p className="text-5xl font-bold text-slate-900 mt-6">—</p>
                <p className="flex items-center gap-2 mt-4 text-xs font-medium text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  All time
                </p>
              </div>
              <div className="w-16 h-16 bg-teal-100 rounded-3xl flex items-center justify-center">
                <Users className="w-9 h-9 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 tracking-widest">
                  {isAdmin ? "PRESENT TODAY" : "ATTENDANCE RATE"}
                </p>
                <p className="text-5xl font-bold text-slate-900 mt-6">—</p>
                <p className="flex items-center gap-2 mt-4 text-xs font-medium text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  This month
                </p>
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                <Calendar className="w-9 h-9 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 tracking-widest">
                  {isAdmin ? "PENDING LEAVES" : "LEAVE BALANCE"}
                </p>
                <p className="text-5xl font-bold text-slate-900 mt-6">—</p>
                <p className="flex items-center gap-2 mt-4 text-xs font-medium text-amber-600">
                  <Clock className="w-4 h-4" />
                  Updated just now
                </p>
              </div>
              <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center">
                <Clock className="w-9 h-9 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isAdmin ? (
              <>
                <Link 
                  href="/dashboard/admin/employees" 
                  className="group bg-white border border-slate-100 hover:border-teal-200 rounded-3xl p-8 flex gap-6 transition-all hover:shadow-md"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-xl text-slate-900 group-hover:text-teal-600 transition-colors">
                      Manage Team
                    </h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Add, edit, or view all Homeasy team members and their details.
                    </p>
                  </div>
                  <div className="self-center text-teal-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </Link>

                <Link 
                  href="/dashboard/admin/attendance" 
                  className="group bg-white border border-slate-100 hover:border-emerald-200 rounded-3xl p-8 flex gap-6 transition-all hover:shadow-md"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Attendance Overview
                    </h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Track daily attendance, hours worked, and team performance.
                    </p>
                  </div>
                  <div className="self-center text-emerald-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard/employee/attendance" 
                  className="group bg-white border border-slate-100 hover:border-emerald-200 rounded-3xl p-8 flex gap-6 transition-all hover:shadow-md"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Mark Attendance
                    </h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Check-in or check-out for today’s work
                    </p>
                  </div>
                  <div className="self-center text-emerald-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </Link>

                <Link 
                  href="/dashboard/employee/leave" 
                  className="group bg-white border border-slate-100 hover:border-amber-200 rounded-3xl p-8 flex gap-6 transition-all hover:shadow-md"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-xl text-slate-900 group-hover:text-amber-600 transition-colors">
                      Apply for Leave
                    </h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Submit and track your leave requests
                    </p>
                  </div>
                  <div className="self-center text-amber-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold text-slate-900 capitalize">{userName}</p>
                <span className={`px-5 py-1.5 rounded-3xl text-sm font-medium ${
                  isAdmin 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {isAdmin ? "🛡️ Administrator" : "👤 Team Member"}
                </span>
              </div>
              <p className="text-slate-600 mt-1">{session.user?.email}</p>
            </div>

            <div className="hidden md:block text-right">
              <div className="text-xs text-slate-400">CURRENT ROLE</div>
              <div className="font-medium text-slate-700 mt-1">
                {isAdmin ? "Full Access" : "Employee Portal"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-16 text-xs text-slate-400">
        Homeasy • Smart Living, Perfected
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}