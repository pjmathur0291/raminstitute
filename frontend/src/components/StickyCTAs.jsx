import { Phone, MessageCircle, GraduationCap, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE, WHATSAPP_URL, WHATSAPP_URL_CALLBACK } from "../data/site";
import { trackCall, trackWhatsApp } from "../lib/analytics";

export default function StickyCTAs() {
  return (
    <>
      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" data-testid="sticky-cta-mobile">
        <div className="bg-gold-500 text-burgundy-800 text-xs font-bold py-2 px-3 flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>Only 47 Seats Left for 2026 — APPLY NOW</span>
          <Zap className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex bg-white border-t border-burgundy-100 shadow-lg">
          <a
            href={WHATSAPP_URL_CALLBACK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackWhatsApp}
            className="flex-1 bg-[#25D366] text-white py-3 flex flex-col items-center"
            data-testid="cta-whatsapp"
          >
            <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /><span className="font-bold text-xs">WhatsApp</span></div>
            <span className="text-[10px] opacity-90">Reply in 2 mins</span>
          </a>
          <a
            href={`tel:${SITE.phone}`}
            onClick={trackCall}
            className="flex-1 bg-[#0d6efd] text-white py-3 flex flex-col items-center"
            data-testid="cta-call"
          >
            <div className="flex items-center gap-1"><Phone className="w-4 h-4 animate-pulse" /><span className="font-bold text-xs">Call Now</span></div>
            <span className="text-[10px] opacity-90">Talk to Counselor</span>
          </a>
          <Link
            to="/apply"
            className="flex-[1.3] bg-burgundy-500 text-white py-3 flex flex-col items-center"
            data-testid="cta-apply"
          >
            <div className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /><span className="font-black text-xs tracking-wide">APPLY 2026</span></div>
            <span className="text-[10px] bg-gold-500 text-burgundy-800 px-1.5 rounded-full mt-0.5">Scholarships</span>
          </Link>
        </div>
      </div>

      {/* Desktop floating */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackWhatsApp}
        className="hidden lg:flex fixed bottom-8 right-8 z-50 items-center gap-3 bg-[#25D366] text-white pl-5 pr-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
        data-testid="floating-whatsapp"
      >
        <div className="flex flex-col">
          <span className="font-bold text-sm">Chat with us</span>
          <span className="text-[10px] opacity-90">Reply in 2 mins</span>
        </div>
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -inset-1 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </a>

      <Link
        to="/apply"
        className="hidden lg:flex fixed bottom-8 left-8 z-50 items-center gap-3 bg-burgundy-500 hover:bg-burgundy-600 text-white px-5 py-3 rounded-full shadow-burgundy hover:scale-105 transition-all"
        data-testid="floating-apply"
      >
        <GraduationCap className="w-6 h-6" />
        <div className="flex flex-col">
          <span className="font-bold text-sm">Apply for 2026</span>
          <span className="text-[10px] opacity-90">97% Placement</span>
        </div>
        <span className="bg-gold-500 text-burgundy-800 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
          <Zap className="w-3 h-3" /> 47 Seats
        </span>
      </Link>
    </>
  );
}
