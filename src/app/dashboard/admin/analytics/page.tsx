"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { TrendingUp, Clock, BarChart3, Trophy } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string | number;
}

type AttendanceRecord = {
  _id: string;
  date: string;
  employeeId?: { _id: string; name: string; email: string } | string;
  checkIn?: { time: string };
  checkOut?: { time: string };
  status?: string;
};

type EmployeeStats = {
  name: string;
  hours: number;
};

export default function HomeasyAnalytics() {
  const [data, setData] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Safely extract employee name
  const getEmployeeName = (record: AttendanceRecord): string => {
    return typeof record.employeeId === "object"
      ? record.employeeId?.name || "Unknown"
      : "Unknown";
  };

  // ✅ Calculate hours on the fly
  const getHoursWorked = (record: AttendanceRecord): number => {
    const inTime = record.checkIn?.time;
    const outTime = record.checkOut?.time;
    if (!inTime || !outTime) return 0;

    const diffMs = new Date(outTime).getTime() - new Date(inTime).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Ignore negative or impossible shifts
    if (diffHours < 0 || diffHours > 24) return 0;
    return Math.round(diffHours * 10) / 10;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/attendance/admin");
        const records: AttendanceRecord[] = await res.json();

        if (!Array.isArray(records)) throw new Error("Invalid data");

        const summary: Record<string, number> = {};

        records.forEach((r) => {
          const name = getEmployeeName(r);
          if (name === "Unknown") return; // Skip unlinked records
          
          const hours = getHoursWorked(r);
          summary[name] = (summary[name] || 0) + hours;
        });

        // Sort by highest hours
        const formatted = Object.keys(summary)
          .map((key) => ({
            name: key,
            hours: Math.round(summary[key] * 10) / 10,
          }))
          .sort((a, b) => b.hours - a.hours);

        setData(formatted);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Computed Stats
  const stats = useMemo(() => {
    const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
    const avgHours = data.length > 0 ? Math.round((totalHours / data.length) * 10) / 10 : 0;
    const top3 = data.slice(0, 3);
    
    return { totalHours, avgHours, top3 };
  }, [data]);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 px-5 py-3 rounded-xl shadow-2xl border border-slate-700">
          <p className="font-semibold text-slate-100 text-sm">{label}</p>
          <p className="text-teal-400 text-sm mt-1">
            <span className="font-bold text-lg">{payload[0].value}</span> hrs worked
          </p>
        </div>
      );
    }
    return null;
  };

  // Chart gradient colors
  const getBarColor = (index: number) => {
    if (index === 0) return "#0d9488"; // Top performer - darker teal
    if (index === 1) return "#14b8a6"; // Second
    if (index === 2) return "#2dd4bf"; // Third
    return "#99f6e4"; // Rest - lighter teal
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Performance Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Insights based on attendance and hours worked
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">TOTAL HOURS</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">{stats.totalHours}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">AVG HOURS / PERSON</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">{stats.avgHours}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-7 h-7 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">TOP PERFORMER</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 truncate">
                {stats.top3[0]?.name || "N/A"}
              </p>
              <p className="text-sm text-teal-600 font-medium -mt-0.5">
                {stats.top3[0]?.hours || 0} hrs
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Hours Worked Breakdown
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Comparing total logged hours per team member
              </p>
            </div>

            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Calculating performance...</p>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                <div className="text-6xl mb-4">📊</div>
                <p className="font-medium">No attendance data available yet</p>
                <p className="text-sm mt-1">Hours will appear here once employees check in/out.</p>
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-40}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fill: "#94a3b8", fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top 3 Leaderboard */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-slate-900">
                Leaderboard
              </h2>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : stats.top3.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-10">
                <p className="text-sm">No data for leaderboard</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {stats.top3.map((emp, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const bgColors = [
                    "bg-gradient-to-r from-amber-50 to-transparent border-amber-100",
                    "bg-gradient-to-r from-slate-50 to-transparent border-slate-100",
                    "bg-gradient-to-r from-orange-50 to-transparent border-orange-100"
                  ];
                  
                  return (
                    <div 
                      key={emp.name} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border ${bgColors[index]} transition-all hover:shadow-sm`}
                    >
                      <div className="text-3xl">{medals[index]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{emp.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Rank #{index + 1}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-slate-900">{emp.hours}</p>
                        <p className="text-xs text-teal-600 font-medium -mt-0.5">hours</p>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
                    <span>Total Employees Tracked</span>
                    <span className="font-bold text-slate-700">{data.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          Homeasy • Smart Living, Perfected
        </p>
      </div>
    </div>
  );
}