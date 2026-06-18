import SEO from "../lib/SEO";
import { Crown, Star, Ship, Plane, Youtube, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PARTNERS, TESTIMONIALS } from "../data/site";

const VIDEOS = [
  { id: "3y11-xMm2BU", title: "Student Placement Journey", aspect: "16/9" },
  { id: "LqSPWXBQmdw", title: "Campus Life & Training", aspect: "16/9" },
  { id: "WYk5yPHy-kw", title: "Industry Exposure", aspect: "16/9" },
  { id: "xvqNY--zMIQ", title: "Student Testimonial", aspect: "9/16", short: true },
];

export default function PlacementsPage() {
  const [playing, setPlaying] = useState(null);
  return (
    <>
      <SEO
        title="Placements at RIHM Dehradun | 97% Placement at Taj, Oberoi, ITC, Hyatt"
        description="Industry-leading 97% placement rate at Shri Ram Institute Dehradun. 7000+ alumni placed at Taj Rambagh Palace, Oberoi Sukhvilās, ITC Maurya, Hyatt, Marriott, Accor and global cruise lines."
        canonical="https://ram.institute/placements"
      />
      <section className="relative bg-gradient-to-br from-burgundy-800 via-burgundy-700 to-burgundy-600 text-white py-24 overflow-hidden">
        {/* Decorative pattern (no photographic backdrop) */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(43,74%,55%) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-burgundy-400/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-x relative z-10 max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3"><Crown className="inline w-4 h-4 mr-1" /> Placement Powerhouse</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
            Where RIHM <em className="text-gold-400 not-italic">graduates work</em>
          </h1>
          <p className="text-white/85 text-lg max-w-2xl">
            From Taj Rambagh Palace (World&apos;s No.1 rated hotel) to Oberoi, ITC Maurya, Hyatt Regency, Marriott Bonvoy and global cruise lines — RIHM graduates serve guests at the world&apos;s finest luxury hotels.
          </p>
        </div>
      </section>

      {/* Key stats */}
      <section className="py-14 bg-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "97%", l: "Placement Rate" },
            { v: "7000+", l: "Students Placed" },
            { v: "100+", l: "Hotel Partners" },
            { v: "₹12 LPA", l: "Highest Package" },
          ].map((s, i) => (
            <div key={i} className="text-center border border-burgundy-100 rounded-sm p-6">
              <p className="font-display text-5xl font-bold text-burgundy-500">{s.v}</p>
              <p className="text-gray-600 uppercase tracking-widest text-xs mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* YouTube grid */}
      <section className="py-16 lg:py-20 bg-white" aria-label="Placement Videos">
        <div className="container-x">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-3">
              <Youtube className="w-4 h-4" /> Watch Our Videos
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy-700">Hear it directly from <em className="text-gold-500 not-italic">our students</em></h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {VIDEOS.map((v) => {
              const isPlaying = playing === v.id;
              return (
                <div key={v.id} className="bg-white rounded-sm overflow-hidden border border-burgundy-100 shadow-sm hover:shadow-burgundy transition-all duration-300 group" data-testid={`video-${v.id}`}>
                  <div className={`relative overflow-hidden bg-gray-200 ${v.aspect === "9/16" ? "aspect-[9/16]" : "aspect-video"}`}>
                    {isPlaying ? (
                      <iframe
                        title={v.title}
                        src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        onClick={() => setPlaying(v.id)}
                        className="absolute inset-0 w-full h-full group cursor-pointer"
                        aria-label={`Play ${v.title}`}
                        data-testid={`video-play-${v.id}`}
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                          alt={v.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </span>
                        </span>
                        {v.short && (
                          <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">Short</span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-burgundy-700 truncate">{v.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Tap any thumbnail to play • Videos hosted on YouTube</p>
        </div>
      </section>

      {/* Partners grid */}
      <section className="py-20 bg-cream">
        <div className="container-x">
          <div className="text-center mb-14">
            <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">Recruitment Partners</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700">India's top luxury chains recruit at RIHM</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {PARTNERS.map((p) => (
              <div key={p.name} className="bg-white border border-burgundy-100 rounded-sm p-7 hover:shadow-burgundy hover:-translate-y-1 transition-all duration-500 text-center" data-testid={`partner-detail-${p.name.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="h-16 flex items-center justify-center mb-3 border-b border-gold-300/40 pb-3">
                  <div className="flex flex-col items-center">
                    <span className="font-display text-2xl font-bold tracking-wider" style={{ color: p.titleColor }}>{p.name}</span>
                    {p.suffix && <span className="font-body text-xs uppercase tracking-[0.2em]" style={{ color: p.subColor }}>{p.suffix}</span>}
                  </div>
                </div>
                <p className="font-display text-3xl font-bold text-burgundy-500">{p.count}</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Students Placed</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cruise / International */}
      <section className="py-20 bg-white">
        <div className="container-x grid md:grid-cols-2 gap-8">
          <div className="bg-burgundy-50 border border-burgundy-100 rounded-sm p-8">
            <Ship className="w-9 h-9 text-burgundy-500 mb-3" />
            <h3 className="font-display text-3xl font-bold text-burgundy-700 mb-2">Cruise Line Placements</h3>
            <p className="text-gray-700 leading-relaxed mb-3">Exclusive recruitment partnerships with Royal Caribbean, MSC Cruises, Carnival, Norwegian and Princess Cruises — entry-level salaries of USD 1,500–2,500/month plus tips, free accommodation and global travel.</p>
            <ul className="text-sm text-burgundy-700 space-y-1.5">
              <li>• Pre-cruise documentation & visa assistance</li>
              <li>• STCW certification training</li>
              <li>• Direct interviews on campus</li>
            </ul>
          </div>
          <div className="bg-gold-50 border border-gold-200 rounded-sm p-8">
            <Plane className="w-9 h-9 text-gold-600 mb-3" />
            <h3 className="font-display text-3xl font-bold text-burgundy-700 mb-2">Aviation & Hospitality</h3>
            <p className="text-gray-700 leading-relaxed mb-3">BHM and DHM students are placed across aviation hospitality, luxury QSR chains and corporate guest relations — covering IndiGo, Vistara, Air India premium cabin operations and Westin/Marriott corporate F&B.</p>
            <ul className="text-sm text-burgundy-700 space-y-1.5">
              <li>• Cabin crew preparation</li>
              <li>• Ground staff hospitality</li>
              <li>• Corporate guest relations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-20 bg-cream">
        <div className="container-x">
          <div className="text-center mb-12">
            <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">Alumni Stories</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700">From RIHM to 5-star floors</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-burgundy-100 rounded-sm p-6 flex gap-4 hover:shadow-elegant transition-all">
                <img src={t.image} alt={t.name} className="w-20 h-20 rounded-sm object-cover border-2 border-gold-500 flex-shrink-0" loading="lazy" />
                <div>
                  <p className="font-display text-xl font-semibold text-burgundy-700">{t.name}</p>
                  <p className="text-gold-600 text-sm font-medium">{t.role}</p>
                  <p className="text-gray-500 text-xs mb-2">{t.batch}</p>
                  <p className="text-gray-700 text-sm leading-relaxed italic">"{t.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-burgundy-500 text-white text-center">
        <div className="container-x max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Want to be the next RIHM success story?</h2>
          <p className="text-white/80 mb-5">Limited seats for 2026 batch. Apply now to secure your place.</p>
          <Link to="/apply" className="btn-gold inline-flex">Apply for Admission</Link>
        </div>
      </section>
    </>
  );
}
