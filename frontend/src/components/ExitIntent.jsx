import { useEffect, useState } from "react";
import { X, Sparkles, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE, WHATSAPP_URL } from "../data/site";

/**
 * Exit-intent popup — fires when the user moves cursor towards top of viewport (desktop)
 * OR when mobile user has been on the page for 30 seconds + tries to navigate away.
 * Once dismissed, sets a session flag to not re-fire on the same session.
 */
export default function ExitIntent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("rihm_exit_seen") === "1") return;

    let fired = false;
    const trigger = () => {
      if (fired) return;
      fired = true;
      setOpen(true);
      sessionStorage.setItem("rihm_exit_seen", "1");
    };

    // Desktop: mouseleave at top edge
    const onMouseOut = (e) => {
      if (e.clientY <= 6 && !e.relatedTarget && !fired) trigger();
    };
    document.addEventListener("mouseout", onMouseOut);

    // Mobile: trigger after 30s on page
    const mobileTimer = setTimeout(() => {
      if (window.innerWidth < 768) trigger();
    }, 30000);

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      clearTimeout(mobileTimer);
    };
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up" data-testid="exit-intent-modal" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-sm max-w-md w-full overflow-hidden shadow-2xl border-2 border-gold-500" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-500 text-white p-6 relative">
          <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-white/70 hover:text-white" data-testid="exit-close" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 bg-gold-500 text-burgundy-900 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3 h-3" /> Wait! Don&apos;t leave yet
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
            Get <em className="text-gold-300 not-italic">FREE Career Counselling</em> + ₹50,000 Scholarship Eligibility Check
          </h3>
        </div>
        <div className="p-6">
          <ul className="space-y-2 text-sm text-gray-700 mb-5">
            <li className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> 30-min FREE call with senior counsellor</li>
            <li className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> Scholarship eligibility check (up to ₹75K)</li>
            <li className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> Course recommendation based on your goals</li>
            <li className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> Direct admission guidance — only 47 seats left for 2026</li>
          </ul>
          <div className="flex flex-col gap-2.5">
            <a href={`tel:${SITE.phone}`} className="btn-burgundy w-full" data-testid="exit-call">
              <Phone className="w-4 h-4" /> Call {SITE.phoneDisplay}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1FB855] text-white font-medium px-6 py-3 rounded-sm transition-all flex items-center justify-center gap-2" data-testid="exit-whatsapp">
              💬 WhatsApp — Reply in 2 mins
            </a>
            <Link to="/apply" onClick={() => setOpen(false)} className="btn-outline-burgundy w-full" data-testid="exit-apply">
              Apply Online for 2026
            </Link>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-4">No spam. Used only for admissions counselling.</p>
        </div>
      </div>
    </div>
  );
}
