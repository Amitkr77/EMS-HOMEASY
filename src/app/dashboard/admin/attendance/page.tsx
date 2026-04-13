"use client";
import { useEffect, useState, useMemo } from "react";
import { Download, Search, Calendar, Users, Clock, Award, X, ZoomIn } from "lucide-react";

interface AttendanceRecord {
  _id: string;
  employeeId: {
    name: string;
    email: string;
  } | string;
  date: string;
  status?: string;
  checkIn?: {
    time: string;
    imageUrl?: string;
    location?: { type: string; coordinates: number[] };
  };
  checkOut?: {
    time?: string;
    location?: { coordinates: number[] };
  };
  // hoursWorked is NOT provided by the API, we must calculate it
}

export default function AdminAttendance() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "/api/attendance/admin";
      if (date) url += `?date=${date}`;
      
      const res = await fetch(url);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to fetch admin attendance", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  // Helper Functions
  const getHoursWorked = (record: AttendanceRecord): number | null => {
    const inTime = record.checkIn?.time;
    const outTime = record.checkOut?.time;
    if (!inTime || !outTime) return null;

    const diffMs = new Date(outTime).getTime() - new Date(inTime).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 0 || diffHours > 24) return null;
    return Math.round(diffHours * 10) / 10;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  };

  const getStatus = (record: AttendanceRecord, hours: number | null) => {
    if (record.checkIn?.time && !record.checkOut?.time) {
      return { label: "In Progress", color: "bg-blue-100 text-blue-700" };
    }
    if (!record.checkIn?.time || hours === null) {
      return { label: "Absent", color: "bg-red-100 text-red-700" };
    }
    if (hours >= 8) return { label: "Present", color: "bg-green-100 text-green-700" };
    if (hours >= 4) return { label: "Half Day", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Short Day", color: "bg-orange-100 text-orange-700" };
  };

  // Safely extract employee name/email regardless of populate status
  const getEmployeeName = (item: AttendanceRecord) => 
    typeof item.employeeId === "object" ? item.employeeId?.name || "Unknown" : "Unknown";
  
  const getEmployeeEmail = (item: AttendanceRecord) => 
    typeof item.employeeId === "object" ? item.employeeId?.email || "" : "";

  // Filter data based on search
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      getEmployeeName(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEmployeeEmail(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Summary calculations based on CALCULATED hours
  const summary = useMemo(() => {
    const total = filteredData.length;
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    let totalHours = 0;

    filteredData.forEach((item) => {
      const hours = getHoursWorked(item);
      
      if (!item.checkIn?.time) {
        absent++;
      } else if (!item.checkOut?.time) {
        present++; // Currently checked in, count optimistically as present
      } else if (hours !== null) {
        totalHours += hours;
        if (hours >= 8) present++;
        else if (hours >= 4) halfDay++;
        else absent++;
      } else {
        absent++;
      }
    });

    // Calculate average based only on completed shifts to avoid skewing
    const completedShifts = filteredData.filter(i => getHoursWorked(i) !== null).length;
    const avgHours = completedShifts > 0 ? (totalHours / completedShifts).toFixed(1) : "0";

    return { total, present, halfDay, absent, avgHours };
  }, [filteredData]);

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Date", "Check In", "Check Out", "Hours Worked", "Status"];
    
    const rows = filteredData.map((item) => {
      const hours = getHoursWorked(item);
      const status = getStatus(item, hours);
      return [
        getEmployeeName(item),
        getEmployeeEmail(item),
        item.date,
        formatTime(item.checkIn?.time),
        formatTime(item.checkOut?.time),
        hours !== null ? hours.toFixed(1) : "0",
        status.label
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${date || "all"}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor employee attendance efficiently</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition whitespace-nowrap"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Award className="text-green-600" size={24} />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Present</p>
              <p className="text-2xl font-bold text-green-600">{summary.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={24} />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Half Day</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.halfDay}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-red-500 text-2xl leading-none">⛔</div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Absent</p>
              <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            </div>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="text-purple-600" size={24} />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Hours</p>
              <p className="text-2xl font-bold text-purple-600">{summary.avgHours}</p>
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
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center gap-2 transition whitespace-nowrap"
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
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Photo</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Employee</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Check In</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Check Out</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Hours</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((item) => {
                  const hours = getHoursWorked(item);
                  const status = getStatus(item, hours);
                  const imageUrl = item.checkIn?.imageUrl;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      
                      {/* Photo */}
                      <td className="px-4 py-4">
                        {imageUrl ? (
                          <button
                            onClick={() => setPreviewImage(imageUrl)}
                            className="relative group w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors cursor-pointer"
                          >
                            <img src={imageUrl} alt="Check-in" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">N/A</span>
                          </div>
                        )}
                      </td>

                      {/* Employee Info */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{getEmployeeName(item)}</div>
                        <div className="text-sm text-gray-500">{getEmployeeEmail(item)}</div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>

                      {/* Check In */}
                      <td className="px-6 py-4 text-center font-medium">
                        {formatTime(item.checkIn?.time)}
                      </td>

                      {/* Check Out */}
                      <td className="px-6 py-4 text-center font-medium">
                        {formatTime(item.checkOut?.time)}
                      </td>

                      {/* Hours */}
                      <td className="px-6 py-4 text-center font-semibold text-lg">
                        {hours !== null ? `${hours.toFixed(1)}h` : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <X className="w-5 h-5" />
              Close
            </button>
            <img
              src={previewImage}
              alt="Check-in preview"
              className="w-full rounded-2xl shadow-2xl"
            />
            <p className="text-center text-white/50 text-sm mt-4">
              Employee Check-in Photo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}