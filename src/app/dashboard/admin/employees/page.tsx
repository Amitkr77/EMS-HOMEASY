"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  Edit2,
  UserCheck,
  UserX,
  Search,
  X,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";

type Employee = {
  _id: string;
  name: string;
  email: string;
  baseSalary: number;
  isActive: boolean;
  role: string;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  baseSalary: number;
  role: string; // ✅ Added Role to form
};

type SortConfig = {
  key: keyof Employee;
  direction: "asc" | "desc";
};

export default function HomeasyTeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false); // For smooth modal animation

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    baseSalary: 0,
    role: "employee", // ✅ Default role
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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      showNotification("error", "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Unique Roles for Filter Dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set(employees.map((emp) => emp.role));
    return Array.from(roles);
  }, [employees]);

  // ✅ Filtering & Sorting Logic
  const processedEmployees = useMemo(() => {
    let result = [...employees];

    // Filter by Role
    if (roleFilter !== "all") {
      result = result.filter((emp) => emp.role === roleFilter);
    }

    // Filter by Search
    if (searchQuery) {
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [employees, searchQuery, roleFilter, sortConfig]);

  const requestSort = (key: keyof Employee) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Employee) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4 text-slate-300" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-teal-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-teal-600" />
    );
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      return showNotification("error", "Please fill all required fields");
    }
    if (form.password.length < 6) {
      return showNotification("error", "Password must be at least 6 characters");
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
      closeModal();
      fetchEmployees();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Failed to create team member");
    } finally {
      setSubmitting(false);
    }
  };

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
      closeModal();
      fetchEmployees();
    } catch {
      showNotification("error", "Failed to update team member");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this team member?`)) return;

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error();
      showNotification("success", `Team member ${action}d successfully`);
      fetchEmployees();
    } catch {
      showNotification("error", "Failed to update status");
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", baseSalary: 0, role: "employee" });
    setShowPassword(false);
  };

  const openModal = (isEdit: boolean, emp?: Employee) => {
    if (isEdit && emp) {
      setSelectedEmployee(emp);
      setForm({
        name: emp.name,
        email: emp.email,
        password: "",
        baseSalary: emp.baseSalary,
        role: emp.role,
      });
    } else {
      setSelectedEmployee(null);
      resetForm();
    }
    setShowModal(true);
    setTimeout(() => setShowCreateForm(true), 10); // Trigger animation
  };

  const closeModal = () => {
    setShowCreateForm(false);
    setTimeout(() => {
      setShowModal(false);
      setSelectedEmployee(null);
      resetForm();
    }, 300); // Wait for animation to finish
  };

  const activeCount = employees.filter((e) => e.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-medium transition-all duration-500 animate-in ${
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
              Manage your smart workforce
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal(false)}
          className="mt-6 md:mt-0 flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.97] shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Team</p>
            <p className="text-3xl font-bold text-slate-900">{employees.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active</p>
            <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <UserX className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Inactive</p>
            <p className="text-3xl font-bold text-red-500">{employees.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-14 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <select
            className="pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none text-sm text-slate-700 font-medium cursor-pointer min-w-[180px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role} className="capitalize">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-xl" />
              <div className="flex-1 h-5 bg-slate-200 rounded" />
              <div className="w-32 h-5 bg-slate-200 rounded" />
              <div className="w-24 h-5 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : processedEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl py-24 text-center border border-slate-100">
          <div className="mx-auto w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-4xl">
            👷‍♂️
          </div>
          <h3 className="text-2xl font-semibold text-slate-700">No team members found</h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto">
            {searchQuery || roleFilter !== "all"
              ? "Try adjusting your filters"
              : "Add your first team member to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {[
                    { label: "Team Member", key: "name" as keyof Employee },
                    { label: "Role", key: "role" as keyof Employee },
                    { label: "Base Salary", key: "baseSalary" as keyof Employee },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => requestSort(col.key)}
                      className="px-6 py-4 text-left font-semibold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {getSortIcon(col.key)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {processedEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-inner ${
                            emp.isActive
                              ? "bg-gradient-to-br from-teal-400 to-cyan-500"
                              : "bg-slate-300"
                          }`}
                        >
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{emp.name}</div>
                          <div className="text-sm text-slate-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-4 py-1.5 text-sm font-medium rounded-lg capitalize ${
                          emp.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-700">
                      ₹{emp.baseSalary.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium ${
                          emp.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            emp.isActive ? "bg-emerald-500" : "bg-red-400"
                          }`}
                        />
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(true, emp)}
                          className="p-2.5 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4.5 h-4.5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => toggleStatus(emp._id, emp.isActive)}
                          className="p-2.5 hover:bg-amber-50 rounded-xl transition-colors"
                          title={emp.isActive ? "Deactivate" : "Activate"}
                        >
                          {emp.isActive ? (
                            <UserX className="w-4.5 h-4.5 text-amber-600" />
                          ) : (
                            <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODAL OVERLAY ==================== */}
      {showModal && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
            showCreateForm ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-300 ${
              showCreateForm ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedEmployee ? "Edit Member" : "Add New Member"}
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    {selectedEmployee
                      ? "Update team member details"
                      : "Fill in the details to add to Homeasy"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                    placeholder="Amit Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* ✅ Added Role Selector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white text-sm capitalize"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="amit@homeasy.io"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {selectedEmployee ? "New Password" : "Password"}{" "}
                  {!selectedEmployee && <span className="text-red-400">*</span>}
                  {selectedEmployee && (
                    <span className="text-xs text-slate-400 font-normal">(leave blank to keep current)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-12 text-sm"
                    placeholder={selectedEmployee ? "••••••••" : "Create secure password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Base Salary (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="45000"
                  value={form.baseSalary === 0 ? "" : form.baseSalary}
                  onChange={(e) =>
                    setForm({ ...form, baseSalary: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={selectedEmployee ? handleUpdate : handleCreate}
                disabled={submitting}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all disabled:opacity-70 text-sm flex items-center justify-center gap-2"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {submitting
                  ? "Processing..."
                  : selectedEmployee
                  ? "Save Changes"
                  : "Add to Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}