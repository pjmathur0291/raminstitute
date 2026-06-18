import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock, GraduationCap, Briefcase, BookOpen, TrendingUp, Check, ChevronLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import SEO from "../lib/SEO";
import api from "../lib/api";
import LeadForm from "../components/LeadForm";

export default function CourseDetail() {
  const { slug } = useParams();
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.get(`/courses/${slug}`).then(r => r.data),
  });
  const [openFaq, setOpenFaq] = useState(0);

  if (isLoading) return <div className="container-x py-20 text-center text-gray-500">Loading…</div>;
  if (error || !course) return (
    <div className="container-x py-20 text-center">
      <p className="text-gray-500 mb-4">Course not found.</p>
      <Link to="/courses" className="btn-burgundy">Browse All Courses</Link>
    </div>
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.overview,
    provider: {
      "@type": "EducationalOrganization",
      name: "Shri Ram Institute of Hotel Management",
      sameAs: "https://ram.institute"
    },
    timeRequired: course.duration,
    educationalCredentialAwarded: course.level,
    ...(course.faqs?.length && {
      hasPart: course.faqs.map(f => ({
        "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a }
      }))
    })
  };

  return (
    <>
      <SEO
        title={`${course.title} in Dehradun | RIHM ${course.short_title} Course`}
        description={`${course.title} at Shri Ram Institute Dehradun. ${course.duration}. ${course.eligibility}. 97% placement at Taj, Oberoi, ITC. Apply for 2026 batch.`}
        canonical={`https://ram.institute/courses/${slug}`}
        image={course.hero_image}
        schema={schema}
        breadcrumbs={[
          { name: "Home", url: "https://ram.institute/" },
          { name: "Courses", url: "https://ram.institute/courses" },
          { name: course.short_title, url: `https://ram.institute/courses/${slug}` },
        ]}
      />
      {/* HERO */}
      <section className="relative bg-burgundy-700 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          {course.hero_image && (
            <img src={course.hero_image} alt={course.title} className="w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-burgundy-800 via-burgundy-700/95 to-burgundy-600/70" />
        </div>
        <div className="container-x relative z-10 grid lg:grid-cols-3 gap-10 items-center">
          <div className="lg:col-span-2">
            <Link to="/courses" className="inline-flex items-center gap-1 text-gold-300 text-xs uppercase tracking-widest hover:text-gold-400 mb-3">
              <ChevronLeft className="w-3.5 h-3.5" /> All Courses
            </Link>
            <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-2">{course.level} Program</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">{course.title}</h1>
            <p className="text-white/85 text-lg max-w-2xl">{course.overview.slice(0, 220)}…</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-white/10 border border-white/20 rounded-sm px-4 py-2 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-gold-400" /> {course.duration}</div>
              <div className="bg-white/10 border border-white/20 rounded-sm px-4 py-2 text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gold-400" /> {course.eligibility.split(';')[0]}</div>
              <div className="bg-gold-500 text-burgundy-900 rounded-sm px-4 py-2 text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Scholarships Available</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-sm p-5">
            <div className="bg-gold-500 text-burgundy-900 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm inline-flex items-center gap-1 mb-3"><Sparkles className="w-3 h-3" /> 47 Seats Left</div>
            <h3 className="font-display text-2xl font-semibold mb-1">Apply for 2026 Batch</h3>
            <p className="text-white/70 text-sm mb-4">Free counselling • Scholarship eligibility check • 30-minute callback</p>
            <LeadForm
              variant="dark"
              source={`course_${slug}`}
              defaultCourse={course.short_title}
              testIdPrefix={`course-${slug}-lead`}
              title="Quick Enquiry"
              subtitle=""
            />
          </div>
        </div>
      </section>

      {/* OVERVIEW + CURRICULUM */}
      <section className="py-16 bg-white">
        <div className="container-x grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <div>
              <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">Program Overview</p>
              <h2 className="font-display text-3xl font-bold text-burgundy-700 mb-4">About {course.short_title}</h2>
              <p className="text-gray-700 leading-relaxed">{course.overview}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6 p-5 bg-cream rounded-sm border border-burgundy-100">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Duration</p>
                  <p className="font-display text-xl font-semibold text-burgundy-700">{course.duration}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Eligibility</p>
                  <p className="font-display text-base font-semibold text-burgundy-700">{course.eligibility}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Starting Salary</p>
                  <p className="font-display text-xl font-semibold text-burgundy-700">{course.salary}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Level</p>
                  <p className="font-display text-xl font-semibold text-burgundy-700 capitalize">{course.level}</p>
                </div>
              </div>
            </div>

            {/* Curriculum */}
            {course.curriculum?.length > 0 && (
              <div>
                <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Curriculum</p>
                <h2 className="font-display text-3xl font-bold text-burgundy-700 mb-5">What you'll learn</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {course.curriculum.map((m, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-cream rounded-sm border border-burgundy-100">
                      <Check className="w-4 h-4 text-burgundy-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Careers */}
            {course.careers?.length > 0 && (
              <div>
                <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Career Outcomes</p>
                <h2 className="font-display text-3xl font-bold text-burgundy-700 mb-5">Where our graduates work</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.careers.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-burgundy-50 border border-burgundy-100 rounded-sm">
                      <TrendingUp className="w-4 h-4 text-burgundy-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-burgundy-700 font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {course.faqs?.length > 0 && (
              <div>
                <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">Ask About This Course</p>
                <h2 className="font-display text-3xl font-bold text-burgundy-700 mb-5">FAQs answered by industry experts</h2>
                <div className="space-y-3">
                  {course.faqs.map((f, i) => {
                    const open = openFaq === i;
                    return (
                      <div key={i} className="bg-cream border border-burgundy-100 rounded-sm overflow-hidden">
                        <button onClick={() => setOpenFaq(open ? -1 : i)} className="w-full px-5 py-4 flex items-center justify-between text-left">
                          <span className="font-display text-lg font-semibold text-burgundy-700 pr-4">{f.q}</span>
                          <ChevronRight className={`w-5 h-5 text-burgundy-500 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
                        </button>
                        {open && <div className="px-5 pb-5 text-gray-700 text-sm leading-relaxed">{f.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-burgundy-700 text-white rounded-sm p-6">
              <h3 className="font-display text-2xl font-semibold mb-2">Ready to apply?</h3>
              <p className="text-white/70 text-sm mb-5">Speak to our counsellor for personalized course guidance, scholarship eligibility and admission deadlines.</p>
              <Link to={`/apply?course=${course.short_title}`} className="btn-gold w-full mb-3">Apply for {course.short_title}</Link>
              <Link to="/scholarships" className="block w-full text-center border border-white/30 text-white py-2.5 rounded-sm hover:bg-white hover:text-burgundy-700 transition-all text-sm font-medium">Check Scholarships</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
