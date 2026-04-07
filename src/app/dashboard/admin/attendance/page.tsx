"use client";
import { useEffect, useState, useMemo } from "react";
import { Download, Search, Calendar, Users, Clock, Award } from "lucide-react";

interface AttendanceRecord {
  _id: string;
  employeeId: {
    name: string;
    email: string;
  };
  date: string;
  checkIn?: { time: string };
  checkOut?: { time: string };
  hoursWorked: number;
}

export default function AdminAttendance() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/attendance/admin";
    if (date) url += `?date=${date}`;
    
    const res = await fetch(url);
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Summary calculations
  const summary = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter((item) => item.hoursWorked >= 8).length;
    const halfDay = filteredData.filter((item) => item.hoursWorked > 0 && item.hoursWorked < 8).length;
    const absent = total - present - halfDay;
    const avgHours = total > 0 
      ? (filteredData.reduce((sum, item) => sum + (item.hoursWorked || 0), 0) / total).toFixed(1)
      : "0";

    return { total, present, halfDay, absent, avgHours };
  }, [filteredData]);

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Date", "Check In", "Check Out", "Hours Worked", "Status"];
    
    const rows = filteredData.map((item) => [
      item.employeeId?.name || "",
      item.employeeId?.email || "",
      item.date,
      item.checkIn?.time ? new Date(item.checkIn.time).toLocaleTimeString() : "-",
      item.checkOut?.time ? new Date(item.checkOut.time).toLocaleTimeString() : "-",
      item.hoursWorked || "0",
      item.hoursWorked >= 8 ? "Present" : item.hoursWorked > 0 ? "Half Day" : "Absent"
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${date || "all"}.csv`;
    link.click();
  };

  const getStatus = (hours: number) => {
    if (!hours) return { label: "Absent", color: "bg-red-100 text-red-700" };
    if (hours >= 8) return { label: "Present", color: "bg-green-100 text-green-700" };
    return { label: "Half Day", color: "bg-yellow-100 text-yellow-700" };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor employee attendance efficiently</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-3xl font-bold">{summary.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Award className="text-green-600" size={28} />
            <div>
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-3xl font-bold text-green-600">{summary.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={28} />
            <div>
              <p className="text-sm text-gray-500">Half Day</p>
              <p className="text-3xl font-bold text-yellow-600">{summary.halfDay}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-red-600 text-3xl">⛔</div>
            <div>
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="text-purple-600" size={28} />
            <div>
              <p className="text-sm text-gray-500">Avg Hours</p>
              <p className="text-3xl font-bold text-purple-600">{summary.avgHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <input
            type="date"
            className="border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          
          <button
            onClick={() => setDate(new Date().toISOString().split("T")[0])}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center gap-2 transition"
          >
            <Calendar size={18} />
            Today
          </button>

          {date && (
            <button
              onClick={() => setDate("")}
              className="px-5 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No attendance records found for the selected date/filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Employee</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Check In</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Check Out</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Hours Worked</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((item) => {
                  const status = getStatus(item.hoursWorked);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-medium">{item.employeeId?.name}</div>
                          <div className="text-sm text-gray-500">{item.employeeId?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600">{item.date}</td>
                      <td className="px-6 py-5 text-center font-medium">
                        {item.checkIn?.time 
                          ? new Date(item.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-5 text-center font-medium">
                        {item.checkOut?.time 
                          ? new Date(item.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-5 text-center font-semibold text-lg">
                        {item.hoursWorked ? item.hoursWorked.toFixed(1) : "-"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}