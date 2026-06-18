// Lightweight analytics helpers - safe-noop if env vars are unset.
const GA4 = process.env.REACT_APP_GA4_ID;
const GTM = process.env.REACT_APP_GTM_ID;
const META = process.env.REACT_APP_META_PIXEL_ID;

let inited = false;

export function initAnalytics() {
  if (inited) return;
  inited = true;
  if (typeof document === "undefined") return;

  if (GTM) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  }
  if (GA4) {
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4}`;
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA4);
  }
  if (META) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq("init", META);
    window.fbq("track", "PageView");
    /* eslint-enable */
  }
}

export function trackEvent(name, params = {}) {
  try {
    if (window.gtag) window.gtag("event", name, params);
    if (window.fbq) window.fbq("trackCustom", name, params);
    if (window.dataLayer) window.dataLayer.push({ event: name, ...params });
  } catch {}
}

export function trackLead(source) { trackEvent("lead_submit", { source }); }
export function trackCall() { trackEvent("phone_click"); }
export function trackWhatsApp() { trackEvent("whatsapp_click"); }
