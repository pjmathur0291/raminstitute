import SEO from "../lib/SEO";
import { Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SCHOLARSHIPS } from "../data/site";
import LeadForm from "../components/LeadForm";

export default function ScholarshipsPage() {
  return (
    <>
      <SEO
        title="Scholarships at RIHM Dehradun | ₹3 Crore Awarded Yearly | Apply 2026"
        description="₹3 crore in hospitality scholarships at RIHM Dehradun — Merit (₹50K), Girl Child (₹40K), Need-Based (₹60K), Hospitality Excellence (₹75K), Defence Wards (20% waiver), Sibling Discount."
        canonical="https://ram.institute/scholarships"
      />
      <section className="bg-burgundy-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(43,74%,50%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container-x relative z-10 max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3"><Award className="inline w-4 h-4 mr-1" /> Scholarships</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
            ₹3 Crore in <em className="text-gold-400 not-italic">scholarships</em> awarded every year
          </h1>
          <p className="text-white/85 text-lg max-w-2xl">
            We believe talent should not be limited by background. Our six scholarship schemes have helped thousands of deserving students pursue their hospitality dreams at India's top hotel chains.
          </p>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container-x">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCHOLARSHIPS.map((s, i) => (
              <div key={i} className={`bg-white border-2 rounded-sm p-7 hover:-translate-y-1 transition-all duration-500 ${s.color === 'gold' ? 'border-gold-500 hover:shadow-gold' : 'border-burgundy-200 hover:shadow-burgundy'}`} data-testid={`scholarship-${i}`}>
                <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-4 ${s.color === 'gold' ? 'bg-gold-500 text-burgundy-900' : 'bg-burgundy-500 text-white'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-burgundy-700 mb-2">{s.name}</h3>
                <p className={`font-display text-3xl font-bold mb-3 ${s.color === 'gold' ? 'text-gold-600' : 'text-burgundy-500'}`}>{s.amount}</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Eligibility</p>
                <p className="text-sm font-semibold text-burgundy-700 mb-3">{s.eligibility}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-x grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">How to Apply</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy-700 mb-5">A simple 4-step process</h2>
            <ol className="space-y-4">
              {[
                { t: "Submit Application", d: "Fill the form on this page or call our counsellor. Mention scholarship interest." },
                { t: "Document Verification", d: "Submit class 10/12 marksheets, ID proof, income certificate (if applicable)." },
                { t: "Scholarship Review", d: "Our committee evaluates merit, need and eligibility within 7 working days." },
                { t: "Award & Enroll", d: "Receive scholarship letter. Pay reduced fee and join the 2026 batch." },
              ].map((step, i) => (
                <li key={i} className="flex gap-4 p-5 bg-cream rounded-sm border border-burgundy-100">
                  <div className="w-10 h-10 bg-burgundy-500 text-white rounded-sm flex items-center justify-center font-display text-lg font-bold flex-shrink-0">{i + 1}</div>
                  <div>
                    <p className="font-display text-lg font-semibold text-burgundy-700">{step.t}</p>
                    <p className="text-sm text-gray-600 mt-1">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/contact" className="btn-burgundy mt-7 inline-flex">Start Scholarship Application</Link>
          </div>
          <div>
            <LeadForm
              source="scholarship_application"
              testIdPrefix="scholarship"
              title="Apply for a Scholarship"
              subtitle="Tell us about yourself; our scholarship team will guide you on eligibility"
            />
          </div>
        </div>
      </section>
    </>
  );
}
