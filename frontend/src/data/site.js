// Site-wide static data — real assets pulled from ram.institute
export const SITE = {
  brand: "Shri Ram Institute of Hotel Management",
  shortBrand: "RIHM",
  tagline: "Crafting India's Finest Hospitality Leaders Since 1999",
  phone: "+917055547000, +919837099996",
  phoneDisplay: "+917055547000, +919837099996",
  whatsapp: "+917055547000, +919837099996",
  email: "admissions@ram.institute",
  address: "430, Niranjanpur, Dehradun, Uttarakhand 248001",
  mapsUrl: "https://maps.app.goo.gl/CzmWCZRHeKXQc3aU8",
  established: 1999,
  studentsPlaced: "7000+",
  placementRate: "97%",
  topPartners: ["Taj", "Oberoi", "ITC", "Hyatt", "Marriott", "Accor", "IHG"],
};

export const HERO_IMAGE = "https://ram.institute/images/hero/hero_desktop.webp";
export const HERO_IMAGE_MOBILE = "https://ram.institute/images/hero/hero_mobile.webp";

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
  "Hi! I saw your 97% placement rate at Taj, Oberoi & ITC Hotels. I'm interested in admission for 2026 batch. Please share details."
)}`;

export const WHATSAPP_URL_CALLBACK = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
  "Hi! I saw your 97% placement rate at Taj, Oberoi & ITC Hotels. I want to know about admissions for 2026 batch. Please call me back."
)}`;

// Text-style hotel partner badges (matching ram.institute treatment).
// ram.institute uses styled text on white badges rather than logo image files.
export const PARTNERS = [
  { name: "TAJ", suffix: "Hotels", count: "300+", titleColor: "#a8842a", subColor: "#666" },
  { name: "THE OBEROI", suffix: "", count: "150+", titleColor: "#1a365d", subColor: "#666" },
  { name: "ITC", suffix: "Hotels", count: "130+", titleColor: "#7c2d12", subColor: "#666" },
  { name: "Hyatt", suffix: "", count: "100+", titleColor: "#1f2937", subColor: "#666" },
  { name: "Marriott", suffix: "", count: "120+", titleColor: "#991b1b", subColor: "#666" },
  { name: "Accor", suffix: "", count: "80+", titleColor: "#1e3a8a", subColor: "#666" },
  { name: "IHG", suffix: "Hotels", count: "70+", titleColor: "#065f46", subColor: "#666" },
  { name: "Radisson", suffix: "", count: "60+", titleColor: "#4338ca", subColor: "#666" },
];

// Real student placement photos from ram.institute /images/students/...
export const TAJ_STUDENTS = {
  featured: { src: "https://ram.institute/images/students/taj/taj-rambagh-group.webp", alt: "RIHM students at Taj Rambagh Palace" },
  grid: [
    { src: "https://ram.institute/images/students/taj/taj-rambagh-palace-1.webp", alt: "Chef at Taj Rambagh Palace" },
    { src: "https://ram.institute/images/students/taj/taj-club.webp", alt: "RIHM student at Taj Club" },
    { src: "https://ram.institute/images/students/taj/monika-taj.webp", alt: "Monika - Taj Hotels" },
    { src: "https://ram.institute/images/students/taj/taj-rambagh-palace-2.webp", alt: "Student at Taj Rambagh Palace" },
    { src: "https://ram.institute/images/students/taj/taj-selection.webp", alt: "Taj Selection certificate" },
    { src: "https://ram.institute/images/students/taj/taj-udaipur.webp", alt: "RIHM student at Taj Udaipur" },
    { src: "https://ram.institute/images/students/taj/chandra-taj-devi-ratan.webp", alt: "Chandra - Taj Devi Ratan" },
    { src: "https://ram.institute/images/students/taj/amit-giri-taj.webp", alt: "Amit Giri - Taj Rambagh Jaipur" },
  ],
};

export const OBEROI_STUDENTS = {
  featured: { src: "https://ram.institute/images/students/oberoi/kajal-oberoi-sukhvillas.webp", alt: "Kajal - Oberoi Sukhvilās" },
  grid: [
    { src: "https://ram.institute/images/students/oberoi/oberoi-rajvilas.webp", alt: "Oberoi Rajvilas Jaipur" },
    { src: "https://ram.institute/images/students/oberoi/amisha-oberoi-gurugram.webp", alt: "Amisha - The Oberoi Gurugram" },
    { src: "https://ram.institute/images/students/oberoi/jigme-oberoi-sukhvillas.webp", alt: "Jigme - Oberoi Sukhvilās" },
    { src: "https://ram.institute/images/students/oberoi/oberoi-udai-vilas.webp", alt: "RIHM student at Oberoi Udaivilās" },
  ],
};

export const TRAINING_IMAGE = "https://ram.institute/images/training/students-training.webp";

