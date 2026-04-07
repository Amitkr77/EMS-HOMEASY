import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen overflow-auto">
        {/* Subtle Top Bar */}
        <div className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-10">
          <div className="flex-1" />
          
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-2xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              All systems operational
            </div>
            
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>

        {/* Footer Branding */}
        <div className="border-t border-slate-100 py-8 text-center">
          <p className="text-xs text-slate-400">
            © 2026 Homeasy • Smart Living, Perfected
          </p>
        </div>
      </main>
    </div>
  );
}