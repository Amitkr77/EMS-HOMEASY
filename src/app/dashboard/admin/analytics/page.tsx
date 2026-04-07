"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Clock, Users } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string | number;
}

type AttendanceRecord = {
  employeeId?: { name: string };
  hoursWorked?: number;
};

type ChartDataItem = {
  name: string;
  hours: number;
};

export default function HomeasyAnalytics() {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [topPerformer, setTopPerformer] = useState<{
    name: string;
    hours: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/attendance/admin")
      .then((res) => res.json())
      .then((res: AttendanceRecord[]) => {
        const summary: Record<string, number> = {};

        res.forEach((r) => {
          const name = r.employeeId?.name || "Unknown";
          summary[name] = (summary[name] || 0) + (r.hoursWorked || 0);
        });

        const formatted = Object.keys(summary)
          .map((key) => ({
            name: key,
            hours: Math.round(summary[key] * 10) / 10, // 1 decimal
          }))
          .sort((a, b) => b.hours - a.hours); // Sort by hours descending

        const total = formatted.reduce((sum, item) => sum + item.hours, 0);
        const top = formatted[0] || null;

        setData(formatted);
        setTotalHours(Math.round(total * 10) / 10);
        setTopPerformer(top);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

 const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-teal-600">
          <span className="font-medium">{payload[0].value}</span> hours
        </p>
      </div>
    );
  }
  return null;
};

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            H
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Analytics
            </h1>
            <p className="text-slate-600 mt-1 text-lg">
              Smart Team Performance • Real-time Insights
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 tracking-widest">
                TOTAL HOURS
              </p>
              <p className="text-5xl font-bold text-slate-900 mt-4">
                {totalHours}
              </p>
            </div>
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 tracking-widest">
                TEAM MEMBERS
              </p>
              <p className="text-5xl font-bold text-slate-900 mt-4">
                {data.length}
              </p>
            </div>
            <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
        </div>

        {topPerformer && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> TOP PERFORMER
                </p>
                <p className="text-5xl font-bold text-slate-900 mt-4">
                  {topPerformer.name}
                </p>
                <p className="text-teal-600 mt-1">{topPerformer.hours} hours</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Hours Worked by Team Member
            </h2>
            <p className="text-slate-500 mt-1">
              This month • Attendance Analytics
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-[420px] flex items-center justify-center">
            <div className="text-slate-400">Loading performance data...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[420px] flex flex-col items-center justify-center text-slate-400">
            <div className="text-6xl mb-4">📊</div>
            <p>No attendance data available yet</p>
          </div>
        ) : (
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="hours"
                  fill="#14b8a6"
                  radius={[8, 8, 0, 0]}
                  background={{ fill: "#f8fafc" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-slate-400 mt-10">
        Homeasy • Smart Living, Perfected
      </p>
    </div>
  );
}
