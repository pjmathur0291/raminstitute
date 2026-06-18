import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "../lib/SEO";
import api from "../lib/api";
import { ChevronLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => api.get(`/blog/posts/${slug}`).then(r => r.data).catch(() => null),
  });

  if (isLoading) return <div className="container-x py-20 text-center text-gray-500">Loading…</div>;

  if (!post) {
    return (
      <section className="container-x py-20 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-burgundy-500 text-sm mb-4"><ChevronLeft className="w-4 h-4" /> All Articles</Link>
        <h1 className="font-display text-3xl text-burgundy-700">Article coming soon</h1>
        <p className="text-gray-600 mt-2">This post is being written by our editorial team. In the meantime, explore the rest of our hospitality knowledge base.</p>
        <Link to="/blog" className="btn-burgundy mt-5 inline-flex">Browse Blog</Link>
      </section>
    );
  }

  return (
    <>
      <SEO title={`${post.title} | RIHM Blog`} description={post.excerpt} image={post.cover_image} canonical={`https://ram.institute/blog/${slug}`} />
      <article className="container-x py-16 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-burgundy-500 text-sm mb-4"><ChevronLeft className="w-4 h-4" /> All Articles</Link>
        <p className="text-gold-600 text-xs uppercase tracking-widest font-bold mb-2">{post.category}</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy-700 leading-tight mb-3">{post.title}</h1>
        <p className="text-gray-500 text-sm">{post.author} • {post.created_at}</p>
        {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full rounded-sm my-8" />}
        <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-line text-base">{post.content}</div>
      </article>
    </>
  );
}
