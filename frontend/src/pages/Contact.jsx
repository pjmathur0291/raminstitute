import SEO from "../lib/SEO";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import LeadForm from "../components/LeadForm";
import { SITE, WHATSAPP_URL } from "../data/site";

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
    "@type": "EducationalOrganization",
    name: "Shri Ram Institute of Hotel Management",
    telephone: "+91-70555-47000",
    email: "admissions@ram.institute",
    address: {
      "@type": "PostalAddress",
      streetAddress: "430, Niranjanpur",
      addressLocality: "Dehradun",
      addressRegion: "Uttarakhand",
      postalCode: "248001",
      addressCountry: "IN"
    }
  }
};

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Apply for Admission 2026 | Contact RIHM Dehradun | +91 70555 47000"
        description="Apply to Shri Ram Institute of Hotel Management Dehradun. Call +91 70555 47000, WhatsApp or fill the admission form. Free counselling within 30 minutes."
        canonical="https://ram.institute/contact"
        schema={CONTACT_SCHEMA}
      />
      <section className="bg-burgundy-700 text-white py-20">
        <div className="container-x max-w-4xl text-center">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
            Apply for <em className="text-gold-400 not-italic">2026 Admission</em>
          </h1>
          <p className="text-white/85 text-lg max-w-2xl mx-auto">
            Speak to our admissions counsellor — get personalised course guidance, fee structure, scholarship eligibility and campus visit booking. All in under 30 minutes.
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="container-x grid lg:grid-cols-3 gap-6 mb-12">
          {[
            { Icon: Phone, title: "Call Us", value: SITE.phoneDisplay, sub: "Mon-Sat, 9 AM – 7 PM", href: `tel:${SITE.phone}`, color: "burgundy" },
            { Icon: MessageCircle, title: "WhatsApp", value: SITE.phoneDisplay, sub: "Reply in 2 minutes", href: WHATSAPP_URL, color: "emerald", external: true },
            { Icon: Mail, title: "Email Us", value: SITE.email, sub: "Response in 24 hours", href: `mailto:${SITE.email}`, color: "gold" },
          ].map((c, i) => (
            <a key={i} href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener noreferrer" : undefined} className={`bg-white border-2 border-burgundy-100 rounded-sm p-6 hover:border-burgundy-500 transition-all duration-500 group block`} data-testid={`contact-${c.title.toLowerCase().replace(/\s/g, '-')}`}>
              <div className={`w-12 h-12 ${c.color === 'emerald' ? 'bg-emerald-500' : c.color === 'gold' ? 'bg-gold-500' : 'bg-burgundy-500'} text-white rounded-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <c.Icon className="w-5 h-5" />
              </div>
              <p className="text-gold-600 text-xs uppercase tracking-widest font-bold mb-1">{c.title}</p>
              <p className="font-display text-xl font-semibold text-burgundy-700 break-all">{c.value}</p>
              <p className="text-gray-500 text-xs mt-1"><Clock className="inline w-3 h-3 mr-1" />{c.sub}</p>
            </a>
          ))}
        </div>

        <div className="container-x grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-2">Visit Campus</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy-700 mb-4">RIHM Campus, Dehradun</h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              Walk through our training kitchens, mock bar lab, training restaurant and front-office suite. Schedule a campus tour and see firsthand why our students are placed at the world's finest hotels.
            </p>
            <div className="bg-white border border-burgundy-100 rounded-sm p-5 mb-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-burgundy-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-burgundy-700 mb-1">{SITE.address}</p>
                  <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="text-burgundy-500 text-sm hover:underline">Open in Google Maps →</a>
                </div>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-sm overflow-hidden border border-burgundy-100">
              <iframe
                title="RIHM Campus Map"
                src="https://www.google.com/maps?q=430+Niranjanpur+Dehradun&output=embed"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div>
            <LeadForm
              source="contact_page"
              testIdPrefix="contact"
              title="Send us an enquiry"
              subtitle="Our admissions team will respond within 30 minutes during business hours"
            />
          </div>
        </div>
      </section>
    </>
  );
}
