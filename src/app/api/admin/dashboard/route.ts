import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date().toISOString().split("T")[0];

    // =============================
    // 1. TOTAL EMPLOYEES
    // =============================
    const totalEmployees = await Employee.countDocuments({
      role: { $ne: "admin" },
    });

    // =============================
    // 2. TODAY ATTENDANCE
    // =============================
    const todayAttendance = await Attendance.find({ date: today });

    const presentToday = todayAttendance.filter(
      (a) => a.status === "present",
    ).length;

    const absentToday = totalEmployees - presentToday;

    // =============================
    // 3. LEAVE TODAY
    // =============================
    const leaveToday = await Attendance.countDocuments({
      date: today,
      status: "leave",
    });

    // =============================
    // 4. ATTENDANCE RATE (simple monthly avg)
    // =============================
    const last30Days = await Attendance.find({
      date: { $gte: getPastDate(30) },
    });

    const attendanceRate =
      totalEmployees === 0
        ? 0
        : Math.round(
            (last30Days.filter((a) => a.status === "present").length /
              (totalEmployees * 30)) *
              100,
          );

    // =============================
    // 5. RECENT EMPLOYEES
    // =============================
    const recentEmployees = await Employee.find({
      role: { $ne: "admin" },
    })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // =============================
    // 6. DEPARTMENT STATS
    // =============================
    const departmentStats = await Employee.aggregate([
      { $match: { role: { $ne: "admin" } } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    // =============================
    // 7. RECENT ATTENDANCE ACTIVITY
    // =============================
    const recentAttendance = await Attendance.find({})
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // =============================
    // RESPONSE
    // =============================
    return Response.json({
      totalEmployees,
      presentToday,
      absentToday,
      leaveToday,
      attendanceRate,
      recentEmployees,
      departmentStats,
      recentAttendance,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// =============================
// Helper: Get past date
// =============================
function getPastDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}
