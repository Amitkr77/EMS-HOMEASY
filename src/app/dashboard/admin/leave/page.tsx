"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldX,
  ListFilter,
  FileText,
} from "lucide-react";

type LeaveRequest = {
  _id: string;
  employeeId?: { name: string; email?: string } | string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  createdAt?: string;
};

export default function HomeasyAdminLeave() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch("/api/leave/admin");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setLeaveRequests(Array.isArray(result) ? result : []);
    } catch {
      showNotification("error", "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/leave/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) throw new Error("Action failed");

      showNotification("success", `Leave request ${action} successfully`);
      fetchLeaveRequests();
    } catch {
      showNotification("error", "Failed to update leave request");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Safe Data Parsers
  const getEmployeeName = (leave: LeaveRequest) =>
    typeof leave.employeeId === "object"
      ? leave.employeeId?.name || "Unknown"
      : "Unknown";

  const getEmployeeEmail = (leave: LeaveRequest) =>
    typeof leave.employeeId === "object" ? leave.employeeId?.email || "" : "";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs < 0) return null;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return `${days} Day${days > 1 ? "s" : ""}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case "rejected":
        return {
          color: "bg-red-50 text-red-500 border border-red-100",
          icon: <ShieldX className="w-3.5 h-3.5" />,
        };
      default:
        return {
          color: "bg-amber-50 text-amber-600 border border-amber-100",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  // ✅ Filtering Logic
  const filteredLeaves = useMemo(() => {
    if (statusFilter === "all") return leaveRequests;
    return leaveRequests.filter((l) => l.status.toLowerCase() === statusFilter);
  }, [leaveRequests, statusFilter]);

  // ✅ Stats Calculation
  const stats = useMemo(() => {
    const pending = leaveRequests.filter(
      (l) => l.status.toLowerCase() === "pending",
    ).length;
    const approved = leaveRequests.filter(
      (l) => l.status.toLowerCase() === "approved",
    ).length;
    const rejected = leaveRequests.filter(
      (l) => l.status.toLowerCase() === "rejected",
    ).length;
    return { total: leaveRequests.length, pending, approved, rejected };
  }, [leaveRequests]);

  const filterOptions = [
    { value: "all", label: "All Requests" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Leave Requests
            </h1>
            <p className="text-slate-600 mt-1">
              Review and manage team leave applications
            </p>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-medium transition-all duration-300 ${
              notification.type === "success" ? "bg-teal-600" : "bg-red-600"
            }`}
          >
            {notification.type === "success" ? "✅" : "⚠️"}{" "}
            {notification.message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "TOTAL REQUESTS",
              value: stats.total,
              color: "text-slate-900",
              bg: "bg-indigo-50",
              iconBg: "bg-indigo-100",
              icon: <FileText className="w-5 h-5 text-indigo-600" />,
            },
            {
              label: "PENDING",
              value: stats.pending,
              color: "text-amber-600",
              bg: "bg-amber-50",
              iconBg: "bg-amber-100",
              icon: <Clock className="w-5 h-5 text-amber-600" />,
            },
            {
              label: "APPROVED",
              value: stats.approved,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              iconBg: "bg-emerald-100",
              icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
            },
            {
              label: "REJECTED",
              value: stats.rejected,
              color: "text-red-500",
              bg: "bg-red-50",
              iconBg: "bg-red-100",
              icon: <XCircle className="w-5 h-5 text-red-500" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-2xl p-5 border border-transparent`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <ListFilter className="w-5 h-5 text-slate-400" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === opt.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="flex-1 h-5 bg-slate-200 rounded" />
                  <div className="w-32 h-5 bg-slate-200 rounded" />
                  <div className="w-24 h-5 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl border border-slate-100">
                📅
              </div>
              <h3 className="text-xl font-semibold text-slate-700">
                {statusFilter !== "all"
                  ? `No ${statusFilter} requests`
                  : "No leave requests yet"}
              </h3>
              <p className="text-slate-500 mt-2 text-sm">
                {statusFilter !== "all"
                  ? "There are no requests matching this filter."
                  : "When team members apply for leave, they will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 text-sm">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 text-sm">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 text-sm">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 text-sm">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600 text-sm">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeaves.map((leave) => {
                    const statusConfig = getStatusConfig(leave.status);
                    const isPending = leave.status.toLowerCase() === "pending";
                    const isProcessing = processingId === leave._id;
                    const duration = getDuration(
                      leave.startDate,
                      leave.endDate,
                    );
                    const name = getEmployeeName(leave);
                    const email = getEmployeeEmail(leave);

                    return (
                      <tr
                        key={leave._id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        {/* Employee Info */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {name}
                              </p>
                              <p className="text-xs text-slate-500">{email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td className="px-6 py-5">
                          <span className="inline-block px-3 py-1 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg capitalize border border-slate-100">
                            {leave.leaveType}
                          </span>
                        </td>

                        {/* Dates & Duration */}
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-700 font-medium">
                            {formatDate(leave.startDate)} —{" "}
                            {formatDate(leave.endDate)}
                          </div>
                          {duration && (
                            <div className="text-xs text-teal-600 font-semibold mt-0.5 bg-teal-50 px-2 py-0.5 rounded-md w-fit">
                              {duration}
                            </div>
                          )}
                        </td>

                        {/* Reason */}
                        <td
                          className="px-6 py-5 text-sm text-slate-500 max-w-[200px] truncate"
                          title={leave.reason || "No reason provided"}
                        >
                          {leave.reason || (
                            <span className="italic text-slate-400">
                              No reason provided
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg capitalize ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {leave.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          {isPending ? (
                            <div className="flex gap-2 justify-end opacity-100">
                              <button
                                onClick={() =>
                                  handleAction(leave._id, "approved")
                                }
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-70 shadow-sm"
                              >
                                {isProcessing ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleAction(leave._id, "rejected")
                                }
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-70"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 font-medium italic">
                              Processed
                            </div>
                          )}
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
