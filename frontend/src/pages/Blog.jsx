import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import SEO from "../lib/SEO";
import api from "../lib/api";
import { Calendar, User, ChevronRight, BookOpen } from "lucide-react";

const SAMPLE_POSTS = [
  {
    slug: "career-in-hotel-management-2026",
    title: "Why Hotel Management is the Smartest Career Choice in 2026",
    excerpt: "India's hospitality sector is projected to add 1.5 crore jobs by 2032. Here's why a hotel management degree from a top Dehradun college is your fastest path to a global career.",
    category: "Hotel Management Careers",
    cover_image: "https://images.pexels.com/photos/7821349/pexels-photo-7821349.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    author: "RIHM Editorial",
    created_at: "2026-01-15",
  },
  {
    slug: "bhm-vs-dhm-which-to-choose",
    title: "BHM vs DHM: Which Hotel Management Course Should You Choose?",
    excerpt: "Bachelor's degree or 1-year diploma? Compare duration, career outcomes, salary and progression paths to make the right choice for your hospitality dreams.",
    category: "Admissions",
    cover_image: "https://images.pexels.com/photos/19554793/pexels-photo-19554793.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    author: "Admissions Team",
    created_at: "2026-01-08",
  },
  {
    slug: "top-skills-luxury-hotel-recruiters",
    title: "Top 10 Skills Luxury Hotel Recruiters Look For",
    excerpt: "Taj, Oberoi and ITC look beyond your degree. Here are the 10 skills RIHM trains every student in — that hotel chains can't find enough of.",
    category: "Hospitality Industry Trends",
    cover_image: "https://images.pexels.com/photos/4253315/pexels-photo-4253315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    author: "Career Cell",
    created_at: "2025-12-20",
  },
  {
    slug: "becoming-pastry-chef-2026",
    title: "How to Become a Pastry Chef in India — A Complete Guide",
    excerpt: "From bakery diploma to leading the patisserie section of a 5-star hotel — your step-by-step roadmap from RIHM's master chefs.",
    category: "Bakery",
    cover_image: "https://images.pexels.com/photos/4253315/pexels-photo-4253315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    author: "Master Chef Faculty",
    created_at: "2025-12-12",
  },
  {
    slug: "cruise-line-careers-india",
    title: "Cruise Line Careers: USD Salary, Free Travel, Global Network",
    excerpt: "Cruise lines like Royal Caribbean, MSC and Carnival hire trained Indian hospitality professionals. Here's everything you need to know about cruise line careers.",
    category: "Placements",
    cover_image: "https://images.pexels.com/photos/32273767/pexels-photo-32273767.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    author: "Placement Cell",
    created_at: "2025-11-28",
  },
  {
    slug: "scholarships-hotel-management-2026",
    title: "6 Scholarships You Can Avail for Hotel Management in 2026",
    excerpt: "Merit, Need-Based, Girl Child, Defence Wards — discover ₹3 crore worth of scholarships at RIHM Dehradun and how to qualify.",
    category: "Scholarships",
    cover_image: "https://images.pexels.com/photos/12181750/pexels-photo-12181750.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    author: "Scholarship Committee",
    created_at: "2025-11-15",
  },
];

export default function BlogPage() {
  const { data: posts = [] } = useQuery({
    queryKey: ["blog"],
    queryFn: () => api.get("/blog/posts").then(r => r.data).catch(() => []),
  });

  // Merge sample posts if backend has none
  const displayPosts = posts.length > 0 ? posts : SAMPLE_POSTS;
  const featured = displayPosts[0];
  const rest = displayPosts.slice(1);

  return (
    <>
      <SEO
        title="Hotel Management Blog | RIHM Dehradun | Careers, Admissions, Scholarships"
        description="Insights on hotel management careers, admissions tips, hospitality industry trends, culinary arts, scholarships and placements at top hotels — from India's leading hotel management college."
        canonical="https://ram.institute/blog"
      />
      <section className="bg-burgundy-700 text-white py-24">
        <div className="container-x max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3"><BookOpen className="inline w-4 h-4 mr-1" /> RIHM Editorial</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Hospitality <em className="text-gold-400 not-italic">insights & guidance</em>
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-2xl">
            Expert articles on hotel management careers, admissions, scholarships, placement strategies and the global hospitality industry.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-x">
          {featured && (
            <Link to={`/blog/${featured.slug}`} className="grid lg:grid-cols-2 gap-8 group mb-14" data-testid="blog-featured">
              <div className="aspect-[4/3] overflow-hidden rounded-sm">
                {featured.cover_image && <img src={featured.cover_image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-gold-600 text-xs uppercase tracking-widest font-bold mb-3">Featured • {featured.category}</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700 mb-4 group-hover:text-burgundy-500 transition-colors leading-tight">{featured.title}</h2>
                <p className="text-gray-700 mb-5">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {featured.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featured.created_at}</span>
                </div>
                <span className="text-burgundy-500 font-semibold inline-flex items-center gap-1">Read Article <ChevronRight className="w-4 h-4" /></span>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="premium-card overflow-hidden group" data-testid={`blog-card-${p.slug}`}>
                {p.cover_image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  <span className="text-gold-600 text-[10px] uppercase tracking-widest font-bold">{p.category}</span>
                  <h3 className="font-display text-xl font-semibold text-burgundy-700 mt-1 mb-2 group-hover:text-burgundy-500 transition-colors line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{p.excerpt}</p>
                  <p className="text-xs text-gray-400">{p.author} • {p.created_at}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
