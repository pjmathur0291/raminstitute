import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../lib/api";
import { Link } from "react-router-dom";

export default function AdminOverview() {
  const { data: stats = {} } = useQuery({
    queryKey: ["lead-stats"],
    queryFn: () => api.get("/admin/leads/stats").then(r => r.data),
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["admin-leads-recent"],
    queryFn: () => api.get("/admin/leads?limit=5").then(r => r.data),
  });

  const cards = [
    { label: "Total Leads", value: stats.total ?? 0, Icon: Users, color: "bg-burgundy-500" },
    { label: "New (Untouched)", value: stats.new ?? 0, Icon: AlertCircle, color: "bg-amber-500" },
    { label: "Last 7 Days", value: stats.last_7_days ?? 0, Icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Converted", value: stats.converted ?? 0, Icon: CheckCircle, color: "bg-gold-500" },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-700">Admissions Overview</h1>
        <p className="text-sm text-gray-500">Live snapshot of admissions enquiries and CMS activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-sm p-5" data-testid={`stat-${c.label.toLowerCase().replace(/\s/g, '-').replace(/[()]/g, '')}`}>
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-white mb-3 ${c.color}`}>
              <c.Icon className="w-5 h-5" />
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{c.label}</p>
            <p className="font-display text-3xl font-bold text-burgundy-700 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-burgundy-700">Recent Enquiries</h2>
          <Link to="/admin/leads" className="text-burgundy-500 text-sm hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Course</th>
                <th className="px-5 py-3 text-left">Source</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">When</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">No leads yet. Submit a test form on the website to see them here.</td></tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold">{l.name}</td>
                  <td className="px-5 py-3 text-gray-600">{l.phone}</td>
                  <td className="px-5 py-3">{l.course || "—"}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-sm">{l.source}</span></td>
                  <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    new: "bg-amber-100 text-amber-700",
    contacted: "bg-blue-100 text-blue-700",
    qualified: "bg-purple-100 text-purple-700",
    converted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-gray-100 text-gray-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${map[status] || map.new}`}>{status}</span>;
}
