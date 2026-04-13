"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { status: string } }[];
  label?: string;
}

type WeeklyDataItem = {
  date?: string;
  status?: string;
};

export default function WeeklyChart({ data }: { data: WeeklyDataItem[] }) {
  // ✅ Safe Data Formatting
  const formatted = data.map((item) => {
    const isPresent = item.status?.toLowerCase() === "present";
    let dayName = "Unknown";

    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
      }
    }

    return {
      day: dayName,
      value: isPresent ? 1 : 0,
      status: isPresent ? "Present" : "Absent",
    };
  });

  // ✅ Premium Dark Tooltip
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const status = payload[0].payload.status;
      const isPresent = status === "Present";

      return (
        <div className="bg-slate-900 px-5 py-3 rounded-xl shadow-2xl border border-slate-700">
          <p className="font-semibold text-slate-100 text-sm">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${isPresent ? "bg-emerald-400" : "bg-slate-500"}`} />
            <p className={`text-sm font-medium ${isPresent ? "text-emerald-400" : "text-slate-400"}`}>
              {status}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm h-[320px] flex flex-col items-center justify-center text-slate-400">
        <div className="text-5xl mb-4">📊</div>
        <p className="font-medium text-slate-500">No weekly data yet</p>
        <p className="text-sm mt-1">Check in to start building your chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Last 7 Days</h3>
          <p className="text-slate-500 text-sm mt-1">Your attendance pattern</p>
        </div>
        
        <div className="flex items-center gap-5 bg-slate-50 rounded-xl px-5 py-2.5 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-sm font-medium text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-slate-200" />
            <span className="text-sm font-medium text-slate-600">Absent</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formatted} 
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            barCategoryGap="20%"
          >
            {/* Subtle Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            
            {/* Clean X Axis */}
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 500 }}
            />
            
            {/* Hidden Y Axis (data is 0 or 1, no need to show 0/1 labels) */}
            <YAxis hide domain={[0, 1]} />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            
            {/* 
              Bar Trick: 
              The "background" prop draws a light slate bar for ALL days. 
              Then, we use <Cell> to draw a green bar ONLY on present days, 
              overlaying the background. This looks much cleaner than harsh gray absent bars.
            */}
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]} 
              maxBarSize={40}
              background={{ fill: "#f1f5f9", radius: 8 }}
            >
              {formatted.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value === 1 ? "#10b981" : "transparent"} 
                  className="transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}