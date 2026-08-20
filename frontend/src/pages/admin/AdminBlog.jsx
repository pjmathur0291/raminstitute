import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Trash2, Loader2, Edit, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/api';
import CloudinaryUpload from '../../components/CloudinaryUpload';
import TipTapEditor from '../../components/TipTapEditor';

const INITIAL_FORM = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'Hotel Management Careers',
  author: 'RIHM Editorial',
  cover_image: '',
  published: true,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
};

const CATEGORIES = [
  'Hotel Management Careers',
  'Admissions',
  'Hospitality Industry Trends',
  'Culinary Arts',
  'Bakery',
  'Placements',
  'Scholarships',
  'Campus Life',
  'Alumni Success',
];

export default function AdminBlog() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showSeoFields, setShowSeoFields] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () =>
      api
        .get('/blog/posts')
        .then((r) => r.data)
        .catch(() => []),
  });

  const createMut = useMutation({
    mutationFn: (payload) => api.post('/admin/blog/posts', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      qc.invalidateQueries({ queryKey: ['blog'] });
      setShowForm(false);
      setEditingPost(null);
      setForm(INITIAL_FORM);
      setShowSeoFields(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (slug) => api.delete(`/admin/blog/posts/${slug}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      qc.invalidateQueries({ queryKey: ['blog'] });
    },
  });

  const handleEdit = (post) => {
    setEditingPost(post);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author || 'RIHM Editorial',
      cover_image: post.cover_image || '',
      published: post.published !== false,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      meta_keywords: post.meta_keywords || '',
    });
    setShowForm(true);
    setShowSeoFields(!!(post.meta_title || post.meta_description || post.meta_keywords));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setForm(INITIAL_FORM);
    setShowSeoFields(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    createMut.mutate(form);
  };

  // Auto-generate meta fields from main fields if empty
  const handleAutoFillSeo = () => {
    setForm({
      ...form,
      meta_title: form.meta_title || form.title,
      meta_description: form.meta_description || form.excerpt,
      meta_keywords: form.meta_keywords || form.category,
    });
    setShowSeoFields(true);
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-700">Blog Posts</h1>
          <p className="text-sm text-gray-500">
            Manage editorial content with rich text editor, images, and SEO optimization.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-burgundy text-sm h-9"
          data-testid="admin-blog-toggle-form"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="bg-white border border-gray-200 rounded-sm p-6 mb-6 space-y-5"
          data-testid="admin-blog-form"
        >
          <div className="border-b border-gray-200 pb-4">
            <h2 className="font-display text-xl font-bold text-burgundy-700 mb-1">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <p className="text-xs text-gray-500">
              {editingPost ? 'Update blog post details and content' : 'Fill in all details to create a new blog post'}
            </p>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="url-friendly-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="h-10 px-3 w-full border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                  data-testid="blog-slug"
                  disabled={!!editingPost}
                />
                <p className="text-xs text-gray-500 mt-1">URL: /blog/{form.slug || 'your-slug'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 px-3 w-full border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                  data-testid="blog-category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                placeholder="Blog post title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10 w-full px-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                data-testid="blog-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                placeholder="Author name"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="h-10 w-full px-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                placeholder="Short excerpt or summary (1-2 sentences)"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                data-testid="blog-excerpt"
              />
              <p className="text-xs text-gray-500 mt-1">{form.excerpt.length} characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Published Status</label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 text-burgundy-600 border-gray-300 rounded focus:ring-burgundy-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {form.published ? 'Published (visible on website)' : 'Draft (hidden from website)'}
                </span>
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-3 border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cover Image</h3>
            <CloudinaryUpload
              value={form.cover_image}
              onChange={(url) => setForm({ ...form, cover_image: url })}
              label="Upload Cover Image"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-3 border-t border-gray-200 pt-5">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Content <span className="text-red-500">*</span>
            </label>
            <TipTapEditor
              content={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Write your blog content here..."
            />
          </div>

          {/* SEO Fields */}
          <div className="space-y-3 border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">SEO Metadata</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillSeo}
                  className="text-xs text-burgundy-600 hover:text-burgundy-700 font-medium"
                >
                  Auto-fill from content
                </button>
                <button
                  type="button"
                  onClick={() => setShowSeoFields(!showSeoFields)}
                  className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                >
                  {showSeoFields ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showSeoFields ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {showSeoFields && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    placeholder="SEO title (defaults to post title)"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    className="h-10 w-full px-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optimal: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    placeholder="SEO description (defaults to excerpt)"
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optimal: 150-160 characters ({form.meta_description.length})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                  <input
                    placeholder="hotel management, careers, placements"
                    value={form.meta_keywords}
                    onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                    className="h-10 w-full px-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={createMut.isPending}
              className="btn-burgundy text-sm"
              data-testid="admin-blog-submit"
            >
              {createMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingPost ? (
                <Edit className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {editingPost ? 'Update Post' : 'Publish Post'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10 bg-white rounded-sm border border-gray-200">
            No blog posts yet. Create your first post!
          </p>
        )}
        {posts.map((p) => (
          <div
            key={p.slug}
            className="bg-white border border-gray-200 rounded-sm p-5 flex items-center gap-4 hover:border-burgundy-200 transition-colors"
            data-testid={`admin-blog-${p.slug}`}
          >
            {p.cover_image && (
              <img src={p.cover_image} alt={p.title} className="w-24 h-24 object-cover rounded-sm flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gold-600">{p.category}</p>
                {!p.published && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-semibold">
                    DRAFT
                  </span>
                )}
              </div>
              <p className="font-display text-lg font-bold text-burgundy-700 truncate">{p.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1 mb-1">{p.excerpt}</p>
              <p className="text-xs text-gray-400">
                by {p.author} • {p.created_at}
                {p.updated_at && ` • Updated: ${p.updated_at}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="text-burgundy-600 hover:bg-burgundy-50 p-2 rounded-sm transition-colors"
                title="Edit post"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.confirm(`Delete "${p.title}"?`) && deleteMut.mutate(p.slug)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-sm transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
