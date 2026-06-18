import { Link } from "react-router-dom";
import { useState } from "react";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { SITE, WHATSAPP_URL } from "../data/site";
import api from "../lib/api";
import { trackLead } from "../lib/analytics";

export default function Footer() {
  const [fStatus, setFStatus] = useState("idle");
  const [fError, setFError] = useState("");

  const onFooterSubmit = async (e) => {
    e.preventDefault();
    setFStatus("submitting");
    setFError("");
    const fd = new FormData(e.currentTarget);
    try {
      await api.post("/leads", {
        name: fd.get("name"),
        phone: fd.get("phone"),
        source: "footer_callback",
      });
      trackLead("footer_callback");
      setFStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setFStatus("idle");
      setFError(err?.response?.data?.detail || "Try again or call us directly.");
    }
  };
  return (
    <footer data-testid="site-footer" className="bg-burgundy-700 text-white">
      <div className="container-x py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-12 h-12 bg-white text-burgundy-600 flex flex-col items-center justify-center rounded-sm border-2 border-gold-500">
              <span className="font-display text-lg leading-none font-bold">श्री</span>
              <span className="font-display text-[8px] leading-none tracking-widest mt-0.5">RAM</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold">Shri Ram Institute</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold-300">Dehradun • Est. 1999</p>
            </div>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            India's leading hotel management institute, crafting world-class hospitality leaders for over two decades. 97% placement at Taj, Oberoi, ITC and global hospitality chains.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="w-9 h-9 rounded-sm bg-white/10 hover:bg-gold-500 hover:text-burgundy-700 flex items-center justify-center transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-sm bg-white/10 hover:bg-gold-500 hover:text-burgundy-700 flex items-center justify-center transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-sm bg-white/10 hover:bg-gold-500 hover:text-burgundy-700 flex items-center justify-center transition-colors" aria-label="YouTube"><Youtube className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-sm bg-white/10 hover:bg-gold-500 hover:text-burgundy-700 flex items-center justify-center transition-colors" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-xl font-semibold mb-4 text-gold-300">Courses</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/courses/bhm" className="hover:text-gold-300">Bachelor of Hotel Management (BHM)</Link></li>
            <li><Link to="/courses/mhm" className="hover:text-gold-300">Master of Hotel Management (MHM)</Link></li>
            <li><Link to="/courses/dhm" className="hover:text-gold-300">Diploma in Hotel Management (DHM)</Link></li>
            <li><Link to="/courses/culinary-arts" className="hover:text-gold-300">Culinary Arts</Link></li>
            <li><Link to="/courses/bakery-confectionery" className="hover:text-gold-300">Bakery & Confectionery</Link></li>
            <li><Link to="/courses/bartending" className="hover:text-gold-300">Bartending & Mixology</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xl font-semibold mb-4 text-gold-300">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/about" className="hover:text-gold-300">About RIHM</Link></li>
            <li><Link to="/placements" className="hover:text-gold-300">Placements</Link></li>
            <li><Link to="/scholarships" className="hover:text-gold-300">Scholarships</Link></li>
            <li><Link to="/campus-life" className="hover:text-gold-300">Campus Life</Link></li>
            <li><Link to="/gallery" className="hover:text-gold-300">Gallery</Link></li>
            <li><Link to="/blog" className="hover:text-gold-300">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-gold-300">Apply Now</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xl font-semibold mb-4 text-gold-300">Get in Touch</h4>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex gap-2.5"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-400" /> <span>{SITE.address}</span></li>
            <li className="flex gap-2.5"><Phone className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-400" /> <a href={`tel:${SITE.phone}`} className="hover:text-gold-300">{SITE.phoneDisplay}</a></li>
            <li className="flex gap-2.5"><Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-400" /> <a href={`mailto:${SITE.email}`} className="hover:text-gold-300 break-all">{SITE.email}</a></li>
          </ul>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1FB855] text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-all"
            data-testid="footer-whatsapp"
          >
            Chat on WhatsApp
          </a>
          <form onSubmit={onFooterSubmit} className="mt-5 space-y-2" data-testid="footer-lead-form">
            <p className="text-xs uppercase tracking-widest text-gold-300 font-semibold">Quick Callback</p>
            <input name="name" required minLength={2} placeholder="Your Name *" className="w-full h-9 px-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" data-testid="footer-name" />
            <input name="phone" required pattern="[6-9][0-9]{9}" type="tel" placeholder="Mobile Number *" className="w-full h-9 px-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" data-testid="footer-phone" />
            <button type="submit" disabled={fStatus === "submitting"} className="w-full h-9 bg-gold-500 hover:bg-gold-600 text-burgundy-900 font-semibold rounded-sm text-sm transition-all disabled:opacity-60" data-testid="footer-submit">
              {fStatus === "submitting" ? "Sending…" : fStatus === "success" ? "✓ Will call you soon" : "Request Callback"}
            </button>
            {fError && <p className="text-[10px] text-red-300">{fError}</p>}
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Shri Ram Institute of Hotel Management, Dehradun. All rights reserved.</p>
          <p className="flex gap-4">
            <Link to="/privacy" className="hover:text-gold-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold-300">Terms</Link>
            <Link to="/admin/login" className="hover:text-gold-300">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
