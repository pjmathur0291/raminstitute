import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Filter, IndianRupee, CheckCircle2, Clock, XCircle } from "lucide-react";
import api from "../../lib/api";

const STATUSES = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export default function AdminApplications() {
  const [filter, setFilter] = useState("");

  const { data: stats = {} } = useQuery({
    queryKey: ["app-stats"],
    queryFn: () => api.get("/admin/applications/stats").then(r => r.data),
  });

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-applications", filter],
    queryFn: () => api.get(`/admin/applications${filter ? `?payment_status=${filter}` : ""}`).then(r => r.data),
  });

  const cards = [
    { label: "Total Applications", value: stats.total ?? 0, Icon: Clock, color: "bg-burgundy-500" },
    { label: "Paid", value: stats.paid ?? 0, Icon: CheckCircle2, color: "bg-emerald-500" },
    { label: "Pending", value: stats.pending ?? 0, Icon: Clock, color: "bg-amber-500" },
    { label: "Revenue (INR)", value: `₹${(stats.revenue_inr ?? 0).toLocaleString("en-IN")}`, Icon: IndianRupee, color: "bg-gold-500" },
  ];

  return (
    <div>
      <div className="mb-7 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-700">Applications</h1>
          <p className="text-sm text-gray-500">Paid applications via online registration + Razorpay</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            data-testid="admin-applications-filter"
            className="h-9 border border-gray-200 rounded-sm px-3 text-sm bg-white"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-sm p-5" data-testid={`app-stat-${c.label.toLowerCase().replace(/\s/g, "-").replace(/[()]/g, "")}`}>
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-white mb-3 ${c.color}`}>
              <c.Icon className="w-5 h-5" />
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{c.label}</p>
            <p className="font-display text-3xl font-bold text-burgundy-700 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3 text-left">App No.</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Father&apos;s Name</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Course</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Payment ID</th>
                <th className="px-5 py-3 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan="9" className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>}
              {!isLoading && apps.length === 0 && (
                <tr><td colSpan="9" className="px-5 py-10 text-center text-gray-400">No applications yet.</td></tr>
              )}
              {apps.map((a) => (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50" data-testid={`app-row-${a.id}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-burgundy-700">{a.application_no}</td>
                  <td className="px-5 py-3 font-semibold">{a.name}</td>
                  <td className="px-5 py-3 text-gray-600">{a.father_name}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">
                    <p>{a.phone}</p>
                    <p className="text-gray-400">{a.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs">{a.course}</td>
                  <td className="px-5 py-3 font-semibold">₹{a.amount_inr}</td>
                  <td className="px-5 py-3"><PaymentBadge status={a.payment_status} /></td>
                  <td className="px-5 py-3 font-mono text-[10px] text-gray-500">{a.razorpay_payment_id || "—"}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentBadge({ status }) {
  const map = {
    paid: { cls: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 },
    pending: { cls: "bg-amber-100 text-amber-700", Icon: Clock },
    failed: { cls: "bg-red-100 text-red-700", Icon: XCircle },
  };
  const m = map[status] || map.pending;
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${m.cls}`}><m.Icon className="w-3 h-3" /> {status}</span>;
}
