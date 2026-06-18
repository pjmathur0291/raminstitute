import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import api from "../lib/api";
import { trackLead } from "../lib/analytics";

const COURSES = [
  { value: "BHM", label: "Bachelor of Hotel Management (BHM)" },
  { value: "MHM", label: "Master of Hotel Management (MHM)" },
  { value: "DHM", label: "Diploma in Hotel Management (DHM)" },
  { value: "Culinary Arts", label: "Culinary Arts" },
  { value: "Bakery", label: "Bakery & Confectionery" },
  { value: "Bartending", label: "Bartending & Mixology" },
  { value: "Other", label: "Other / Not Sure" },
];

export default function LeadForm({
  variant = "card", // card | inline | dark
  source = "enquiry",
  defaultCourse = "",
  title = "Request a Callback",
  subtitle = "Our counsellor will contact you within 30 minutes",
  testIdPrefix = "lead",
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    course: defaultCourse,
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      // Strip empty optional fields so backend EmailStr validator accepts the payload
      const payload = { source };
      Object.entries(form).forEach(([k, v]) => {
        const trimmed = typeof v === "string" ? v.trim() : v;
        if (trimmed !== "" && trimmed !== null && trimmed !== undefined) payload[k] = trimmed;
      });
      await api.post("/leads", payload);
      trackLead(source);
      setStatus("success");
      setForm({ name: "", phone: "", email: "", city: "", course: defaultCourse, message: "" });
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please call us directly.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-8 text-center" data-testid={`${testIdPrefix}-success`}>
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-display text-2xl font-semibold text-emerald-900 mb-2">Thank You!</h3>
        <p className="text-emerald-800 text-sm">
          Your enquiry has been received. Our admissions counsellor will call you within 30 minutes.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-emerald-700 underline"
          data-testid={`${testIdPrefix}-submit-another`}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  const isDark = variant === "dark";
  const inputBase = "h-12 w-full px-4 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition";
  const inputLight = `${inputBase} bg-white border border-burgundy-100 text-gray-900 placeholder:text-gray-400`;
  const inputDark = `${inputBase} bg-white/95 border-0 text-gray-900 placeholder:text-gray-500`;
  const inputCls = isDark ? inputDark : inputLight;

  if (variant === "inline") {
    // Compact horizontal layout for hero/strip
    return (
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2.5" data-testid={`${testIdPrefix}-form`}>
        <input data-testid={`${testIdPrefix}-name`} required minLength={2} placeholder="Your Name *" value={form.name} onChange={update("name")} className={inputDark} />
        <input data-testid={`${testIdPrefix}-phone`} required pattern="[6-9][0-9]{9}" placeholder="Mobile Number *" value={form.phone} onChange={update("phone")} type="tel" className={inputDark} />
        <select data-testid={`${testIdPrefix}-course`} value={form.course} onChange={update("course")} className={`${inputDark} text-gray-700`}>
          <option value="">Select Course *</option>
          {COURSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-gold h-12 disabled:opacity-60"
          data-testid={`${testIdPrefix}-submit`}
        >
          {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Get FREE Callback
        </button>
        {error && <p className="md:col-span-4 text-xs text-red-200 mt-1">{error}</p>}
      </form>
    );
  }

  // Card (vertical)
  return (
    <div className={`rounded-sm overflow-hidden ${isDark ? "bg-burgundy-600 border border-white/10" : "bg-white border border-burgundy-100 shadow-elegant"}`}>
      <div className="h-1 bg-gradient-to-r from-burgundy-700 via-burgundy-500 to-burgundy-700" />
      <div className="p-6 md:p-8">
        <h3 className={`font-display text-2xl font-semibold ${isDark ? "text-white" : "text-burgundy-700"} mb-1`}>
          {title}
        </h3>
        <p className={`text-sm mb-5 ${isDark ? "text-white/70" : "text-gray-500"}`}>{subtitle}</p>
        <form onSubmit={onSubmit} className="space-y-4" data-testid={`${testIdPrefix}-form`}>
          <input data-testid={`${testIdPrefix}-name`} required minLength={2} placeholder="Full Name *" value={form.name} onChange={update("name")} className={inputCls} />
          <input data-testid={`${testIdPrefix}-phone`} required pattern="[6-9][0-9]{9}" placeholder="10-digit Mobile *" value={form.phone} onChange={update("phone")} type="tel" className={inputCls} />
          <input data-testid={`${testIdPrefix}-email`} placeholder="Email (optional)" value={form.email} onChange={update("email")} type="email" className={inputCls} />
          <input data-testid={`${testIdPrefix}-city`} placeholder="City" value={form.city} onChange={update("city")} className={inputCls} />
          <select data-testid={`${testIdPrefix}-course`} value={form.course} onChange={update("course")} className={`${inputCls} text-gray-700`}>
            <option value="">Select Course of Interest</option>
            {COURSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <textarea data-testid={`${testIdPrefix}-message`} placeholder="Message (optional)" value={form.message} onChange={update("message")} rows={3} className={`${inputCls} h-auto py-3`} />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-burgundy w-full disabled:opacity-60"
            data-testid={`${testIdPrefix}-submit`}
          >
            {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit & Get Callback
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className={`text-[10px] text-center leading-relaxed ${isDark ? "text-white/50" : "text-gray-400"}`}>
            By submitting, I authorise RIHM Dehradun to contact me via call, SMS, WhatsApp & email regarding admissions. This overrides DND/NDNC registry.
          </p>
        </form>
      </div>
    </div>
  );
}
