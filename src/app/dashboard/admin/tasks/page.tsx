"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  Plus,
  Search,
  PlayCircle,
  RotateCcw,
  AlertTriangle,
  Filter,
} from "lucide-react";
import Link from "next/link";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  date: string;
  status: string; // 'pending', 'in-progress', 'completed'
  assignedTo?: { name: string; email?: string };
  createdAt?: string;
};

export default function HomeasyAllTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Enhanced States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const fetchAllTasks = async () => {
    try {
      const res = await fetch("/api/tasks/all");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAllTasks();
    } catch (error) {
      console.error("Task status update failed:", error);
      alert("Failed to update task status");
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "bg-red-50 text-red-600 border border-red-100",
          icon: <Flag className="w-3.5 h-3.5" />,
          label: "High",
        };
      case "medium":
        return {
          color: "bg-amber-50 text-amber-600 border border-amber-100",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: "Medium",
        };
      case "low":
        return {
          color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: "Low",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-600 border border-slate-100",
          icon: null,
          label: priority,
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "in-progress":
        return {
          color: "bg-blue-50 text-blue-600 border border-blue-100",
          label: "In Progress",
        };
      case "completed":
        return {
          color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          label: "Completed",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-500 border border-slate-100",
          label: "Pending",
        };
    }
  };

  // ✅ Advanced Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.assignedTo?.name?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      // Status
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      // Priority
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // ✅ Smart Stats
  const stats = useMemo(() => {
    const today = new Date(new Date().toDateString());
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      highPriority: tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed",
      ).length,
      overdue: tasks.filter(
        (t) => t.status !== "completed" && new Date(t.date) < today,
      ).length,
    };
  }, [tasks]);

  const uniquePriorities = ["high", "medium", "low"];
  const statusOptions = ["all", "pending", "in-progress", "completed"];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Task Board
              </h1>
              <p className="text-slate-600 mt-1">
                Track progress and manage assignments
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/tasks/assign"
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-violet-600/20 w-fit"
          >
            <Plus className="w-5 h-5" />
            Assign New Task
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            {
              label: "TOTAL",
              value: stats.total,
              color: "text-slate-900",
              bg: "bg-indigo-50",
              iconBg: "bg-indigo-100",
              icon: <Target className="w-5 h-5 text-indigo-600" />,
            },
            {
              label: "PENDING",
              value: stats.pending,
              color: "text-slate-900",
              bg: "bg-amber-50",
              iconBg: "bg-amber-100",
              icon: <Clock className="w-5 h-5 text-amber-600" />,
            },
            {
              label: "IN PROGRESS",
              value: stats.inProgress,
              color: "text-slate-900",
              bg: "bg-blue-50",
              iconBg: "bg-blue-100",
              icon: <PlayCircle className="w-5 h-5 text-blue-600" />,
            },
            {
              label: "COMPLETED",
              value: stats.completed,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              iconBg: "bg-emerald-100",
              icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
            },
            {
              label: "OVERDUE",
              value: stats.overdue,
              color: "text-red-600",
              bg: "bg-red-50",
              iconBg: "bg-red-100",
              icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
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

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, description, or assignee..."
              className="w-full pl-14 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none text-sm font-medium text-slate-700 cursor-pointer min-w-[160px]"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "all"
                      ? "All Statuses"
                      : s.charAt(0).toUpperCase() +
                        s.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none text-sm font-medium text-slate-700 cursor-pointer min-w-[150px]"
              >
                <option value="all">All Priorities</option>
                {uniquePriorities.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl py-24 text-center border border-slate-100">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl">
              📋
            </div>
            <h3 className="text-xl font-semibold text-slate-700">
              No tasks found
            </h3>
            <p className="text-slate-500 mt-2 text-sm">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters."
                : "You haven't assigned any tasks yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const priorityConfig = getPriorityConfig(task.priority);
              const statusConfig = getStatusConfig(task.status);
              const isCompleted = task.status === "completed";

              // ✅ Overdue Logic
              const isOverdue =
                !isCompleted &&
                new Date(task.date) < new Date(new Date().toDateString());

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-2xl border transition-all group hover:shadow-md ${
                    isCompleted
                      ? "border-slate-100 opacity-75"
                      : isOverdue
                        ? "border-red-200 shadow-sm shadow-red-50"
                        : "border-slate-100 shadow-sm"
                  }`}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-6">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${priorityConfig.color}`}
                        >
                          {priorityConfig.icon}
                          {priorityConfig.label}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                        {isOverdue && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-lg text-xs font-semibold animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Overdue
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h2
                        className={`text-xl font-semibold leading-snug ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}
                      >
                        {task.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>

                      {/* Assignee */}
                      {task.assignedTo && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                            {task.assignedTo.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-600 font-medium">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar (Meta & Actions) */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-3 md:min-w-[160px] flex-shrink-0">
                      {/* Due Date */}
                      <div
                        className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg ${isOverdue ? "text-red-500 bg-red-50" : "text-slate-500 bg-slate-50"}`}
                      >
                        <Clock className="w-4 h-4" />
                        {new Date(task.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {task.status === "pending" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(task._id, "in-progress")
                            }
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Start</span>
                          </button>
                        )}

                        {task.status === "in-progress" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(task._id, "completed")
                            }
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Complete</span>
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() =>
                              updateTaskStatus(task._id, "pending")
                            }
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-all flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Reopen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-12">
          Homeasy • Smart Living, Perfected
        </p>
      </div>
    </div>
  );
}
