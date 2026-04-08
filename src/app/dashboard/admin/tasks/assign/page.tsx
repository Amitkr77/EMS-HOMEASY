"use client";

import { useState, useEffect } from "react";
import { User, Calendar, Send, Target } from "lucide-react";

export default function HomeasyAssignTask() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [form, setForm] = useState({
    employeeId: "",
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const priorities = [
    {
      value: "high",
      label: "High Priority",
      color: "text-red-600",
      icon: "🔴",
    },
    {
      value: "medium",
      label: "Medium Priority",
      color: "text-amber-600",
      icon: "🟠",
    },
    {
      value: "low",
      label: "Low Priority",
      color: "text-emerald-600",
      icon: "🟢",
    },
  ];

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.title || !form.description || !form.dueDate) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: form.dueDate, 
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setForm({
          employeeId: "",
          title: "",
          description: "",
          priority: "medium",
          dueDate: "",
        });
      }
    } catch {
      setError("Failed to assign task. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Assign Task
            </h1>
            <p className="text-slate-600 mt-1">
              Delegate work to your team members
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-semibold text-emerald-700">
              Task Assigned Successfully!
            </h3>
            <p className="text-emerald-600 mt-2">
              The team member has been notified.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              Assign Another Task
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
          <div className="space-y-8">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Assign To
              </label>
              <div className="relative">
                <User className="absolute left-5 top-4 text-slate-400" />
                <select
                  className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-violet-500 transition-all bg-white"
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                >
                  <option value="">Select Team Member</option>
                  {loadingEmployees ? (
                    <option disabled>Loading employees...</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} — {emp.email}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Task Title
              </label>
              <input
                type="text"
                placeholder="Complete smart home installation for Client XYZ"
                className="w-full px-6 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-violet-500 transition-all"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Description
              </label>
              <textarea
                placeholder="Provide detailed instructions, requirements, and deadlines..."
                className="w-full h-40 px-6 py-5 border border-slate-200 rounded-3xl focus:outline-none focus:border-violet-500 transition-all resize-y min-h-[140px]"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`p-4 rounded-2xl border text-center transition-all text-sm font-medium ${
                        form.priority === p.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="block text-xl mb-1">{p.icon}</span>
                      <span className={p.color}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-4 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-violet-500 transition-all"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.employeeId ||
              !form.title ||
              !form.description ||
              !form.dueDate
            }
            className="mt-10 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-4 rounded-3xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-violet-200"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning Task...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Assign Task to Employee
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          The assigned employee will be notified instantly • Homeasy
        </p>
      </div>
    </div>
  );
}
