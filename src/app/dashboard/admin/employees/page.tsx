"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

type Employee = {
  _id: string;
  name: string;
  email: string;
  role: string;
  baseSalary: number;
  isActive: boolean;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  baseSalary: number;
  role: string;
};

const roles = [
  "Technician",
  "Installer",
  "Support Agent",
  "Smart Home Consultant",
  "Manager",
  "Admin",
];

export default function HomeasyTeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    baseSalary: 0,
    role: "Technician",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch team members
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEmployees(data);
    } catch {
      showNotification("error", "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Create new team member
  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      return showNotification("error", "Please fill all required fields");
    }
    if (form.password.length < 6) {
      return showNotification(
        "error",
        "Password must be at least 6 characters",
      );
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showNotification("success", "Team member added successfully!");
      setShowCreateForm(false);
      resetForm();
      fetchEmployees();
    } catch (err: unknown) {
      let message = "Failed to create team member";

      if (err instanceof Error) {
        message = err.message;
      }

      showNotification("error", message);
      fetchEmployees();
    } finally {
      setSubmitting(false);
    }
  };

  // Update team member
  const handleUpdate = async () => {
    if (!selectedEmployee) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${selectedEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          baseSalary: form.baseSalary,
          role: form.role,
          ...(form.password && { password: form.password }),
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      showNotification("success", "Team member updated successfully!");
      setSelectedEmployee(null);
      resetForm();
      fetchEmployees();
    } catch {
      showNotification("error", "Failed to update team member");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active / Inactive
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this team member?`))
      return;

    try {
      await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      showNotification("success", `Team member ${action}d successfully`);
      fetchEmployees();
    } catch {
      showNotification("error", "Failed to update status");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      baseSalary: 0,
      role: "Technician",
    });
    setShowPassword(false);
  };

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      baseSalary: emp.baseSalary,
      role: emp.role,
    });
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCount = employees.filter((e) => e.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 text-white font-medium transition-all duration-300 ${
            notification.type === "success" ? "bg-teal-600" : "bg-red-600"
          }`}
        >
          {notification.type === "success" ? "✅" : "⚠️"} {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            H
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Homeasy Team
            </h1>
            <p className="text-slate-600 mt-1 text-lg">
              Smart Team. Perfected.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="mt-6 md:mt-0 flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-3xl font-semibold transition-all active:scale-[0.97] shadow-lg shadow-teal-200"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow transition-shadow">
          <p className="text-sm font-medium text-slate-500 tracking-widest">
            TOTAL TEAM
          </p>
          <p className="text-5xl font-bold text-slate-900 mt-5">
            {employees.length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow transition-shadow">
          <p className="text-sm font-medium text-teal-600 tracking-widest">
            ACTIVE MEMBERS
          </p>
          <p className="text-5xl font-bold text-teal-600 mt-5">{activeCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow transition-shadow">
          <p className="text-sm font-medium text-red-600 tracking-widest">
            INACTIVE
          </p>
          <p className="text-5xl font-bold text-red-600 mt-5">
            {employees.length - activeCount}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by name, email or role..."
            className="w-full pl-14 pr-5 py-4 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl py-24 text-center border border-slate-100">
          <div className="mx-auto w-28 h-28 bg-teal-100 rounded-full flex items-center justify-center mb-6 text-5xl">
            👷‍♂️
          </div>
          <h3 className="text-2xl font-semibold text-slate-700">
            No team members found
          </h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto">
            {searchQuery
              ? "Try a different search term"
              : "Add your first Homeasy team member to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-8 py-6 text-left font-semibold text-slate-600">
                  Team Member
                </th>
                <th className="px-6 py-6 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-6 py-6 text-left font-semibold text-slate-600">
                  Role
                </th>
                <th className="px-6 py-6 text-left font-semibold text-slate-600">
                  Base Salary
                </th>
                <th className="px-6 py-6 text-center font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-8 py-6 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp._id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-slate-900 text-lg">
                        {emp.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-slate-600">{emp.email}</td>
                  <td className="px-6 py-6">
                    <span className="inline-block px-5 py-2 bg-teal-100 text-teal-700 text-sm font-medium rounded-3xl">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-semibold text-slate-700">
                    ₹{emp.baseSalary.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <button
                      onClick={() => toggleStatus(emp._id, emp.isActive)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-3xl text-sm font-medium transition-all ${
                        emp.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {emp.isActive ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                      {emp.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => toggleStatus(emp._id, emp.isActive)}
                        className="p-3 hover:bg-red-50 rounded-2xl transition-colors"
                        title="Change Status"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== CREATE MODAL ==================== */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Add Team Member
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Join the Homeasy smart team
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-3xl text-slate-300 hover:text-slate-500 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    placeholder="Amit Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    placeholder="amit@homeasy.io"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 pr-12"
                      placeholder="Create secure password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Base Salary (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    placeholder="45000"
                    value={form.baseSalary || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        baseSalary: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 flex gap-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-4 font-semibold text-slate-600 hover:bg-slate-100 rounded-3xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl transition-all disabled:opacity-70"
              >
                {submitting ? "Creating..." : "Add to Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT MODAL ==================== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                Edit Team Member
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Base Salary (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    value={form.baseSalary}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        baseSalary: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password{" "}
                    <span className="text-xs text-slate-400">
                      (leave blank to keep current)
                    </span>
                  </label>
                  <input
                    type="password"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500"
                    placeholder="Enter new password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 flex gap-4">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="flex-1 py-4 font-semibold text-slate-600 hover:bg-slate-100 rounded-3xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl transition-all"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
