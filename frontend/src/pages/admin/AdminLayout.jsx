import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, ExternalLink, IndianRupee } from "lucide-react";
import { getUser, isAuthed, logout, fetchMe } from "../../lib/auth";

const NAV = [
  { to: "/admin", end: true, label: "Overview", slug: "overview", Icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", slug: "leads", Icon: Users },
  { to: "/admin/applications", label: "Applications", slug: "applications", Icon: IndianRupee },
  { to: "/admin/courses", label: "Courses", slug: "courses", Icon: BookOpen },
  { to: "/admin/blog", label: "Blog Posts", slug: "blog", Icon: FileText },
];

export default function AdminLayout() {
  const [user, setUser] = useState(getUser());
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthed()) return;
    fetchMe().then((u) => { if (u) setUser(u); else nav("/admin/login"); });
  }, [nav]);

  if (!isAuthed()) return <Navigate to="/admin/login" replace />;

  const onLogout = () => { logout(); nav("/admin/login"); };

  return (
    <div className="min-h-screen bg-gray-50 font-dash flex">
      {/* Sidebar */}
      <aside className="w-64 bg-burgundy-700 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white text-burgundy-600 flex flex-col items-center justify-center rounded-sm border-2 border-gold-500">
              <span className="font-display text-sm leading-none font-bold">श्री</span>
              <span className="font-display text-[7px] leading-none tracking-widest mt-0.5">RAM</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold">RIHM Admin</p>
              <p className="text-[10px] text-gold-300 uppercase tracking-widest">CMS Console</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`admin-nav-${n.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive ? "bg-gold-500 text-burgundy-900" : "text-white/80 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <n.Icon className="w-4 h-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/70 text-xs px-3 py-2 hover:text-white">
            <ExternalLink className="w-3.5 h-3.5" /> View Public Site
          </a>
          <button onClick={onLogout} data-testid="admin-logout" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-white/80 hover:bg-white/5 hover:text-white">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-burgundy-700 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-display text-base font-bold">RIHM Admin</p>
          <p className="text-[10px] text-gold-300">{user?.email}</p>
        </div>
        <button onClick={onLogout} className="text-xs"><LogOut className="w-4 h-4" /></button>
      </div>

      <main className="flex-1 p-5 md:p-8 mt-14 md:mt-0 overflow-x-hidden">
        {/* Mobile bottom nav */}
        <div className="md:hidden grid grid-cols-5 fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `text-[10px] py-3 flex flex-col items-center ${isActive ? "text-burgundy-500" : "text-gray-500"}`}>
              <n.Icon className="w-4 h-4 mb-0.5" /> {n.label}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
