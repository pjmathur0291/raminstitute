import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, Mail, MessageSquare, Trash2, Filter, X } from "lucide-react";
import api from "../../lib/api";
import { StatusBadge } from "./AdminOverview";

const STATUSES = ["new", "contacted", "qualified", "converted", "rejected"];

export default function AdminLeads() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads", filter],
    queryFn: () => api.get(`/admin/leads${filter ? `?status_filter=${filter}` : ""}`).then(r => r.data),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/admin/leads/${id}`, payload).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["lead-stats"] });
      setSelected(data);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["lead-stats"] });
      setSelected(null);
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-700">Lead Inbox</h1>
          <p className="text-sm text-gray-500">All admissions enquiries from the website</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            data-testid="admin-leads-filter"
            className="h-9 border border-gray-200 rounded-sm px-3 text-sm bg-white"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Course</th>
                <th className="px-5 py-3 text-left">City</th>
                <th className="px-5 py-3 text-left">Source</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>}
              {!isLoading && leads.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-400">No leads found.</td></tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} onClick={() => setSelected(l)} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" data-testid={`lead-row-${l.id}`}>
                  <td className="px-5 py-3 font-semibold">{l.name}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">
                    <p>{l.phone}</p>
                    {l.email && <p className="text-gray-400">{l.email}</p>}
                  </td>
                  <td className="px-5 py-3">{l.course || "—"}</td>
                  <td className="px-5 py-3">{l.city || "—"}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-sm">{l.source}</span></td>
                  <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setSelected(null)} data-testid="lead-detail-drawer">
          <div className="w-full sm:max-w-md bg-white h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold text-burgundy-700">{selected.name}</p>
                <p className="text-xs text-gray-500">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-burgundy-500" data-testid="lead-drawer-close"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <DetailRow Icon={Phone} label="Phone" value={selected.phone} href={`tel:${selected.phone}`} />
              <DetailRow Icon={Mail} label="Email" value={selected.email || "—"} href={selected.email ? `mailto:${selected.email}` : undefined} />
              <DetailRow label="City" value={selected.city || "—"} />
              <DetailRow label="Course" value={selected.course || "—"} />
              <DetailRow label="Source" value={selected.source} />
              <DetailRow label="Message" value={selected.message || "—"} />
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold block mb-1.5">Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateMut.mutate({ id: selected.id, payload: { status: e.target.value } })}
                  data-testid="lead-status-select"
                  className="w-full h-10 px-3 border border-gray-200 rounded-sm text-sm bg-white"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold block mb-1.5">Internal Notes</label>
                <textarea
                  defaultValue={selected.notes || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (selected.notes || "")) {
                      updateMut.mutate({ id: selected.id, payload: { notes: e.target.value } });
                    }
                  }}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-sm text-sm"
                  placeholder="Add internal notes (saved on blur)"
                  data-testid="lead-notes"
                />
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <a href={`tel:${selected.phone}`} className="btn-burgundy flex-1 text-xs h-9 px-3"><Phone className="w-3.5 h-3.5" /> Call</a>
                <a href={`https://wa.me/91${selected.phone}?text=${encodeURIComponent(`Hi ${selected.name}, this is RIHM Dehradun. We received your enquiry about ${selected.course || 'admissions'}.`)}`} target="_blank" rel="noreferrer" className="bg-[#25D366] hover:bg-[#1FB855] text-white text-xs h-9 px-3 rounded-sm inline-flex items-center gap-1 font-medium"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</a>
                <button onClick={() => window.confirm("Delete lead permanently?") && deleteMut.mutate(selected.id)} className="bg-red-50 text-red-600 text-xs h-9 px-3 rounded-sm inline-flex items-center gap-1 font-medium hover:bg-red-100" data-testid="lead-delete">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ Icon, label, value, href }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      {href ? <a href={href} className="text-burgundy-500 hover:underline text-sm font-semibold break-all">{value}</a> : <p className="text-sm font-medium text-gray-800 whitespace-pre-line">{value}</p>}
    </div>
  );
}