// Real student testimonials with real ram.institute images
export const TESTIMONIALS = [
  {
    name: "Monika Singh",
    role: "Front Office Associate, Taj Rambagh Palace",
    quote: "RIHM didn't just teach me hospitality — it shaped my mindset. From the mock kitchens to industrial training, every moment prepared me for Taj. Today I serve guests at the world's No.1 rated palace hotel.",
    image: "https://ram.institute/images/students/taj/monika-taj.webp",
    batch: "BHM Batch of 2022",
  },
  {
    name: "Amit Giri",
    role: "Commis Chef, Taj Rambagh Jaipur",
    quote: "The culinary lab at RIHM is unmatched. Chef-faculty with 20+ years of 5-star experience trained me on real hotel kitchens. I cracked Taj Rambagh's campus interview in my first attempt.",
    image: "https://ram.institute/images/students/taj/amit-giri-taj.webp",
    batch: "Culinary Arts 2023",
  },
  {
    name: "Kajal",
    role: "F&B Associate, The Oberoi Sukhvilās",
    quote: "Being a girl from a small town, I never imagined I'd serve guests at Oberoi. RIHM's grooming sessions, personality development and direct placement drive made it possible.",
    image: "https://ram.institute/images/students/oberoi/kajal-oberoi-sukhvillas.webp",
    batch: "DHM 2024",
  },
  {
    name: "Chandra Pal",
    role: "Bartender, Taj Devi Ratan Jaipur",
    quote: "The bartending lab at RIHM has every spirit, every glassware, every tool used in real hotels. I won the inter-college mixology championship in my final semester — and Taj hired me on the spot.",
    image: "https://ram.institute/images/students/taj/chandra-taj-devi-ratan.webp",
    batch: "Bartending Diploma 2023",
  },
  {
    name: "Amisha",
    role: "Front Office Executive, The Oberoi Gurugram",
    quote: "RIHM's industrial training opened the doors of luxury hospitality for me. Today I welcome guests at The Oberoi Gurugram, one of India's finest urban resorts.",
    image: "https://ram.institute/images/students/oberoi/amisha-oberoi-gurugram.webp",
    batch: "BHM 2023",
  },
  {
    name: "Jigme",
    role: "Hospitality Associate, Oberoi Sukhvilās",
    quote: "From Dehradun to Oberoi Sukhvilās — RIHM made my hospitality dream possible. The luxury service standards taught here are second to none.",
    image: "https://ram.institute/images/students/oberoi/jigme-oberoi-sukhvillas.webp",
    batch: "BHM 2024",
  },
];

export const GALLERY = [
  { cat: "Placements", src: "https://ram.institute/images/students/taj/taj-rambagh-group.webp", caption: "RIHM batch at Taj Rambagh Palace" },
  { cat: "Placements", src: "https://ram.institute/images/students/taj/taj-rambagh-palace-1.webp", caption: "Chef at Taj Rambagh Palace" },
  { cat: "Placements", src: "https://ram.institute/images/students/taj/monika-taj.webp", caption: "Monika at Taj Hotels" },
  { cat: "Placements", src: "https://ram.institute/images/students/oberoi/kajal-oberoi-sukhvillas.webp", caption: "Kajal at Oberoi Sukhvilās" },
  { cat: "Placements", src: "https://ram.institute/images/students/oberoi/amisha-oberoi-gurugram.webp", caption: "Amisha at Oberoi Gurugram" },
  { cat: "Placements", src: "https://ram.institute/images/students/taj/taj-udaipur.webp", caption: "Taj Udaipur placement" },
  { cat: "Placements", src: "https://ram.institute/images/students/taj/taj-selection.webp", caption: "Taj selection certificate" },
  { cat: "Placements", src: "https://ram.institute/images/students/taj/amit-giri-taj.webp", caption: "Amit Giri at Taj Rambagh" },
  { cat: "Placements", src: "https://ram.institute/images/students/oberoi/oberoi-rajvilas.webp", caption: "Oberoi Rajvilas placement" },
  { cat: "Placements", src: "https://ram.institute/images/students/taj/chandra-taj-devi-ratan.webp", caption: "Chandra at Taj Devi Ratan" },
  { cat: "Campus", src: "https://ram.institute/images/training/students-training.webp", caption: "Industry-led training" },
  { cat: "Campus", src: "https://ram.institute/images/students/taj/taj-club.webp", caption: "Front office training" },
  { cat: "Placements", src: "https://ram.institute/images/students/oberoi/jigme-oberoi-sukhvillas.webp", caption: "Jigme at Oberoi" },
  { cat: "Placements", src: "https://ram.institute/images/students/oberoi/oberoi-udai-vilas.webp", caption: "Oberoi Udaivilās placement" },
];

