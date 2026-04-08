"use client";

import { useEffect, useState } from "react";
import {
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  Plus,
} from "lucide-react";
import Link from "next/link";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: string;
  assignedTo?: { name: string; email?: string };
  createdAt?: string;
};

export default function HomeasyAllTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const fetchAllTasks = async () => {
    try {
      const res = await fetch("/api/tasks/all"); // Make sure this API exists
      const data = await res.json();
      setTasks(data);
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
      alert("Failed to update task status");
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "bg-red-100 text-red-700",
          icon: <Flag className="w-4 h-4" />,
          label: "High",
        };
      case "medium":
        return {
          color: "bg-amber-100 text-amber-700",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "Medium",
        };
      case "low":
        return {
          color: "bg-emerald-100 text-emerald-700",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Low",
        };
      default:
        return {
          color: "bg-slate-100 text-slate-700",
          icon: null,
          label: priority,
        };
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                All Tasks
              </h1>
              <p className="text-slate-600 mt-1">
                Manage and track all assigned tasks
              </p>
            </div>
          </div>
          {/* Assign New Task Button */}
          <Link
            href="/dashboard/admin/tasks/assign"
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-4 rounded-3xl transition-all shadow-lg shadow-violet-200"
          >
            <Plus className="w-5 h-5" />
            Assign New Task
          </Link>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-6 md:mt-0">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-violet-600 text-white shadow"
                    : "bg-white border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">TOTAL TASKS</p>
            <p className="text-4xl font-bold text-slate-900 mt-3">
              {tasks.length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-amber-600">PENDING</p>
            <p className="text-4xl font-bold text-slate-900 mt-3">
              {tasks.filter((t) => t.status !== "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-emerald-600">COMPLETED</p>
            <p className="text-4xl font-bold text-slate-900 mt-3">
              {tasks.filter((t) => t.status === "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-red-600">HIGH PRIORITY</p>
            <p className="text-4xl font-bold text-slate-900 mt-3">
              {tasks.filter((t) => t.priority === "high").length}
            </p>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            Loading all tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl py-20 text-center border border-slate-100">
            <div className="mx-auto w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
              📋
            </div>
            <h3 className="text-xl font-semibold text-slate-700">
              No tasks found
            </h3>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.map((task) => {
              const priorityConfig = getPriorityConfig(task.priority);
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-all ${
                    isCompleted ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-1 rounded-3xl text-sm font-medium ${priorityConfig.color}`}
                        >
                          {priorityConfig.icon}
                          {priorityConfig.label}
                        </div>
                        {isCompleted && (
                          <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-100 text-emerald-700 rounded-3xl text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                      </div>

                      <h2
                        className={`text-2xl font-semibold ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}
                      >
                        {task.title}
                      </h2>

                      <p className="mt-3 text-slate-600 leading-relaxed">
                        {task.description}
                      </p>

                      {task.assignedTo && (
                        <p className="mt-4 text-sm text-slate-500">
                          Assigned to:{" "}
                          <span className="font-medium text-slate-700">
                            {task.assignedTo.name}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={() =>
                            updateTaskStatus(task._id, "completed")
                          }
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-2xl transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
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
