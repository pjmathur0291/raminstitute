import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone, GraduationCap } from "lucide-react";
import { SITE } from "../data/site";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/placements", label: "Placements" },
  { to: "/scholarships", label: "Scholarships" },
  { to: "/campus-life", label: "Campus Life" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-navbar"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-burgundy-100" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 lg:h-20">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-burgundy-500 text-white flex flex-col items-center justify-center rounded-sm border-2 border-gold-500 group-hover:scale-105 transition-transform">
            <span className="font-display text-base lg:text-lg leading-none font-bold">श्री</span>
            <span className="font-display text-[8px] leading-none tracking-widest mt-0.5">RAM</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-burgundy-600 font-bold text-base lg:text-lg tracking-tight">Shri Ram Institute</p>
            <p className="text-[10px] lg:text-xs text-burgundy-400 tracking-[0.2em] uppercase">Dehradun • Est. 1999</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors relative ${
                  isActive ? "text-burgundy-500" : "text-gray-700 hover:text-burgundy-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-gold-500" aria-hidden="true" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${SITE.phone}`}
            data-testid="nav-call"
            className="text-burgundy-600 font-semibold text-sm flex items-center gap-1 hover:text-burgundy-700"
          >
            <Phone className="w-4 h-4" /> {SITE.phoneDisplay}
          </a>
          <Link
            to="/apply"
            data-testid="nav-apply-now"
            className="btn-burgundy text-sm py-2.5 px-5"
          >
            <GraduationCap className="w-4 h-4" /> Apply Now
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-burgundy-600"
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-burgundy-100 bg-white" data-testid="nav-mobile-menu">
          <nav className="container-x py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-medium rounded-sm ${
                    isActive ? "bg-burgundy-50 text-burgundy-500" : "text-gray-700 hover:bg-cream"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="flex gap-2 mt-3">
              <a href={`tel:${SITE.phone}`} className="btn-outline-burgundy flex-1 text-sm py-2.5"><Phone className="w-4 h-4" /> Call</a>
              <Link to="/apply" onClick={() => setOpen(false)} className="btn-burgundy flex-1 text-sm py-2.5">Apply Now</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
