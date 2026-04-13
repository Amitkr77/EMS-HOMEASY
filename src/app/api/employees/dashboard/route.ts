export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance";
import { authOptions } from "@/lib/authOption";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employeeId = session.user.id;

    const today = new Date().toLocaleDateString("en-CA");
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    // 🔥 Parallel queries
    const [employee, todayAttendance, monthlyAttendance, weeklyAttendance] =
      await Promise.all([
        Employee.findById(employeeId),
        Attendance.findOne({ employeeId, date: today }),
        Attendance.find({
          employeeId,
          createdAt: { $gte: startOfMonth },
        }),
        Attendance.find({
          employeeId,
          createdAt: { $gte: startOfWeek },
        }),
      ]);

    // =========================
    // 🟢 TODAY
    // =========================

    let todayData = {
      status: "not_checked_in",
      checkInTime: null,
      checkOutTime: null,
      workedHours: 0,
    };

    if (todayAttendance) {
      const checkIn = todayAttendance.checkIn?.time;
      const checkOut = todayAttendance.checkOut?.time;

      let workedHours = 0;

      if (checkIn) {
        const endTime = checkOut || new Date();
        workedHours =
          (new Date(endTime).getTime() - new Date(checkIn).getTime()) /
          (1000 * 60 * 60);
      }

      todayData = {
        status: todayAttendance.status,
        checkInTime: checkIn,
        checkOutTime: checkOut || null,
        workedHours: Number(workedHours.toFixed(2)),
      };
    }

    // =========================
    // 📊 MONTHLY
    // =========================
    const presentDays = monthlyAttendance.filter(
      (a) => a.status === "present",
    ).length;

    const totalDays = monthlyAttendance.length;

    const attendanceRate =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // =========================
    // 📅 WEEKLY
    // =========================
    const weeklyPresent = weeklyAttendance.filter(
      (a) => a.status === "present",
    ).length;

    // Generate last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toLocaleDateString("en-CA"));
    }

    // Map attendance
    const weeklyChart = last7Days.map((date) => {
      const record = weeklyAttendance.find((a) => a.date === date);

      return {
        date,
        status: record ? record.status : "absent",
      };
    });

    // =========================
    // 🌴 LEAVE
    // =========================
    const leave = employee.leaveBalance;

    return NextResponse.json({
      today: todayData,
      thisMonth: {
        present: presentDays,
        absent: totalDays - presentDays,
        totalWorkingDays: totalDays,
        attendanceRate,
      },
      thisWeek: {
        present: weeklyPresent,
        total: weeklyAttendance.length,
      },
      leave: {
        ...leave,
        total: leave.sick + leave.casual + leave.paid,
      },
      weeklyChart,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}
