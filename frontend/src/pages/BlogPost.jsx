import { useParams, Link } from 'react-router-dom';
import parse from 'html-react-parser';
import { useQuery } from '@tanstack/react-query';
import SEO from '../lib/SEO';
import api from '../lib/api';
import { ChevronLeft, Calendar, User, Tag, Clock, Share2, BookOpen, GraduationCap, Award } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '../components/CloudinaryUpload';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () =>
      api
        .get(`/blog/posts/${slug}`)
        .then((r) => r.data)
        .catch(() => null),
  });

  const getOptimizedImage = (imageUrl, width = 1200) => {
    if (!imageUrl) return null;
    if (imageUrl.includes('cloudinary.com')) {
      return getOptimizedCloudinaryUrl(imageUrl, { width });
    }
    return imageUrl;
  };

  const estimateReadingTime = (content) => {
    if (!content) return 1;
    const text = content.replace(/<[^>]*>/g, ' ');
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
      } catch (_) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-burgundy-200 border-t-burgundy-600" />
          <p className="text-gray-500 text-sm">Loading article…</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!post) {
    return (
      <>
        <SEO
          title="Article Not Found | RIHM Blog"
          description="This article is not available."
          canonical="https://ram.institute/blog"
        />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <BookOpen className="w-14 h-14 text-burgundy-200 mb-4" />
          <h1 className="font-display text-3xl text-burgundy-700 mb-2">Article Not Found</h1>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            This post may have been removed or is still being written.
          </p>
          <Link to="/blog" className="btn-burgundy">
            Browse All Articles
          </Link>
        </div>
      </>
    );
  }

  const readingTime = estimateReadingTime(post.content);
  const optimizedCover = getOptimizedImage(post.cover_image, 1400);
  const seoTitle = post.meta_title || `${post.title} | RIHM Blog`;
  const seoDesc = post.meta_description || post.excerpt;
  const seoKeywords = post.meta_keywords || post.category;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        image={optimizedCover || post.cover_image}
        canonical={`https://ram.institute/blog/${slug}`}
        keywords={seoKeywords}
      />

      <article>
        {/* ══════════════════════════════════════════════
            1. HERO BANNER — rich, layered, editorial
        ══════════════════════════════════════════════ */}
        <header className="relative overflow-hidden bg-burgundy-800 text-white">
          {/* — decorative layer: large faint circles — */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-burgundy-700 opacity-60" />
            <div className="absolute top-1/2 -left-32 w-[320px] h-[320px] rounded-full bg-burgundy-900 opacity-50" />
            <div className="absolute -bottom-16 right-1/3 w-[260px] h-[260px] rounded-full bg-gold-600 opacity-10" />
          </div>

          {/* — decorative layer: gold diagonal stripe — */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, transparent 60%, rgba(212,175,55,0.08) 60%, rgba(212,175,55,0.08) 70%, transparent 70%)',
            }}
          />

          {/* — decorative layer: subtle dot grid — */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* — gold top accent bar — */}
          <div className="relative h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

          {/* — content — */}
          <div className="relative container-x max-w-5xl pt-14 md:pt-20 md:pb-[170px]">
            {/* Back link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium mb-8 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Blog
            </Link>

            {/* Category pill */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 bg-gold-500/15 border border-gold-400/30 text-gold-300 text-[11px] uppercase tracking-[0.2em] font-bold px-3.5 py-1.5 rounded-full">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] mb-6 text-white max-w-4xl">
              {post.title}
            </h1>

            {/* Gold divider accent */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] w-10 bg-gold-500 rounded-full" />
              <div className="h-[2px] w-4 bg-gold-500/40 rounded-full" />
            </div>

            {/* Excerpt */}
            <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-3xl">{post.excerpt}</p>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/10">
              {/* Author avatar + name */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <User className="w-4 h-4 text-burgundy-900" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none mb-0.5">Author</p>
                  <p className="text-white font-semibold text-sm leading-none">{post.author}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              <span className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="w-4 h-4 text-gold-400 flex-shrink-0" />
                {formatDate(post.created_at)}
              </span>

              <span className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                {readingTime} min read
              </span>

              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-full transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 rounded-md border border-burgundy-100 bg-white max-w-5xl container-x">
          {/* ══════════════════════════════════════════════
            2. COVER IMAGE
        ══════════════════════════════════════════════ */}
          {post.cover_image && (
            <div className="bg-white">
              <div className="container-x -mt-6">
                <div className="aspect-[16/7] overflow-hidden rounded-sm shadow-2xl ring-1 ring-black/5">
                  <img
                    src={optimizedCover || post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
            3. ARTICLE BODY
        ══════════════════════════════════════════════ */}
          <div className="bg-white">
            <div className="py-8 md:py-10">
              <div className="blog-content">{parse(post.content || '')}</div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
            4. DIVIDER
        ══════════════════════════════════════════════ */}
          <div className="bg-white">
            <div className="">
              <div className="h-px bg-gradient-to-r from-transparent via-burgundy-200 to-transparent" />
            </div>
          </div>

          {/* ══════════════════════════════════════════════
            5. AUTHOR + SHARE STRIP
        ══════════════════════════════════════════════ */}
          <div className="bg-white">
            <div className="py-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-burgundy-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-burgundy-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Written by</p>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-burgundy-200 text-burgundy-600 text-sm font-medium rounded-sm hover:bg-burgundy-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share this article
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* ══════════════════════════════════════════════
            6. CTA SECTION
        ══════════════════════════════════════════════ */}
        <div className="bg-gradient-to-b from-white to-cream py-16">
          <div className="container-x max-w-5xl">
            <div className="relative overflow-hidden bg-burgundy-700 rounded-sm p-8 md:p-12 shadow-burgundy">
              {/* Decorative bg elements */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-burgundy-600 opacity-50" />
              <div className="absolute -bottom-14 -left-14 w-60 h-60 rounded-full bg-burgundy-800 opacity-40" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

              <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                {/* Left: text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-gold-400" />
                    <span className="text-gold-400 text-xs uppercase tracking-[0.2em] font-bold">
                      Admissions 2026 Open
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
                    Ready to Begin Your
                    <br />
                    Hospitality Career?
                  </h3>
                  <p className="text-white/75 text-sm leading-relaxed max-w-md">
                    Join RIHM Dehradun — 97% placement at Taj, Oberoi & ITC, world-class training labs, and a pathway to
                    global opportunities.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Award className="w-3.5 h-3.5 text-gold-400" />
                      <span>26+ years legacy</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Award className="w-3.5 h-3.5 text-gold-400" />
                      <span>7000+ alumni placed</span>
                    </div>
                  </div>
                </div>

                {/* Right: buttons */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Link to="/apply" className="btn-gold text-center whitespace-nowrap">
                    Apply for 2026 Batch
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-sm transition-colors text-sm whitespace-nowrap"
                  >
                    Explore Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            7. BACK LINK
        ══════════════════════════════════════════════ */}
        <div className="bg-cream border-t border-burgundy-100">
          <div className="container-x max-w-5xl py-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-burgundy-600 hover:text-burgundy-700 font-medium text-sm transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to All Articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
