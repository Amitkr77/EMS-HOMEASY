"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, CheckCircle, Flag, Target, AlertCircle, AlertTriangle, CircleCheckBig } from "lucide-react";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: string;
};

export default function HomeasyTodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchTodayTasks = async () => {
    try {
      const res = await fetch("/api/tasks/today");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch today's tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayTasks();
  }, []);

  const markComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await fetch(`/api/tasks/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      fetchTodayTasks();
    } catch (error) {
      console.error("Failed to mark task as complete", error);
      alert("Failed to mark task as complete");
    } finally {
      setCompletingId(null);
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return { color: "bg-red-50 text-red-600 border border-red-100", icon: <Flag className="w-3.5 h-3.5" />, label: "High" };
      case "medium":
        return { color: "bg-amber-50 text-amber-600 border border-amber-100", icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Medium" };
      case "low":
        return { color: "bg-emerald-50 text-emerald-600 border border-emerald-100", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Low" };
      default:
        return { color: "bg-slate-50 text-slate-600 border border-slate-100", icon: null, label: priority };
    }
  };

  // ✅ Smart Sorting: High priority first, completed tasks sink to the bottom
  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    });
  }, [tasks]);

  // ✅ Smart Stats Calculation
  const stats = useMemo(() => ({
    total: tasks.length,
    highPriority: tasks.filter((t) => t.priority === "high" && t.status !== "completed").length,
    pending: tasks.filter((t) => t.status !== "completed").length,
  }), [tasks]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Today&apos;s Work
            </h1>
            <p className="text-slate-600 mt-1">Focus on what matters today</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "TOTAL TASKS", value: stats.total, bg: "bg-violet-50", iconBg: "bg-violet-100", icon: <Target className="w-5 h-5 text-violet-600" /> },
            { label: "HIGH PRIORITY", value: stats.highPriority, bg: "bg-red-50", iconBg: "bg-red-100", icon: <Flag className="w-5 h-5 text-red-500" /> },
            { label: "PENDING", value: stats.pending, bg: "bg-amber-50", iconBg: "bg-amber-100", icon: <Clock className="w-5 h-5 text-amber-600" /> },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-transparent`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-bold tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl py-24 text-center border border-slate-100">
            <div className="mx-auto w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 text-4xl border border-violet-100">
              🎯
            </div>
            <h3 className="text-2xl font-semibold text-slate-700">
              No tasks for today
            </h3>
            <p className="text-slate-500 mt-3 max-w-sm mx-auto">
              Great job! You&apos;re all caught up. Enjoy your day.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => {
              const priorityConfig = getPriorityConfig(task.priority);
              const isCompleted = task.status === "completed";
              
              // ✅ Overdue Logic
              const isOverdue = !isCompleted && new Date(task.dueDate) < new Date(new Date().toDateString());

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-2xl border transition-all duration-200 ${
                    isCompleted 
                      ? "border-slate-100 opacity-70" 
                      : isOverdue 
                        ? "border-red-200 shadow-sm shadow-red-50 hover:shadow-md" 
                        : "border-slate-100 hover:shadow-md"
                  }`}
                >
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      {/* Tags Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${priorityConfig.color}`}>
                          {priorityConfig.icon}
                          {priorityConfig.label}
                        </div>
                        
                        {isOverdue && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-lg text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Overdue
                          </div>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h2 className={`text-lg font-semibold leading-snug ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {task.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Right Sidebar (Meta & Actions) */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 flex-shrink-0 sm:min-w-[140px]">
                      
                      {/* Due Date */}
                      <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg ${isOverdue ? "text-red-500 bg-red-50" : "text-slate-500 bg-slate-50"}`}>
                        <Clock className="w-4 h-4" />
                        {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>

                      {/* Action Button */}
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                          <CircleCheckBig className="w-5 h-5" />
                          Done
                        </div>
                      ) : (
                        <button
                          onClick={() => markComplete(task._id)}
                          disabled={completingId === task._id}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
                        >
                          {completingId === task._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Complete
                        </button>
                      )}
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