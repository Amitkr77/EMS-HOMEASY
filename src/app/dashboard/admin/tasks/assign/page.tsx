"use client";

import { useState, useEffect } from "react";
import { User, Calendar, Send, Target, X, AlertTriangle, MinusCircle, ArrowDownCircle, RotateCcw } from "lucide-react";

type FormState = {
  employeeId: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
};

type FormErrors = {
  employeeId?: string;
  title?: string;
  description?: string;
  dueDate?: string;
};

export default function HomeasyAssignTask() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [form, setForm] = useState<FormState>({
    employeeId: "",
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const priorities = [
    { value: "high", label: "High", desc: "Urgent", color: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500", icon: <AlertTriangle className="w-5 h-5" /> },
    { value: "medium", label: "Medium", desc: "Standard", color: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500", icon: <MinusCircle className="w-5 h-5" /> },
    { value: "low", label: "Low", desc: "Flexible", color: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", icon: <ArrowDownCircle className="w-5 h-5" /> },
  ];

  // ✅ Only fetch ACTIVE employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        // Filter out inactive employees so admin can't assign tasks to them
        setEmployees(Array.isArray(data) ? data.filter((emp: any) => emp.isActive) : []);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Field-level Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.employeeId) newErrors.employeeId = "Please select a team member";
    if (!form.title.trim()) newErrors.title = "Task title is required";
    else if (form.title.length > 100) newErrors.title = "Title must be under 100 characters";
    if (!form.description.trim()) newErrors.description = "Description is required";
    else if (form.description.length > 1000) newErrors.description = "Description must be under 1000 characters";
    if (!form.dueDate) newErrors.dueDate = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

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
        setErrors({ employeeId: data.error }); // Show API errors (e.g. duplicate)
      } else {
        setSuccess(true);
        resetForm();
      }
    } catch {
      setErrors({ employeeId: "Failed to assign task. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ employeeId: "", title: "", description: "", priority: "medium", dueDate: "" });
    setErrors({});
  };

  // Get today's date in YYYY-MM-DD format to prevent past date selection
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
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

        {/* Success State */}
        {success && (
          <div className="mb-8 p-8 bg-emerald-50 border border-emerald-100 rounded-3xl text-center animate-in fade-in">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-800">
              Task Assigned!
            </h3>
            <p className="text-emerald-600 mt-2 text-sm max-w-sm mx-auto">
              The team member has been notified and will see this in their task dashboard.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-sm"
            >
              Assign Another Task
            </button>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
          <div className="space-y-7">
            
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Assign To <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  className={`w-full pl-12 pr-6 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white text-sm appearance-none ${
                    errors.employeeId ? "border-red-300 bg-red-50/30" : "border-slate-200"
                  }`}
                  value={form.employeeId}
                  onChange={(e) => {
                    setForm({ ...form, employeeId: e.target.value });
                    if (errors.employeeId) setErrors({ ...errors, employeeId: undefined });
                  }}
                >
                  <option value="">
                    {loadingEmployees ? "Loading team..." : "Select Team Member"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id} className="text-slate-900">
                      {emp.name} — {emp.email}
                    </option>
                  ))}
                </select>
              </div>
              {errors.employeeId && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.employeeId}</p>}
            </div>

            {/* Task Title */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs font-medium ${form.title.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>
                  {form.title.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g., Complete smart home installation for Client XYZ"
                className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm ${
                  errors.title ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Description <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs font-medium ${form.description.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                  {form.description.length}/1000
                </span>
              </div>
              <textarea
                maxLength={1000}
                placeholder="Provide detailed instructions, requirements, and any specific links..."
                className={`w-full h-36 px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none text-sm leading-relaxed ${
                  errors.description ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.description}</p>}
            </div>

            {/* Priority & Due Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Priority Level
                </label>
                <div className="space-y-2.5">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value as any })}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                        form.priority === p.value
                          ? `${p.color} border-current shadow-sm`
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`text-current ${form.priority !== p.value ? 'text-slate-400' : ''}`}>
                        {p.icon}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${form.priority === p.value ? 'text-current' : 'text-slate-700'}`}>
                          {p.label}
                        </p>
                        <p className={`text-xs ${form.priority === p.value ? 'text-current opacity-70' : 'text-slate-500'}`}>
                          {p.desc}
                        </p>
                      </div>
                      <div className={`ml-auto w-3 h-3 rounded-full ${form.priority === p.value ? p.dot : 'bg-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    min={todayStr} // ✅ Prevent past dates
                    className={`w-full pl-12 pr-6 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm ${
                      errors.dueDate ? "border-red-300 bg-red-50/30" : "border-slate-200"
                    }`}
                    value={form.dueDate}
                    onChange={(e) => {
                      setForm({ ...form, dueDate: e.target.value });
                      if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
                    }}
                  />
                </div>
                {errors.dueDate && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.dueDate}</p>}
                
                <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Task Summary</p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Assignee:</span>
                      <span className="font-medium text-slate-900 truncate ml-4">
                        {employees.find(e => e._id === form.employeeId)?.name || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span className="font-medium capitalize text-slate-900">{form.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due by:</span>
                      <span className="font-medium text-slate-900">
                        {form.dueDate ? new Date(form.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex-1 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Form
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm shadow-lg shadow-violet-600/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Assign Task to Employee
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          The assigned employee will be notified instantly • Homeasy
        </p>
      </div>
    </div>
  );
}