import { Link } from "react-router-dom";
import { Award, Briefcase, Building, Crown, Globe, Plane, GraduationCap, MapPin, Phone, Star, Trophy, Utensils, CheckCircle2, ChevronRight, Camera, PhoneCall, Clock as ClockIcon } from "lucide-react";
import SEO from "../lib/SEO";
import LeadForm from "../components/LeadForm";
import { SITE, PARTNERS, TESTIMONIALS, STATS, FAQS_HOME, WHATSAPP_URL, HERO_IMAGE, HERO_IMAGE_MOBILE, TAJ_STUDENTS, OBEROI_STUDENTS, TRAINING_IMAGE } from "../data/site";
import { AI_ANSWERS_HOME, SERVICE_AREAS } from "../data/seo";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useState } from "react";

const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      name: "Shri Ram Institute of Hotel Management",
      alternateName: "RIHM Dehradun",
      url: "https://ram.institute",
      logo: "https://ram.institute/logo.png",
      address: { "@type": "PostalAddress", streetAddress: "430, Niranjanpur", addressLocality: "Dehradun", addressRegion: "Uttarakhand", postalCode: "248001", addressCountry: "IN" },
      telephone: "+91-70555-47000",
      foundingDate: "1999",
      description: "Leading hotel management college in Dehradun, Uttarakhand offering BHM, MHM, DHM, Culinary Arts, Bakery & Bartending with 97% placement at Taj, Oberoi, ITC."
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://ram.institute/#local",
      name: "Shri Ram Institute of Hotel Management",
      address: { "@type": "PostalAddress", streetAddress: "430, Niranjanpur", addressLocality: "Dehradun", addressRegion: "Uttarakhand" },
      telephone: "+91-70555-47000",
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "2150" }
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS_HOME.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    }
  ]
};

