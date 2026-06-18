import { useEffect } from "react";

/**
 * SEO Head component — manages document title, meta tags, canonical, OG, JSON-LD schemas.
 * Supports breadcrumbs prop that auto-generates BreadcrumbList schema.
 */
export default function SEO({
  title = "Best Hotel Management College in Dehradun | Shri Ram Institute (RIHM) | 97% Placement",
  description = "Top hotel management college in Dehradun, Uttarakhand. RIHM offers BHM, MHM, DHM, Culinary Arts, Bakery & Bartending with 97% placement at Taj, Oberoi, ITC. Serving students from Dehradun, Rishikesh, Haridwar, Roorkee, Haldwani, Chandigarh & Himachal Pradesh. Since 1999.",
  canonical,
  image = "https://ram.institute/images/hero/hero_desktop.webp",
  schema,
  breadcrumbs,
  keywords = "hotel management college Dehradun, hotel management college Uttarakhand, BHM Dehradun, hospitality management college India, top hotel management college north India, RIHM Dehradun, Shri Ram Institute, culinary arts Dehradun, bartending course Dehradun, hotel management admission 2026, hotel management Rishikesh, hotel management Haridwar, hotel management Roorkee"
}) {
  useEffect(() => {
    document.title = title;

    const upsertMeta = (name, content, attr = "name") => {
      let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    upsertMeta("description", description);
    upsertMeta("keywords", keywords);
    upsertMeta("robots", "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1");
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:type", "website", "property");
    upsertMeta("og:image", image, "property");
    upsertMeta("og:site_name", "Shri Ram Institute of Hotel Management", "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);
    upsertMeta("twitter:image", image);

    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Combine page schema + breadcrumb schema into a single JSON-LD block
    let existing = document.getElementById("page-jsonld");
    if (existing) existing.remove();

    const schemas = [];
    if (schema) schemas.push(schema);
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      });
    }

    if (schemas.length > 0) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "page-jsonld";
      s.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : { "@context": "https://schema.org", "@graph": schemas });
      document.head.appendChild(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, image, JSON.stringify(schema || {}), JSON.stringify(breadcrumbs || []), keywords]);

  return null;
}
