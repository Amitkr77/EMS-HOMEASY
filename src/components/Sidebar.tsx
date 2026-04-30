"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Clock,
  LogOut,
  Bell,
  Camera,
  Megaphone,
  ListTodo,
  BarChart3,
  ChevronRight,
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

  // ✅ Grouped Navigation with Unique Icons
  const navGroups = isAdmin
    ? [
        {
          title: "OVERVIEW",
          items: [
            {
              href: "/dashboard/admin",
              label: "Dashboard",
              icon: <LayoutDashboard className="w-5 h-5" />,
            },
            {
              href: "/dashboard/admin/analytics",
              label: "Analytics",
              icon: <BarChart3 className="w-5 h-5" />,
            },
          ],
        },
        {
          title: "MANAGEMENT",
          items: [
            {
              href: "/dashboard/admin/employees",
              label: "Team Members",
              icon: <Users className="w-5 h-5" />,
            },
            {
              href: "/dashboard/admin/attendance",
              label: "Attendance",
              icon: <CalendarCheck className="w-5 h-5" />,
            },
            {
              href: "/dashboard/admin/leave",
              label: "Leave Requests",
              icon: <Clock className="w-5 h-5" />,
            },
            {
              href: "/dashboard/admin/tasks",
              label: "Manage Tasks",
              icon: <ListTodo className="w-5 h-5" />,
            },
          ],
        },
        {
          title: "COMMUNICATION",
          items: [
            {
              href: "/dashboard/admin/notice",
              label: "Send Notice",
              icon: <Megaphone className="w-5 h-5" />,
            },
          ],
        },
        {
          title: "CONTENT",
          items: [
            {
              href: "/dashboard/admin/blog",
              label: "Blog post",
              icon: <Megaphone className="w-5 h-5" />,
            },
          ],
        },
      ]
    : [
        {
          title: "MAIN",
          items: [
            {
              href: "/dashboard",
              label: "Dashboard",
              icon: <LayoutDashboard className="w-5 h-5" />,
            },
          ],
        },
        {
          title: "MY WORKSPACE",
          items: [
            {
              href: "/dashboard/employee/attendance",
              label: "Mark Attendance",
              icon: <Camera className="w-5 h-5" />,
            },
            {
              href: "/dashboard/employee/attendance/history",
              label: "Attendance History",
              icon: <CalendarDays className="w-5 h-5" />,
            },
            {
              href: "/dashboard/employee/leave",
              label: "Apply Leave",
              icon: <Clock className="w-5 h-5" />,
            },
            {
              href: "/dashboard/employee/tasks",
              label: "My Tasks",
              icon: <ListTodo className="w-5 h-5" />,
            },
            {
              href: "/dashboard/employee/notices",
              label: "Notices",
              icon: <Bell className="w-5 h-5" />,
            },
          ],
        },
      ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && !isAdmin) return pathname === "/dashboard";
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-950 text-white flex flex-col z-50 border-r border-slate-800/50">
      {/* Logo / Brand */}
      <div className="px-6 py-7 border-b border-slate-800/50">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/20">
            H
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Homeasy</h1>
            <p className="text-[10px] text-teal-400/80 font-semibold uppercase tracking-widest -mt-0.5">
              Smart Living
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        {navGroups.map((group, index) => (
          <div key={group.title} className={index > 0 ? "mt-8" : ""}>
            <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium
                      transition-all duration-200 ease-out group
                      ${
                        active
                          ? "text-white bg-gradient-to-r from-teal-600/20 to-transparent"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                      }
                    `}
                  >
                    {/* Active Indicator Bar */}
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full transition-all duration-300 ${
                        active
                          ? "bg-teal-400 opacity-100"
                          : "bg-transparent opacity-0 group-hover:bg-slate-600 group-hover:opacity-100"
                      }`}
                    />

                    {/* Icon */}
                    <span
                      className={`transition-colors duration-200 ${
                        active
                          ? "text-teal-400 drop-shadow-sm"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Hover Arrow (subtle) */}
                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-200 ${
                        active
                          ? "text-teal-400 opacity-100 -translate-y-px"
                          : "text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Section */}
      <div className="p-4 border-t border-slate-800/50 mt-auto bg-slate-900/30">
        {session?.user && (
          <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-900/30 flex-shrink-0">
              {session.user.name?.charAt(0).toUpperCase() ||
                session.user.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate leading-tight">
                {session.user.name || session.user.email?.split("@")[0]}
              </p>
              <p className="text-[11px] text-teal-400/70 font-medium capitalize mt-0.5">
                {session.user.role === "admin" ? "🛡️ Administrator" : "👤 Team Member"}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-[13px] font-medium
            text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 
            transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}