import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../lib/SEO';
import api from '../lib/api';
import { ChevronLeft, Calendar, User, Tag, Clock, Share2, BookOpen } from 'lucide-react';
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
        {/* ── 1. HERO HEADER ── */}
        <header className="bg-gradient-to-b from-burgundy-700 via-burgundy-600 to-burgundy-700 text-white">
          <div className="container-x max-w-4xl py-14 md:py-20">
            {/* Back link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Link>

            {/* Category pill */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-3xl">{post.excerpt}</p>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70 pt-6 border-t border-white/20">
              <span className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold-500/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gold-300" />
                </div>
                <span className="text-white font-medium">{post.author}</span>
              </span>

              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-400" />
                {formatDate(post.created_at)}
              </span>

              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" />
                {readingTime} min read
              </span>

              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </header>

        {/* ── 2. COVER IMAGE ── */}
        {post.cover_image && (
          <div className="bg-burgundy-700">
            <div className="container-x max-w-5xl">
              <div className="aspect-[16/7] overflow-hidden rounded-b-sm shadow-2xl">
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

        {/* ── 3. ARTICLE BODY ── */}
        <div className="bg-white">
          <div className="container-x max-w-3xl py-14 md:py-20">
            <div
              className="
                /* ── Base text ── */
                text-gray-800 text-[17px] leading-[1.85] font-body

                /* ── Paragraphs ── */
                [&>p]:mb-6 [&>p]:leading-[1.85]

                /* ── Headings ── */
                [&>h1]:font-display [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-burgundy-700
                [&>h1]:mt-12 [&>h1]:mb-5 [&>h1]:leading-tight [&>h1]:tracking-tight

                [&>h2]:font-display [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-burgundy-700
                [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:leading-snug
                [&>h2]:pb-3 [&>h2]:border-b [&>h2]:border-burgundy-100

                [&>h3]:font-display [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-burgundy-600
                [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:leading-snug

                [&>h4]:font-sans [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-gray-900
                [&>h4]:mt-6 [&>h4]:mb-2

                /* ── First heading top spacing fix ── */
                [&>*:first-child]:mt-0

                /* ── Strong ── */
                [&_strong]:font-semibold [&_strong]:text-gray-900

                /* ── Links ── */
                [&_a]:text-burgundy-600 [&_a]:underline [&_a]:underline-offset-2
                [&_a:hover]:text-burgundy-700 [&_a]:transition-colors

                /* ── Bullet list ── */
                [&>ul]:my-6 [&>ul]:pl-0 [&>ul]:space-y-2 [&>ul]:list-none
                [&>ul>li]:relative [&>ul>li]:pl-6
                [&>ul>li]:before:content-[''] [&>ul>li]:before:absolute [&>ul>li]:before:left-0
                [&>ul>li]:before:top-[0.6em] [&>ul>li]:before:w-2 [&>ul>li]:before:h-2
                [&>ul>li]:before:rounded-full [&>ul>li]:before:bg-gold-500

                /* ── Ordered list ── */
                [&>ol]:my-6 [&>ol]:pl-0 [&>ol]:space-y-3 [&>ol]:list-none [&>ol]:counter-reset-[list-counter]
                [&>ol>li]:relative [&>ol>li]:pl-10 [&>ol>li]:counter-increment-[list-counter]
                [&>ol>li]:before:content-[counter(list-counter)] [&>ol>li]:before:absolute
                [&>ol>li]:before:left-0 [&>ol>li]:before:top-0 [&>ol>li]:before:flex
                [&>ol>li]:before:items-center [&>ol>li]:before:justify-center
                [&>ol>li]:before:w-7 [&>ol>li]:before:h-7 [&>ol>li]:before:rounded-full
                [&>ol>li]:before:bg-burgundy-600 [&>ol>li]:before:text-white
                [&>ol>li]:before:text-xs [&>ol>li]:before:font-bold [&>ol>li]:before:leading-none

                /* ── Blockquote ── */
                [&>blockquote]:my-8 [&>blockquote]:pl-6 [&>blockquote]:pr-4 [&>blockquote]:py-4
                [&>blockquote]:border-l-4 [&>blockquote]:border-gold-500
                [&>blockquote]:bg-gold-50 [&>blockquote]:rounded-r-sm
                [&>blockquote]:italic [&>blockquote]:text-gray-700 [&>blockquote]:text-lg

                /* ── Inline code ── */
                [&_code]:bg-burgundy-50 [&_code]:text-burgundy-700 [&_code]:px-1.5 [&_code]:py-0.5
                [&_code]:rounded [&_code]:text-[0.875em] [&_code]:font-mono [&_code]:border
                [&_code]:border-burgundy-100

                /* ── Code block ── */
                [&>pre]:my-6 [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-5
                [&>pre]:rounded-sm [&>pre]:overflow-x-auto [&>pre]:text-sm [&>pre]:font-mono
                [&>pre>code]:bg-transparent [&>pre>code]:border-0 [&>pre>code]:text-gray-100
                [&>pre>code]:p-0

                /* ── Images inside content ── */
                [&>img]:my-8 [&>img]:rounded-sm [&>img]:shadow-lg [&>img]:w-full

                /* ── Horizontal rule ── */
                [&>hr]:my-10 [&>hr]:border-0 [&>hr]:h-px [&>hr]:bg-gradient-to-r
                [&>hr]:from-transparent [&>hr]:via-burgundy-200 [&>hr]:to-transparent
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>

        {/* ── 4. DIVIDER ── */}
        <div className="bg-white">
          <div className="container-x max-w-3xl">
            <div className="h-px bg-gradient-to-r from-transparent via-burgundy-200 to-transparent" />
          </div>
        </div>

        {/* ── 5. AUTHOR + SHARE STRIP ── */}
        <div className="bg-white">
          <div className="container-x max-w-3xl py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-burgundy-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Written by</p>
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

        {/* ── 6. CTA SECTION ── */}
        <div className="bg-gradient-to-b from-white to-cream py-16">
          <div className="container-x max-w-3xl">
            <div className="relative overflow-hidden bg-burgundy-700 rounded-sm p-8 md:p-12 text-center shadow-burgundy">
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-burgundy-600 opacity-40" />
              <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-burgundy-800 opacity-30" />
              <div className="relative">
                <span className="inline-block text-gold-400 text-xs uppercase tracking-[0.3em] font-bold mb-3">
                  Start Your Journey
                </span>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Ready to Begin Your
                  <br className="hidden md:block" /> Hospitality Career?
                </h3>
                <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
                  Join RIHM Dehradun — expert training, 97% placement record at Taj, Oberoi & ITC, and a pathway to
                  global opportunities.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/apply" className="btn-gold">
                    Apply for 2026 Batch
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-sm transition-colors"
                  >
                    View Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. BACK LINK ── */}
        <div className="bg-cream border-t border-burgundy-100">
          <div className="container-x max-w-3xl py-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-burgundy-600 hover:text-burgundy-700 font-medium text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to All Articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