export default function HomePage() {
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => api.get("/courses").then(r => r.data) });
  const [openFaq, setOpenFaq] = useState(0);
  const phoneNumbers = SITE.phone.split(",").map(num => num.trim());

  return (
    <>
      <SEO schema={HOME_SCHEMA} canonical="https://ram.institute/" />

      {/* ============================ HERO (matches ram.institute layout) ============================ */}
      <section className="relative min-h-[88vh] md:min-h-screen flex flex-col justify-between overflow-hidden" data-testid="hero-section">
        <h1 className="sr-only">Best Hotel Management College in Dehradun, Uttarakhand — Shri Ram Institute (RIHM)</h1>
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(max-width: 768px)" srcSet={HERO_IMAGE_MOBILE} />
            <source media="(min-width: 769px)" srcSet={HERO_IMAGE} />
            <img src={HERO_IMAGE} alt="RIHM student placed at Taj Hotel" className="absolute inset-0 w-full h-full object-cover object-center" fetchPriority="high" />
          </picture>
          {/* Mobile gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-burgundy-800/85 via-burgundy-700/55 to-burgundy-800/85 md:hidden" />
          {/* Desktop gradient (left side darker for monogram readability) */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-l from-burgundy-800/95 via-burgundy-700/55 to-transparent" />
          {/* Bottom fade to cream so next section blends */}
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
        </div>

        {/* Top-left monogram */}
        <div className="absolute top-20 left-4 md:top-24 md:left-8 z-20">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-3 md:px-5 md:py-4 rounded-sm shadow-elegant border-2 border-gold-500">
            <div className="text-burgundy-600 text-center">
              <div className="flex items-baseline justify-center">
                <span className="font-display text-lg md:text-xl font-medium">श्री</span>
                <span className="font-display text-3xl md:text-4xl font-bold tracking-tight ml-1">RAM</span>
              </div>
              <div className="font-body text-xs md:text-sm font-semibold tracking-[0.25em] -mt-1">INSTITUTE</div>
              <div className="font-body text-[10px] md:text-xs font-medium tracking-[0.2em]">DEHRADUN</div>
              <div className="w-14 md:w-16 h-px bg-gold-500 my-1.5 mx-auto" />
              <div className="font-body text-[9px] md:text-[10px] tracking-[0.15em] text-burgundy-500">EST. 1999</div>
            </div>
          </div>
        </div>

        {/* "Actual image of our student at Taj" caption */}
        <div className="absolute bottom-28 md:bottom-32 left-4 md:left-20 z-20 bg-white/90 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 rounded-sm shadow-elegant border border-gold-300">
          <p className="text-burgundy-500 text-xs md:text-sm font-medium italic">✨ Actual image of our student at Taj</p>
        </div>

        {/* Right-side 3 stacked badges (centered on mobile) */}
        <div className="relative z-10 container-x flex-1 flex items-end pb-32 md:pb-40">
          <div className="w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-end">
            <div className="hidden lg:block" />
            <div className="text-center md:text-right space-y-3">
              <div className="animate-fade-up">
                <div className="inline-block bg-burgundy-500 text-white px-4 py-2 rounded-sm shadow-burgundy">
                  <span className="font-display text-sm md:text-base font-bold tracking-wide">Admissions Open 2026</span>
                </div>
              </div>
              <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
                <div className="inline-block bg-gold-500 text-burgundy-900 px-4 py-2 rounded-sm shadow-gold">
                  <span className="font-display text-sm md:text-base font-bold tracking-wide">7000+ Students Placed in Top Hotels</span>
                </div>
              </div>
              <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="inline-block bg-white/95 backdrop-blur px-4 py-2 md:px-6 md:py-3 rounded-sm shadow-lg border border-gold-200">
                  <p className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
                    <span className="text-burgundy-500">Jobs &amp; Internships</span>
                    <span className="text-gray-700"> with </span>
                    <span className="text-gold-600">5 Star Hotels</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouncing scroll indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-subtle-bounce z-10">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center bg-white/10 backdrop-blur">
            <div className="w-1 h-2 md:h-3 bg-white rounded-full mt-1.5 md:mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ============================ HERO CALLBACK STRIP ============================ */}
      <section className="bg-gradient-to-r from-burgundy-700 to-burgundy-500 py-8" data-testid="hero-callback">
        <div className="container-x max-w-5xl">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { Icon: Briefcase, label: "100% Job Placement", sub: "Guaranteed" },
              { Icon: Building, label: "100+ Hotels", sub: "Partner Network" },
              { Icon: Crown, label: "Limited Seats", sub: "2026 Batch" }
            ].map((it, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-1 md:mb-2">
                  <it.Icon className="w-5 h-5 md:w-6 md:h-6 text-gold-400" />
                </div>
                <p className="text-white font-semibold text-xs md:text-sm">{it.label}</p>
                <p className="text-white/70 text-[10px] md:text-xs">{it.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur rounded-sm p-4 md:p-6 border border-white/20">
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center justify-center gap-2">
                <PhoneCall className="w-5 h-5 md:w-6 md:h-6 text-gold-400" /> Request a FREE Callback
              </h2>
              <p className="text-white/80 text-sm mt-1">Get expert counselling within 30 minutes</p>
            </div>
            <LeadForm variant="inline" source="hero_callback" testIdPrefix="hero" />
          </div>
        </div>
      </section>

      {/* ============================ TAJ PLACEMENT SHOWCASE ============================ */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-cream to-white relative overflow-hidden" aria-label="Taj Hotel Placements">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-burgundy-500/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="container-x relative z-10">
          {/* Heading + Taj logo treatment */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 mb-6 shadow-gold rounded-full">
              <Crown className="w-5 h-5 text-white fill-white" />
              <span className="text-white font-semibold text-sm">World's No.1 Rated Hotel</span>
              <Crown className="w-5 h-5 text-white fill-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              The only private hotel management institute to provide<br className="hidden sm:block" />
              selection for students in the
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
              <div className="bg-white px-6 py-3 rounded-sm shadow-md border-2 border-gold-500">
                <span className="font-display text-2xl font-bold text-gold-600">TAJ</span>
                <span className="font-display text-lg text-gray-500 ml-1">Hotels</span>
              </div>
              <div className="bg-gold-500 px-6 py-3 rounded-sm shadow-gold">
                <span className="font-display text-xl font-bold text-white">Rambagh Palace</span>
              </div>
            </div>
          </div>

          {/* Desktop: side grids around big featured photo */}
          <div className="hidden md:flex items-center justify-center gap-4 lg:gap-6">
            {/* Left grid */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-3">
                <TajCard src={TAJ_STUDENTS.grid[0].src} alt={TAJ_STUDENTS.grid[0].alt} />
                <TajCard src={TAJ_STUDENTS.grid[1].src} alt={TAJ_STUDENTS.grid[1].alt} />
              </div>
              <div className="flex flex-col gap-3 pt-8">
                <TajCard src={TAJ_STUDENTS.grid[2].src} alt={TAJ_STUDENTS.grid[2].alt} />
                <TajCard src={TAJ_STUDENTS.grid[3].src} alt={TAJ_STUDENTS.grid[3].alt} />
              </div>
            </div>

            {/* Center featured */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-sm shadow-2xl border-4 border-gold-500">
                <img src={TAJ_STUDENTS.featured.src} alt={TAJ_STUDENTS.featured.alt} className="w-72 lg:w-96 h-80 lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-gold-700/40 to-transparent" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-sm -z-10 blur-sm opacity-50" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                <Star className="w-4 h-4 fill-white" />
                <span className="font-semibold text-sm">Taj Rambagh Palace</span>
              </div>
            </div>

            {/* Right grid */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-3 pt-8">
                <TajCard src={TAJ_STUDENTS.grid[4].src} alt={TAJ_STUDENTS.grid[4].alt} />
                <TajCard src={TAJ_STUDENTS.grid[5].src} alt={TAJ_STUDENTS.grid[5].alt} />
              </div>
              <div className="flex flex-col gap-3">
                <TajCard src={TAJ_STUDENTS.grid[6].src} alt={TAJ_STUDENTS.grid[6].alt} />
                <TajCard src={TAJ_STUDENTS.grid[7].src} alt={TAJ_STUDENTS.grid[7].alt} />
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="overflow-hidden rounded-sm shadow-2xl border-4 border-gold-500">
                  <img src={TAJ_STUDENTS.featured.src} alt={TAJ_STUDENTS.featured.alt} className="w-72 h-56 object-cover" loading="lazy" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <Star className="w-3 h-3 fill-white" /><span className="font-semibold text-xs">Taj Rambagh Palace</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-8">
              {TAJ_STUDENTS.grid.map((g, i) => (
                <div key={i} className="overflow-hidden rounded-sm shadow-md">
                  <img src={g.src} alt={g.alt} className="w-full h-32 object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gold-600 text-sm font-medium italic mb-2"><Camera className="inline w-4 h-4 mr-1" /> Actual pictures of our students placed at Taj Hotels</p>
            <p className="text-gray-500 text-sm">Shri Ram Institute, Dehradun — Producing World-Class Hospitality Professionals Since 1999</p>
          </div>
        </div>
      </section>

      {/* ============================ OBEROI PLACEMENT SHOWCASE ============================ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-cream relative overflow-hidden" aria-label="Oberoi Hotels Placements">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-burgundy-500/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="container-x relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
                <span className="text-gray-900">The </span>
                <span className="text-burgundy-500">Oberoi&apos;s</span>
              </h2>
              <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
            </div>
            <div className="flex justify-center">
              <div className="bg-white px-8 py-4 rounded-sm shadow-md border-2 border-gold-500">
                <span className="font-display text-2xl md:text-3xl font-bold tracking-wider" style={{ color: "#1a365d" }}>THE OBEROI</span>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-center gap-3 lg:gap-4">
            <div className="flex flex-col gap-3">
              <OberoiCard src={OBEROI_STUDENTS.grid[0].src} alt={OBEROI_STUDENTS.grid[0].alt} />
              <OberoiCard src={OBEROI_STUDENTS.grid[1].src} alt={OBEROI_STUDENTS.grid[1].alt} />
            </div>
            <div className="relative group">
              <div className="relative overflow-hidden rounded-sm shadow-2xl border-4 border-gold-500 bg-gray-100">
                <img src={OBEROI_STUDENTS.featured.src} alt={OBEROI_STUDENTS.featured.alt} className="w-48 lg:w-60 h-auto aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-700/40 to-transparent" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-sm -z-10 blur-sm opacity-50" />
            </div>
            <div className="flex flex-col gap-3">
              <OberoiCard src={OBEROI_STUDENTS.grid[2].src} alt={OBEROI_STUDENTS.grid[2].alt} />
              <OberoiCard src={OBEROI_STUDENTS.grid[3].src} alt={OBEROI_STUDENTS.grid[3].alt} />
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="overflow-hidden rounded-sm shadow-2xl border-4 border-gold-500 bg-gray-100">
                  <img src={OBEROI_STUDENTS.featured.src} alt={OBEROI_STUDENTS.featured.alt} className="w-52 h-auto aspect-[3/4] object-cover" loading="lazy" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              {OBEROI_STUDENTS.grid.map((g, i) => (
                <div key={i} className="overflow-hidden rounded-sm shadow-md bg-gray-100">
                  <img src={g.src} alt={g.alt} className="w-full h-auto aspect-[3/4] object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gold-600 text-sm font-medium italic"><Camera className="inline w-4 h-4 mr-1" /> Actual pictures of our students placed at Oberoi Hotels</p>
          </div>
        </div>
      </section>

      {/* ============================ MID CALLBACK BAR ============================ */}
      <section className="py-8 bg-gradient-to-r from-burgundy-500 to-burgundy-400 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="container-x max-w-5xl relative z-10">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full mb-3">
              <Award className="w-4 h-4 text-gold-400" />
              <span className="text-white text-sm font-medium">Get Free Career Counseling</span>
            </div>
            <h3 className="text-white text-lg md:text-xl font-bold">
              Request a <span className="text-gold-400">FREE Callback</span> from Our Expert
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-white/80 text-xs">
              <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Response in 30 mins</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold-400 fill-gold-400" /> 97% Placement</span>
              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Since 1999</span>
            </div>
          </div>
          <LeadForm variant="inline" source="mid_callback" testIdPrefix="mid" />
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-white text-xs">
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 7000+ Students Placed</span>
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Taj • Oberoi • ITC</span>
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> ₹3 Cr Scholarships</span>
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="bg-cream py-14" aria-label="Statistics">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center p-6 bg-white rounded-sm border border-burgundy-100 hover:border-gold-400 transition-all">
              <p className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 mb-1">{s.value}</p>
              <p className="text-gray-600 text-sm uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ PLACEMENT PARTNERS GRID ============================ */}
      <section className="py-20 bg-white" aria-label="Placement Partners" data-testid="placements-section">
        <div className="container-x">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" /> Placement Powerhouse
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700 mb-3">
              Students placed at the world&apos;s <em className="text-gold-500 not-italic">finest hotels</em>
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {PARTNERS.map((p) => (
              <div key={p.name} className="group bg-cream border border-burgundy-100 rounded-sm p-6 hover:shadow-burgundy hover:-translate-y-1 transition-all duration-500 text-center" data-testid={`partner-${p.name.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="h-16 flex items-center justify-center mb-3 border-b border-gold-300/40 pb-3">
                  <div className="flex flex-col items-center">
                    <span className="font-display text-2xl font-bold tracking-wider" style={{ color: p.titleColor }}>{p.name}</span>
                    {p.suffix && <span className="font-body text-xs uppercase tracking-[0.2em]" style={{ color: p.subColor }}>{p.suffix}</span>}
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-burgundy-500">{p.count}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Students Placed</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/placements" className="btn-outline-burgundy" data-testid="view-all-placements">
              View All Placement Stories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ COURSES PREVIEW (no fees) ============================ */}
      <section className="py-20 bg-cream" aria-label="Courses" data-testid="courses-section">
        <div className="container-x">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> Programs
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700 mb-3">
              Choose your path into <em className="text-gold-500 not-italic">luxury hospitality</em>
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((c) => (
              <Link key={c.slug} to={`/courses/${c.slug}`} className="premium-card overflow-hidden block group" data-testid={`course-card-${c.slug}`}>
                <div className="aspect-[16/10] overflow-hidden bg-cream-dark">
                  {c.hero_image && (
                    <img src={c.hero_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gold-600 uppercase tracking-widest mb-2 font-semibold">
                    <span>{c.duration}</span> • <span>{c.level}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-burgundy-700 mb-2 group-hover:text-burgundy-500 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{c.overview}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-burgundy-100 pt-3">
                    <span className="text-burgundy-500 font-semibold text-sm">Explore Curriculum</span>
                    <span className="text-burgundy-500 group-hover:translate-x-1 transition-transform"><ChevronRight className="w-5 h-5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/courses" className="btn-burgundy" data-testid="view-all-courses">
              Explore All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ WHY US ============================ */}
      <section className="py-20 bg-white">
        <div className="container-x grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              <Award className="w-3.5 h-3.5" /> The RIHM Advantage
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700 mb-5">
              We don&apos;t just <em className="text-gold-500 not-italic">teach hospitality</em>.<br />
              We craft future industry leaders.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Two and a half decades of relentless focus on practical learning, industry integration and student outcomes have made RIHM the institution of choice for ambitious hospitality students across North India.
            </p>
            <div className="relative rounded-sm overflow-hidden shadow-elegant">
              <img src={TRAINING_IMAGE} alt="Students in professional hospitality training" className="w-full h-64 object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-700/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-display text-xl font-semibold">Industry-Ready Graduates</p>
                <p className="text-sm opacity-90">Practical training with India&apos;s top hospitality brands</p>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { Icon: Building, t: "World-Class Infrastructure", d: "Training kitchens, mock bars, restaurants and front-office labs equivalent to 5-star hotels." },
              { Icon: Globe, t: "International Exposure", d: "Student exchange, cruise line tie-ups and global hospitality internship programs." },
              { Icon: Utensils, t: "Hands-on Training", d: "70% practical curriculum. Real-world hospitality simulations from Day 1." },
              { Icon: Award, t: "Industry Certifications", d: "FSSAI, HACCP, AHLEI international certifications stacked with degree." },
              { Icon: Plane, t: "Cruise Line Placements", d: "Exclusive recruitment by Royal Caribbean, MSC, Carnival & Norwegian." },
              { Icon: CheckCircle2, t: "Placement Guarantee", d: "Dedicated placement cell, mock interviews, GD-PI prep and 97% placement record." }
            ].map((b, i) => (
              <div key={i} className="bg-white border border-burgundy-100 hover:border-gold-400 rounded-sm p-5 hover:shadow-burgundy hover:-translate-y-1 transition-all">
                <div className="w-11 h-11 rounded-sm bg-burgundy-50 flex items-center justify-center mb-3">
                  <b.Icon className="w-5 h-5 text-burgundy-500" />
                </div>
                <h3 className="font-display text-lg font-semibold text-burgundy-700 mb-1.5">{b.t}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ ALUMNI VOICES — REAL IMAGES ============================ */}
      <section className="py-20 bg-burgundy-700 text-white" aria-label="Alumni Voices" data-testid="testimonials-section">
        <div className="container-x">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 text-gold-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              <Trophy className="w-3.5 h-3.5" /> Alumni Voices
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
              From RIHM classrooms to <em className="text-gold-400 not-italic">5-star floors</em>
            </h2>
            <div className="h-px w-24 bg-gold-500 mx-auto my-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-sm p-6 hover:border-gold-400 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <img src={t.image} alt={t.name} className="w-20 h-20 rounded-sm object-cover border-2 border-gold-500 flex-shrink-0" loading="lazy" />
                  <div>
                    <p className="font-display text-xl font-semibold">{t.name}</p>
                    <p className="text-gold-300 text-sm">{t.role}</p>
                    <p className="text-white/60 text-xs mt-0.5">{t.batch}</p>
                  </div>
                </div>
                <p className="text-white/85 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ SCHOLARSHIP BANNER ============================ */}
      <section className="py-12 bg-gold-500 text-burgundy-900">
        <div className="container-x flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">₹3 Crore in Scholarships Awarded Every Year</h3>
            <p className="text-burgundy-800/80 text-sm">Merit • Need-Based • Girl Child • Defence Wards • Sibling Discount</p>
          </div>
          <Link to="/scholarships" className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-7 py-3 rounded-sm font-semibold transition-all whitespace-nowrap" data-testid="scholarship-cta">
            Check Eligibility <ChevronRight className="inline w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ============================ AI ANSWER BLOCKS (Generative Search Optimization) ============================ */}
      <section className="py-16 bg-white" aria-label="Hotel Management — Frequently Asked Questions">
        <div className="container-x max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-3">
              Quick Answers
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700">
              Everything you wanted to know about <em className="text-gold-500 not-italic">hotel management in Dehradun</em>
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="space-y-8">
            {AI_ANSWERS_HOME.map((b, i) => (
              <article key={i} className="border-l-4 border-gold-500 pl-5 py-1" data-testid={`ai-answer-${i}`} itemScope itemType="https://schema.org/Question">
                <h3 className="font-display text-xl md:text-2xl font-semibold text-burgundy-700 mb-2" itemProp="name">{b.q}</h3>
                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <p className="text-gray-700 leading-relaxed" itemProp="text">{b.a}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ GEO / SERVICE AREAS (Local SEO) ============================ */}
      <section className="py-12 bg-cream border-y border-burgundy-100" aria-label="Service Areas">
        <div className="container-x max-w-5xl text-center">
          <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3">Serving Students From</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-burgundy-700 mb-5">
            North India&apos;s most trusted hotel management institute
          </h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {SERVICE_AREAS.map((city) => (
              <span key={city} className="bg-white border border-burgundy-100 text-burgundy-700 px-3 py-1.5 text-sm rounded-sm hover:border-gold-500 transition-colors">{city}</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 max-w-2xl mx-auto">RIHM Dehradun proudly accepts applications from students across Uttarakhand, Delhi NCR, Punjab, Haryana, Himachal Pradesh, Uttar Pradesh and beyond. Hostel facilities available for outstation students.</p>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section className="py-20 bg-cream" aria-label="FAQs">
        <div className="container-x max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">FAQs</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700">
              Answers to common <em className="text-gold-500 not-italic">admissions queries</em>
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="space-y-3">
            {FAQS_HOME.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="bg-white border border-burgundy-100 rounded-sm overflow-hidden" data-testid={`faq-${i}`}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-cream-dark transition-colors" data-testid={`faq-toggle-${i}`}>
                    <span className="font-display text-lg font-semibold text-burgundy-700 pr-4">{f.q}</span>
                    <ChevronRight className={`w-5 h-5 text-burgundy-500 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
                  </button>
                  {open && <div className="px-5 pb-5 text-gray-700 leading-relaxed text-sm">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ CONTACT ============================ */}
      <section className="py-20 bg-white" id="enquiry" aria-label="Get in touch">
        <div className="container-x grid lg:grid-cols-2 gap-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">Get Started</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700 mb-4">
              Start Your <em className="text-gold-500 not-italic">Hospitality Career</em> Today
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Fill the form and our expert counsellors will guide you through admission, scholarship & course selection — within 30 minutes of submission.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-sm bg-burgundy-50 flex items-center justify-center"><Phone className="w-5 h-5 text-burgundy-500" /></div>
                <div>
                  <p className="font-semibold text-burgundy-700">Call Admissions</p>
                  {phoneNumbers.map((phone, index) => (<a key={index}
                    href={`tel:${phone}`} className="text-burgundy-500 hover:underline">{phone} {index < phoneNumbers.length - 1 && <span className="">,</span>}</a>))
                  }
                  < p className="text-gray-500 text-xs">Mon-Sat, 9 AM – 7 PM</p>
                </div>
              </div>
              <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:opacity-80">
                <div className="w-11 h-11 rounded-sm bg-burgundy-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-burgundy-500" /></div>
                <div>
                  <p className="font-semibold text-burgundy-700">Visit Campus</p>
                  <p className="text-burgundy-500 underline">{SITE.address}</p>
                  <p className="text-gray-500 text-xs">Click to open in Google Maps</p>
                </div>
              </a>
              {phoneNumbers.map((phone, index) => (<a key={index}
                href={`tel:${phone}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:opacity-80">
                <div className="w-11 h-11 rounded-sm bg-emerald-50 flex items-center justify-center text-emerald-600">💬</div>
                <div>
                  <p className="font-semibold text-burgundy-700">WhatsApp Counsellor</p>
                  <p className="text-burgundy-500">{phone}</p>
                  <p className="text-gray-500 text-xs">Reply in 2 minutes</p>
                </div>
              </a>))}
            </div>
          </div>
          <div>
            <LeadForm source="home_enquiry" testIdPrefix="home-enquiry" title="Request a Callback" subtitle="Our counsellor will contact you within 30 minutes" />
          </div>
        </div>
      </section >
    </>
  );
}

function TajCard({ src, alt }) {
  return (
    <div className="relative group overflow-hidden rounded-sm shadow-lg hover:shadow-burgundy transition-all duration-500">
      <img src={src} alt={alt} className="w-28 lg:w-36 h-36 lg:h-44 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-gold-700/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

function OberoiCard({ src, alt }) {
  return (
    <div className="relative group overflow-hidden rounded-sm shadow-lg hover:shadow-burgundy transition-all duration-500 bg-gray-100">
      <img src={src} alt={alt} className="w-32 lg:w-40 h-auto aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-burgundy-700/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
