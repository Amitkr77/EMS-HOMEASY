"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  LogOut,
  Bell,
  Camera,
} from "lucide-react";

export default function HomeasySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const isAdmin = session?.user?.role === "admin";

  const navItems = isAdmin
    ? [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/employees",
          label: "Team Members",
          icon: <Users className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/attendance",
          label: "Attendance",
          icon: <Calendar className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/leave",
          label: "Leave Requests",
          icon: <Clock className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/notice",
          label: "Send Notice",
          icon: <Bell className="w-5 h-5" />,
        },
      ]
    : [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: "/dashboard/employee/attendance",
          label: "Mark Attendance",
          icon: <Camera className="w-5 h-5" />,
        },
        {
          href: "/dashboard/employee/attendance/history",
          label: "Attendance History",
          icon: <Calendar className="w-5 h-5" />,
        },
        {
          href: "/dashboard/employee/leave",
          label: "Apply Leave",
          icon: <Clock className="w-5 h-5" />,
        },
      ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-950 text-white flex flex-col z-50 border-r border-slate-800">
      {/* Logo / Brand */}
      <div className="px-8 py-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            H
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Homeasy</h1>
            <p className="text-xs text-teal-400 font-medium -mt-1">
              Smart Living
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 overflow-y-auto">
        <p className="px-4 mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          MAIN MENU
        </p>

        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-sm font-medium
                  transition-all duration-200 group
                  ${
                    active
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-950/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }
                `}
              >
                <span
                  className={`transition-colors ${active ? "text-white" : "group-hover:text-teal-400"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom User Section */}
      <div className="p-6 border-t border-slate-800 mt-auto">
        {session?.user && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {session.user.name?.charAt(0).toUpperCase() ||
                session.user.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {session.user.name || session.user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-teal-400 capitalize">
                {session.user.role || "Team Member"}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl text-sm font-medium
            text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
