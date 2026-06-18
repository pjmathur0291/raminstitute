import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronRight, GraduationCap, Clock } from "lucide-react";
import SEO from "../lib/SEO";
import api from "../lib/api";

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get("/courses").then(r => r.data),
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Courses at Shri Ram Institute of Hotel Management",
    itemListElement: courses.map((c, i) => ({
      "@type": "Course",
      position: i + 1,
      name: c.title,
      description: c.overview,
      provider: { "@type": "EducationalOrganization", name: "Shri Ram Institute of Hotel Management" }
    }))
  };

  return (
    <>
      <SEO
        title="Hotel Management Courses in Dehradun | BHM, MHM, DHM, Culinary | RIHM"
        description="Explore RIHM's hospitality programs — BHM (3 yr), MHM (2 yr), DHM (1 yr), Diploma in Culinary Arts, Bakery & Bartending. 70% practical training. 97% placement at Taj, Oberoi, ITC."
        canonical="https://ram.institute/courses"
        schema={schema}
      />
      <section className="bg-burgundy-700 text-white py-20">
        <div className="container-x max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">Programs at RIHM</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Hospitality programs <em className="text-gold-400 not-italic">designed for leadership</em>
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-2xl">
            From entry-level diplomas to advanced postgraduate degrees — every program is engineered for direct placement at India's top luxury hotel chains.
          </p>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container-x">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading courses…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courses.map((c) => (
                <Link
                  key={c.slug}
                  to={`/courses/${c.slug}`}
                  className="bg-white border border-burgundy-100 rounded-sm overflow-hidden group hover:shadow-elegant hover:-translate-y-1 transition-all duration-500 block"
                  data-testid={`courses-list-${c.slug}`}
                >
                  <div className="aspect-[2/1] overflow-hidden bg-cream-dark relative">
                    {c.hero_image && (
                      <img src={c.hero_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    )}
                    <div className="absolute top-4 left-4 bg-gold-500 text-burgundy-900 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest">
                      {c.level}
                    </div>
                  </div>
                  <div className="p-7">
                    <h2 className="font-display text-3xl font-semibold text-burgundy-700 mb-3 group-hover:text-burgundy-500 transition-colors">
                      {c.title}
                    </h2>
                    <p className="text-gray-600 mb-5 line-clamp-3 text-sm leading-relaxed">{c.overview}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-burgundy-600"><Clock className="w-3.5 h-3.5" /> {c.duration}</div>
                      <div className="flex items-center gap-1.5 text-burgundy-600 capitalize"><GraduationCap className="w-3.5 h-3.5" /> {c.level} Program</div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-burgundy-100 pt-4">
                      <span className="text-burgundy-500 font-semibold text-sm">View Course Details</span>
                      <ChevronRight className="w-5 h-5 text-burgundy-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
