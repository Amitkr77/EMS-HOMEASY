"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Calendar} from "lucide-react";

type LeaveRequest = {
  _id: string;
  employeeId?: { name: string; email?: string };
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
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch("/api/leave/admin");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setLeaveRequests(result);
    } catch {
      showNotification("error", "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);

    try {
      const res = await fetch(`/api/leave/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Action failed");

      showNotification("success", `Leave request ${status} successfully`);
      fetchLeaveRequests();
    } catch {
      showNotification("error", "Failed to update leave request");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Leave Requests</h1>
            <p className="text-slate-600 mt-1">Review and manage team leave applications</p>
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

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Total Requests</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{leaveRequests.length}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-amber-600">Pending</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {leaveRequests.filter((l) => l.status.toLowerCase() === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-emerald-600">Approved This Month</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {leaveRequests.filter((l) => l.status.toLowerCase() === "approved").length}
            </p>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading leave requests...</div>
          ) : leaveRequests.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-4xl">
                📅
              </div>
              <h3 className="text-xl font-semibold text-slate-700">No leave requests yet</h3>
              <p className="text-slate-500 mt-2">When team members apply for leave, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-8 py-6 text-left font-semibold text-slate-600">Employee</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Leave Type</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Dates</th>
                    <th className="px-6 py-6 text-left font-semibold text-slate-600">Reason</th>
                    <th className="px-6 py-6 text-center font-semibold text-slate-600">Status</th>
                    <th className="px-8 py-6 text-right font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-medium">
                            {leave.employeeId?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{leave.employeeId?.name}</p>
                            <p className="text-sm text-slate-500">{leave.employeeId?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-medium rounded-3xl capitalize">
                          {leave.leaveType}
                        </span>
                      </td>

                      <td className="px-6 py-6 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                        </div>
                      </td>

                      <td className="px-6 py-6 text-slate-600 max-w-xs truncate">
                        {leave.reason || "No reason provided"}
                      </td>

                      <td className="px-6 py-6 text-center">
                        <span
                          className={`inline-block px-5 py-1.5 text-sm font-medium rounded-3xl capitalize ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-right">
                        {leave.status.toLowerCase() === "pending" ? (
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => handleAction(leave._id, "approved")}
                              disabled={processingId === leave._id}
                              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-sm font-medium transition-all disabled:opacity-70"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>

                            <button
                              onClick={() => handleAction(leave._id, "rejected")}
                              disabled={processingId === leave._id}
                              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-3xl text-sm font-medium transition-all disabled:opacity-70"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Action completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
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