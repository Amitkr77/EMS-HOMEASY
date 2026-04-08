"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, Flag, Target, AlertCircle } from "lucide-react";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: string;
  assignedTo?: string;
};

export default function HomeasyTodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchTodayTasks = async () => {
    try {
      const res = await fetch("/api/tasks/today");
      const data = await res.json();
      setTasks(data);
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
      alert("Failed to mark task as complete");
    } finally {
      setCompletingId(null);
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Today's Work
            </h1>
            <p className="text-slate-600 mt-1">Focus on what matters today</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">TODAY'S TASKS</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {tasks.length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-emerald-600">
              HIGH PRIORITY
            </p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {tasks.filter((t) => t.priority === "high").length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-amber-600">PENDING</p>
            <p className="text-5xl font-bold text-slate-900 mt-4">
              {tasks.filter((t) => t.status !== "completed").length}
            </p>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            Loading today's tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-3xl py-20 text-center border border-slate-100">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-6xl">
              🎯
            </div>
            <h3 className="text-2xl font-semibold text-slate-700">
              No tasks for today
            </h3>
            <p className="text-slate-500 mt-3">
              Great job! You're all caught up.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => {
              const priorityConfig = getPriorityConfig(task.priority);
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-all ${
                    isCompleted ? "opacity-75" : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-4 py-1 rounded-3xl text-sm font-medium flex items-center gap-2 ${priorityConfig.color}`}
                        >
                          {priorityConfig.icon}
                          {priorityConfig.label}
                        </div>
                        {isCompleted && (
                          <div className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-3xl text-sm font-medium">
                            Completed
                          </div>
                        )}
                      </div>

                      <h2
                        className={`text-2xl font-semibold mt-4 ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}
                      >
                        {task.title}
                      </h2>

                      <p className="mt-3 text-slate-600 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center gap-2 mt-6 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => markComplete(task._id)}
                        disabled={completingId === task._id}
                        className="ml-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-3xl transition-all flex items-center gap-2 text-sm"
                      >
                        {completingId === task._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Mark Complete
                          </>
                        )}
                      </button>
                    )}
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
