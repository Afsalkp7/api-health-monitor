"use client";

// Temporary placeholders if you haven't created these components yet
function Sidebar() {
  return <div className="w-64 bg-slate-900 text-white p-4 hidden md:block">Sidebar</div>;
}

function Navbar() {
  return <div className="h-16 bg-white border-b flex items-center px-6">Navbar</div>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}