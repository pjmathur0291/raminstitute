import SEO from "../lib/SEO";
import { Award, Eye, Heart, Building, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "../data/site";

const ABOUT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Shri Ram Institute of Hotel Management Dehradun",
  url: "https://ram.institute/about",
  mainEntity: {
    "@type": "EducationalOrganization",
    name: "Shri Ram Institute of Hotel Management",
    foundingDate: "1999",
    description: "26+ years of pioneering hospitality education in Uttarakhand and North India."
  }
};

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About RIHM Dehradun | Shri Ram Institute of Hotel Management | Est. 1999"
        description="Founded in 1999, Shri Ram Institute of Hotel Management (RIHM) Dehradun is North India's most trusted hospitality college. 26+ years of legacy, 7000+ placed alumni, 100+ hotel partners."
        canonical="https://ram.institute/about"
        schema={ABOUT_SCHEMA}
      />

      <section className="relative bg-burgundy-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.pexels.com/photos/19554793/pexels-photo-19554793.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container-x relative z-10 max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">EST. 1999 — DEHRADUN</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
            A <em className="text-gold-400 not-italic">legacy of excellence</em><br /> in Indian hospitality education
          </h1>
          <p className="text-white/85 text-lg max-w-2xl">
            For over two and a half decades, Shri Ram Institute has shaped India's finest hospitality leaders — graduates who now serve guests at iconic 5-star palaces from Jaipur to New Delhi to Cruise Lines worldwide.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container-x max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3">Our Story</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy-700 mb-5">
              Built on hospitality. Grown by results.
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Founded in 1999, Shri Ram Institute of Hotel Management began with a singular vision — to bring world-class hospitality training to the foothills of the Himalayas and create a hospitality talent pipeline for India's booming luxury hotel industry.
              </p>
              <p>
                What started with a modest classroom in Dehradun has today grown into a flagship institution spanning Niranjanpur's purpose-built campus with industrial-grade training kitchens, mock bar labs, suite-style mock rooms and a 300-seat hospitality auditorium.
              </p>
              <p>
                More than 7,000 RIHM graduates now serve guests at Taj Rambagh Palace, Oberoi Sukhvilās, ITC Maurya, Hyatt Regency, Marriott Bonvoy, Accor Pullman, IHG Holiday Inn — and on cruise liners with Royal Caribbean, MSC and Carnival.
              </p>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.pexels.com/photos/4253315/pexels-photo-4253315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="RIHM training" className="rounded-sm shadow-elegant w-full" loading="lazy" />
            <div className="absolute -bottom-6 -left-6 bg-gold-500 text-burgundy-900 px-6 py-4 rounded-sm shadow-gold hidden md:block">
              <p className="font-display text-3xl font-bold">26+</p>
              <p className="text-xs uppercase tracking-widest font-semibold">Years of legacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Mission */}
      <section className="py-20 bg-cream">
        <div className="container-x grid md:grid-cols-3 gap-6">
          {[
            { Icon: Eye, t: "Vision", d: "To be India's most respected institution of hospitality education, recognised globally for producing leaders who define luxury service standards." },
            { Icon: Heart, t: "Mission", d: "To deliver immersive, industry-led hospitality education that combines academic rigour, practical mastery and value-driven character — creating professionals ready for any hotel, anywhere in the world." },
            { Icon: Award, t: "Values", d: "Excellence in craft. Integrity in service. Inclusivity in opportunity. Innovation in pedagogy. Respect for the guest, the team, and the tradition of hospitality." }
          ].map((v, i) => (
            <div key={i} className="bg-white border border-burgundy-100 rounded-sm p-8 hover:border-gold-400 transition-all">
              <div className="w-12 h-12 bg-burgundy-500 text-white rounded-sm flex items-center justify-center mb-4">
                <v.Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-burgundy-700 mb-2">{v.t}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="py-20 bg-burgundy-700 text-white">
        <div className="container-x">
          <div className="text-center mb-12">
            <p className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-2">Track Record</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">By the numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: TrendingUp, v: "26+", l: "Years Established" },
              { Icon: Users, v: "7000+", l: "Alumni Placed" },
              { Icon: Building, v: "100+", l: "Hotel Partners" },
              { Icon: Award, v: "97%", l: "Placement Rate" }
            ].map((s, i) => (
              <div key={i} className="text-center border border-white/10 rounded-sm py-8">
                <s.Icon className="w-7 h-7 mx-auto text-gold-400 mb-3" />
                <p className="font-display text-4xl md:text-5xl font-bold mb-1">{s.v}</p>
                <p className="text-white/70 text-sm uppercase tracking-widest">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-x text-center max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy-700 mb-4">Visit our Dehradun campus</h2>
          <p className="text-gray-600 mb-6">Walk through our training kitchens, mock bar lab, training restaurant and front-office suite. See the difference live.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-burgundy">Book a Campus Visit</Link>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="btn-outline-burgundy">Get Directions</a>
          </div>
        </div>
      </section>
    </>
  );
}
