import SEO from "../lib/SEO";
import { CAMPUS_FACILITIES } from "../data/site";
import * as Icons from "lucide-react";

const ICON_MAP = {
  "utensils": Icons.Utensils,
  "cake": Icons.Cake,
  "wine": Icons.Wine,
  "utensils-crossed": Icons.UtensilsCrossed,
  "bed": Icons.Bed,
  "concierge-bell": Icons.Bell,
  "monitor": Icons.Monitor,
  "book-open": Icons.BookOpen,
  "library": Icons.Library,
  "mic": Icons.Mic,
};

const TOUR_IMAGES = [
  { src: "https://images.pexels.com/photos/12181750/pexels-photo-12181750.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", label: "Training Kitchen" },
  { src: "https://images.pexels.com/photos/4253315/pexels-photo-4253315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", label: "Plated Dining" },
  { src: "https://images.pexels.com/photos/7821349/pexels-photo-7821349.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", label: "Mock Reception" },
  { src: "https://images.pexels.com/photos/19554793/pexels-photo-19554793.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", label: "Campus Building" },
];

export default function CampusLifePage() {
  return (
    <>
      <SEO
        title="Campus Life at RIHM Dehradun | World-Class Hospitality Training Labs"
        description="Tour RIHM's Dehradun campus — training kitchens, bakery labs, mock bars, training restaurant, front office lab, mock hotel rooms, library and 300-seat auditorium."
        canonical="https://ram.institute/campus-life"
      />
      <section className="bg-burgundy-700 text-white py-24">
        <div className="container-x max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">Campus Tour</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
            Train where the <em className="text-gold-400 not-italic">5-star magic</em> happens
          </h1>
          <p className="text-white/85 text-lg max-w-2xl">
            Our Niranjanpur campus replicates the operational environment of luxury 5-star hotels — so when you walk into your first job, nothing feels new.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOUR_IMAGES.map((t, i) => (
            <div key={i} className="relative overflow-hidden rounded-sm aspect-[4/5] group">
              <img src={t.src} alt={t.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-white font-display text-lg font-semibold">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container-x">
          <div className="text-center mb-12">
            <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">Facilities</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-burgundy-700">Built like a luxury hotel. Run like one too.</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAMPUS_FACILITIES.map((f, i) => {
              const Icon = ICON_MAP[f.icon] || Icons.Sparkles;
              return (
                <div key={i} className="bg-white border border-burgundy-100 rounded-sm p-6 hover:border-gold-400 hover:shadow-burgundy hover:-translate-y-1 transition-all duration-500" data-testid={`facility-${i}`}>
                  <div className="w-11 h-11 bg-burgundy-500 text-white rounded-sm flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-burgundy-700 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
