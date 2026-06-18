import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import api from "../../lib/api";

export default function AdminBlog() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", excerpt: "", content: "", category: "Hotel Management Careers", cover_image: "" });

  const { data: posts = [] } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => api.get("/blog/posts").then(r => r.data).catch(() => []),
  });

  const createMut = useMutation({
    mutationFn: (payload) => api.post("/admin/blog/posts", payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      qc.invalidateQueries({ queryKey: ["blog"] });
      setShowForm(false);
      setForm({ slug: "", title: "", excerpt: "", content: "", category: "Hotel Management Careers", cover_image: "" });
    }
  });

  const deleteMut = useMutation({
    mutationFn: (slug) => api.delete(`/admin/blog/posts/${slug}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] })
  });

  const onSubmit = (e) => { e.preventDefault(); createMut.mutate(form); };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-700">Blog Posts</h1>
          <p className="text-sm text-gray-500">Manage editorial content. Published posts appear on /blog.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-burgundy text-sm h-9" data-testid="admin-blog-toggle-form">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "New Post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-sm p-5 mb-6 space-y-3" data-testid="admin-blog-form">
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Slug (e.g. my-post)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="h-10 px-3 border border-gray-200 rounded-sm text-sm" data-testid="blog-slug" />
            <input required placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-10 px-3 border border-gray-200 rounded-sm text-sm" data-testid="blog-category" />
          </div>
          <input required placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="h-10 w-full px-3 border border-gray-200 rounded-sm text-sm" data-testid="blog-title" />
          <input placeholder="Cover Image URL (optional)" value={form.cover_image} onChange={e => setForm({...form, cover_image: e.target.value})} className="h-10 w-full px-3 border border-gray-200 rounded-sm text-sm" />
          <textarea required placeholder="Short excerpt (1-2 lines)" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={2} className="w-full p-3 border border-gray-200 rounded-sm text-sm" data-testid="blog-excerpt" />
          <textarea required placeholder="Full article content (plain text / markdown)" value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={8} className="w-full p-3 border border-gray-200 rounded-sm text-sm font-mono" data-testid="blog-content" />
          <button type="submit" disabled={createMut.isPending} className="btn-burgundy text-sm" data-testid="admin-blog-submit">
            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publish Post
          </button>
        </form>
      )}

      <div className="space-y-3">
        {posts.length === 0 && <p className="text-gray-400 text-sm text-center py-10 bg-white rounded-sm border border-gray-200">No blog posts published yet.</p>}
        {posts.map(p => (
          <div key={p.slug} className="bg-white border border-gray-200 rounded-sm p-5 flex items-center gap-4" data-testid={`admin-blog-${p.slug}`}>
            {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-20 h-20 object-cover rounded-sm flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-gold-600">{p.category}</p>
              <p className="font-display text-lg font-bold text-burgundy-700 truncate">{p.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{p.excerpt}</p>
            </div>
            <button onClick={() => window.confirm("Delete this post?") && deleteMut.mutate(p.slug)} className="text-red-500 hover:bg-red-50 p-2 rounded-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