export const SCHOLARSHIPS = [
  { name: "Merit Scholarship", amount: "Up to ₹50,000", eligibility: "10+2 score above 80%", description: "Awarded to top academic performers entering BHM/DHM. Renewable every semester subject to academic performance.", color: "burgundy" },
  { name: "Girl Child Scholarship", amount: "Up to ₹40,000", eligibility: "All women applicants", description: "RIHM is committed to gender equity in hospitality. Special scholarship for women entering BHM, Culinary Arts, Bakery, Bartending.", color: "gold" },
  { name: "Need-Based Aid", amount: "Up to ₹60,000", eligibility: "Annual family income < ₹4 LPA", description: "Financial assistance for talented students from economically weaker backgrounds. Includes hostel fee waiver.", color: "burgundy" },
  { name: "Hospitality Excellence", amount: "Up to ₹75,000", eligibility: "Sports/cultural/co-curricular distinction", description: "For students with exceptional achievements in sports, cultural events, or hospitality competitions.", color: "gold" },
  { name: "Defence Wards", amount: "20% fee waiver", eligibility: "Children of armed forces / paramilitary", description: "Special tribute to our defence personnel and their families.", color: "burgundy" },
  { name: "Sibling Discount", amount: "₹25,000 / sibling", eligibility: "Real sibling already enrolled or alumnus", description: "Family discount for RIHM alumni's family members joining the institute.", color: "gold" },
];

export const CAMPUS_FACILITIES = [
  { title: "Training Kitchen", desc: "Industrial cooking range, live tandoor, commercial gas systems and 5-star plating stations.", icon: "utensils" },
  { title: "Bakery & Patisserie Lab", desc: "Deck ovens, dough sheeters, chocolate tempering, sugar craft tools.", icon: "cake" },
  { title: "Mock Bar Lab", desc: "Full back-bar setup with 50+ spirits, glassware, flair-bartending station.", icon: "wine" },
  { title: "Training Restaurant", desc: "Live restaurant with banquet, fine-dine and coffee shop service areas.", icon: "utensils-crossed" },
  { title: "Mock Hotel Rooms", desc: "Twin, single and suite rooms for live housekeeping training.", icon: "bed" },
  { title: "Front Office Lab", desc: "OPERA PMS, OTA training systems and luxury reception desk.", icon: "concierge-bell" },
  { title: "Computer Lab", desc: "Hospitality software, Microsoft Office training, online learning portal.", icon: "monitor" },
  { title: "Smart Classrooms", desc: "AV-enabled, projector-mounted classrooms with case-study focus.", icon: "book-open" },
  { title: "Library & Reading", desc: "5000+ titles on hospitality, F&B, culinary arts and management.", icon: "library" },
  { title: "Auditorium", desc: "300-seat auditorium for guest lectures, hospitality conclaves, alumni meets.", icon: "mic" },
];

export const FAQS_HOME = [
  { q: "Why is Shri Ram Institute considered the best hotel management college in Dehradun?", a: "RIHM has been pioneering hospitality education in Uttarakhand since 1999. With a 97% placement record across Taj, Oberoi, ITC, Hyatt, Marriott, Accor and IHG; 7000+ alumni in leadership roles; and direct industry-led curriculum, RIHM is consistently ranked among India's top private hotel management institutes." },
  { q: "What courses are offered at RIHM Dehradun?", a: "RIHM offers Bachelor of Hotel Management (BHM, 3 yr), Master of Hotel Management (MHM, 2 yr), Diploma in Hotel Management (DHM, 1 yr), Diploma in Culinary Arts, Diploma in Bakery & Confectionery, and Diploma in Bartending & Mixology." },
  { q: "Are admissions open for the 2026 batch?", a: "Yes. Admissions for the 2026 academic batch are now open. Limited seats — only 47 seats remaining at the time of publishing. Apply early to secure your seat and scholarship." },
  { q: "What is the placement record of RIHM?", a: "97% placement rate. 300+ alumni at Taj Hotels, 130+ at ITC, 100+ at Hyatt, plus extensive placements at Oberoi, Marriott, Accor, IHG, Radisson, and global cruise lines like Royal Caribbean, MSC, and Carnival." },
  { q: "What scholarships are available?", a: "Multiple scholarships — Merit (₹50K), Girl Child (₹40K), Need-Based (₹60K), Hospitality Excellence (₹75K), Defence Wards (20% waiver), and Sibling Discount (₹25K). Apply on our Scholarships page." },
  { q: "Is hostel facility available?", a: "Yes. RIHM provides separate boys and girls hostel facilities with mess, Wi-Fi, study rooms and 24x7 security at a nominal annual fee. Mandatory for outstation students." },
  { q: "How do I apply for admission?", a: "Click Apply Now anywhere on this site, or call +91 70555 47000 / WhatsApp our admissions team. Our counsellors will guide you through eligibility, documents, scholarships and admission test." },
];

export const STATS = [
  { value: "26+", label: "Years of Excellence" },
  { value: "7000+", label: "Students Placed" },
  { value: "97%", label: "Placement Rate" },
  { value: "100+", label: "Hotel Partners" },
];
