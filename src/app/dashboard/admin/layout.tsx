import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { redirect } from "next/navigation";
import HomeasySidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <HomeasySidebar />
      <main className="flex-1 ml-72 min-h-screen overflow-auto">
        {/* Page Content */}
        <div className="p-8 md:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
