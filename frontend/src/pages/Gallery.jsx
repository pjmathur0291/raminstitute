import { useState } from "react";
import SEO from "../lib/SEO";
import { GALLERY } from "../data/site";

const CATEGORIES = ["All", "Campus", "Placements", "Culinary", "Events"];

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const items = filter === "All" ? GALLERY : GALLERY.filter(g => g.cat === filter);

  return (
    <>
      <SEO
        title="Gallery | Shri Ram Institute of Hotel Management Dehradun"
        description="Photo gallery of RIHM Dehradun — campus, training kitchens, placement events, alumni at Taj/Oberoi/ITC, culinary fests and student life."
        canonical="https://ram.institute/gallery"
      />
      <section className="bg-burgundy-700 text-white py-20">
        <div className="container-x max-w-4xl">
          <p className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">Gallery</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Moments from the <em className="text-gold-400 not-italic">RIHM world</em>
          </h1>
        </div>
      </section>

      <section className="py-12 bg-cream">
        <div className="container-x">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                data-testid={`gallery-filter-${c.toLowerCase()}`}
                className={`px-5 py-2 rounded-sm text-sm font-medium transition-all border ${
                  filter === c
                    ? "bg-burgundy-500 text-white border-burgundy-500"
                    : "bg-white text-burgundy-700 border-burgundy-200 hover:border-burgundy-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((g, i) => (
              <figure key={i} className="relative overflow-hidden rounded-sm group aspect-square" data-testid={`gallery-item-${i}`}>
                <img src={g.src} alt={g.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-burgundy-900/85 to-transparent">
                  <p className="text-white text-xs font-medium">{g.caption}</p>
                </figcaption>
                <span className="absolute top-2 left-2 bg-gold-500 text-burgundy-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm tracking-widest">{g.cat}</span>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
