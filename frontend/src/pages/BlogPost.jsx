import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../lib/SEO';
import api from '../lib/api';
import { ChevronLeft, Calendar, User, Tag, Clock, Share2 } from 'lucide-react';
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

  // Helper to get optimized image URL
  const getOptimizedImage = (imageUrl, width = 1200) => {
    if (!imageUrl) return null;
    if (imageUrl.includes('cloudinary.com')) {
      return getOptimizedCloudinaryUrl(imageUrl, { width });
    }
    return imageUrl;
  };

  // Estimate reading time (average 200 words per minute)
  const estimateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-burgundy-200 border-t-burgundy-600 mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <SEO
          title="Article Not Found | RIHM Blog"
          description="This article is not available."
          canonical="https://ram.institute/blog"
        />
        <section className="container-x py-20 max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-burgundy-500 text-sm mb-4 hover:text-burgundy-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> All Articles
          </Link>
          <div className="text-center py-12">
            <h1 className="font-display text-3xl text-burgundy-700 mb-3">Article Not Found</h1>
            <p className="text-gray-600 mb-6">
              This post is being written by our editorial team or may have been removed.
            </p>
            <Link to="/blog" className="btn-burgundy inline-flex">
              Browse All Articles
            </Link>
          </div>
        </section>
      </>
    );
  }

  const readingTime = estimateReadingTime(post.content);
  const optimizedCoverImage = getOptimizedImage(post.cover_image, 1200);

  // Use custom SEO meta or fallback to defaults
  const seoTitle = post.meta_title || `${post.title} | RIHM Blog`;
  const seoDescription = post.meta_description || post.excerpt;
  const seoKeywords = post.meta_keywords || post.category;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={optimizedCoverImage || post.cover_image}
        canonical={`https://ram.institute/blog/${slug}`}
        keywords={seoKeywords}
      />

      {/* Hero Section */}
      <article className="bg-white">
        <div className="bg-gradient-to-b from-burgundy-50 to-white">
          <div className="container-x py-8 max-w-4xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-burgundy-600 hover:text-burgundy-700 text-sm font-medium mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Link>

            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-gold-600 text-xs uppercase tracking-widest font-bold">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-burgundy-700 leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-700 leading-relaxed mb-6">{post.excerpt}</p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-burgundy-500" />
                <span className="font-medium">{post.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-burgundy-500" />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-burgundy-500" />
                {readingTime} min read
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-burgundy-600 hover:text-burgundy-700 transition-colors ml-auto"
                title="Share article"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="container-x max-w-5xl py-8">
            <div className="aspect-[21/9] overflow-hidden rounded-sm shadow-lg">
              <img
                src={optimizedCoverImage || post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container-x py-12 max-w-3xl">
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed
              prose-headings:font-display prose-headings:text-burgundy-700
              prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-2xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-5
              prose-p:mb-4 prose-p:leading-relaxed
              prose-a:text-burgundy-600 prose-a:no-underline hover:prose-a:text-burgundy-700 hover:prose-a:underline
              prose-strong:text-burgundy-800 prose-strong:font-semibold
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-6
              prose-img:rounded-sm prose-img:shadow-md prose-img:my-6
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-burgundy-700
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-sm prose-pre:my-6 prose-pre:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Article Footer - CTA */}
        <div className="bg-gradient-to-b from-white to-burgundy-50 py-12">
          <div className="container-x max-w-3xl">
            <div className="bg-burgundy-700 text-white rounded-sm p-8 text-center">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Ready to Start Your Hospitality Career?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Join RIHM Dehradun and get expert training, guaranteed placements, and a pathway to global
                opportunities.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/apply" className="btn-gold">
                  Apply Now
                </Link>
                <Link
                  to="/courses"
                  className="btn-outline-burgundy bg-white border-white text-burgundy-700 hover:bg-burgundy-50"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Blog Link */}
        <div className="container-x py-8 max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-burgundy-600 hover:text-burgundy-700 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Articles
          </Link>
        </div>
      </article>
    </>
  );
}
