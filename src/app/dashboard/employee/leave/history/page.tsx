"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type LeaveRecord = {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  createdAt?: string;
};

export default function HomeasyLeaveHistory() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveHistory = async () => {
    try {
      const res = await fetch("/api/leave/history");
      const data = await res.json();
      setLeaves(data);
    } catch (error) {
      console.error("Failed to fetch leave history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          label: "Approved",
          color: "bg-emerald-100 text-emerald-700",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-700",
          icon: <XCircle className="w-4 h-4" />,
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-amber-100 text-amber-700",
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          color: "bg-slate-100 text-slate-700",
          icon: null,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">My Leave History</h1>
            <p className="text-slate-600 mt-1">Track all your leave requests and their status</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">TOTAL REQUESTS</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">{leaves.length}</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-emerald-600">APPROVED</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {leaves.filter((l) => l.status.toLowerCase() === "approved").length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-amber-600">PENDING</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {leaves.filter((l) => l.status.toLowerCase() === "pending").length}
            </p>
          </div>
        </div>

        {/* Leave History Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Leave Requests History</h2>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading your leave history...</div>
          ) : leaves.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
                📅
              </div>
              <h3 className="text-xl font-semibold text-slate-700">No leave requests yet</h3>
              <p className="text-slate-500 mt-2">When you apply for leave, they will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-8 py-6 text-left font-semibold text-slate-600">Leave Type</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Dates</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Reason</th>
                    <th className="px-8 py-6 text-center font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((leave) => {
                    const statusConfig = getStatusConfig(leave.status);
                    return (
                      <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <span className="capitalize font-medium text-slate-900">
                            {leave.leaveType}
                          </span>
                        </td>

                        <td className="px-6 py-6 text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                          </div>
                        </td>

                        <td className="px-6 py-6 text-slate-600 max-w-md">
                          {leave.reason || "No reason provided"}
                        </td>

                        <td className="px-8 py-6 text-center">
                          <div className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-3xl text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </div>
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