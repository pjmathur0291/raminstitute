import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, CheckCircle2, Lock, Sparkles, AlertCircle, ChevronLeft } from "lucide-react";
import SEO from "../lib/SEO";
import api from "../lib/api";
import { trackEvent } from "../lib/analytics";

const COURSES = [
  "Bachelor of Hotel Management (BHM)",
  "Master of Hotel Management (MHM)",
  "Diploma in Hotel Management (DHM)",
  "Diploma in Culinary Arts",
  "Diploma in Bakery & Confectionery",
  "Diploma in Bartending & Mixology",
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ApplyPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCourse = searchParams.get("course") || "";

  const [form, setForm] = useState({
    name: "",
    father_name: "",
    phone: "",
    email: "",
    course: COURSES.find(c => c.toLowerCase().includes(presetCourse.toLowerCase())) || "",
  });
  const [config, setConfig] = useState({ amount_inr: 5000, configured: false, test_mode: true });
  const [status, setStatus] = useState("idle"); // idle | submitting | paying | success | error
  const [error, setError] = useState("");
  const [paidApp, setPaidApp] = useState(null);

  useEffect(() => {
    api.get("/payments/config").then(r => setConfig(r.data)).catch(() => {});
    loadRazorpayScript();
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");
    try {
      // 1. Create order on backend
      const { data: order } = await api.post("/applications/create-order", form);
      trackEvent("application_started", { course: form.course, application_no: order.application_no });
      setStatus("paying");

      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        setError("Could not load payment SDK. Please refresh and try again.");
        setStatus("error");
        return;
      }

      // If running in DEV mode (no real Razorpay keys), skip the modal and directly verify
      if (order.razorpay_order_id.startsWith("order_mock_")) {
        const { data: paid } = await api.post("/applications/verify-payment", {
          application_id: order.application_id,
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_dev_only",
        });
        trackEvent("application_paid", { course: form.course, application_no: order.application_no });
        setPaidApp(paid);
        setStatus("success");
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: order.razorpay_key_id,
        amount: order.amount_paise,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: "Shri Ram Institute of Hotel Management",
        description: `Application Fee • ${form.course}`,
        image: "https://ram.institute/logo.png",
        prefill: order.prefill,
        theme: { color: "#8f244a" },
        notes: { application_no: order.application_no, course: form.course },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setError("Payment cancelled. Your application is saved as pending — you can complete payment later.");
          },
        },
        handler: async (response) => {
          try {
            const { data: paid } = await api.post("/applications/verify-payment", {
              application_id: order.application_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            trackEvent("application_paid", { course: form.course, application_no: order.application_no });
            setPaidApp(paid);
            setStatus("success");
          } catch (err) {
            setError(err?.response?.data?.detail || "Payment verification failed.");
            setStatus("error");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp?.error?.description || "Payment failed. Please try again.");
        setStatus("error");
      });
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please call +91 70555 47000.");
      setStatus("error");
    }
  };

  if (status === "success" && paidApp) {
    return (
      <section className="min-h-[70vh] bg-cream py-16">
        <div className="container-x max-w-2xl">
          <div className="bg-white border border-emerald-200 rounded-sm shadow-elegant overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center text-white">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-3" />
              <h1 className="font-display text-3xl md:text-4xl font-bold">Application Submitted!</h1>
              <p className="text-emerald-50 mt-1">Payment successfully received</p>
            </div>
            <div className="p-8 space-y-5">
              <div className="bg-cream rounded-sm p-5 border border-burgundy-100">
                <p className="text-xs uppercase tracking-widest text-gray-500">Application No.</p>
                <p className="font-display text-3xl font-bold text-burgundy-700" data-testid="apply-application-no">{paidApp.application_no}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Name" value={paidApp.name} />
                <Detail label="Father's Name" value={paidApp.father_name} />
                <Detail label="Phone" value={paidApp.phone} />
                <Detail label="Email" value={paidApp.email} />
                <Detail label="Course" value={paidApp.course} />
                <Detail label="Amount Paid" value={`₹${paidApp.amount_inr}`} />
                {paidApp.razorpay_payment_id && <Detail label="Payment ID" value={paidApp.razorpay_payment_id} />}
              </div>
              <div className="bg-gold-50 border border-gold-200 rounded-sm p-4 text-sm text-burgundy-800">
                <p className="font-semibold mb-1">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1 text-burgundy-700">
                  <li>Our admissions counsellor will call you within 24 hours</li>
                  <li>You&apos;ll receive an email with document checklist</li>
                  <li>Scholarship eligibility will be confirmed within 7 days</li>
                </ol>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:+917055547000`} className="btn-burgundy">Call Admissions</a>
                <Link to="/" className="btn-outline-burgundy">Back to Home</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const submitting = status === "submitting" || status === "paying";

  return (
    <>
      <SEO
        title="Apply Now | Shri Ram Institute Dehradun | 2026 Admissions"
        description="Apply online for the 2026 batch at Shri Ram Institute of Hotel Management Dehradun. Pay ₹5000 application fee via Razorpay (UPI/Card/Netbanking)."
        canonical="https://ram.institute/apply"
      />
      <section className="bg-gradient-to-br from-burgundy-700 to-burgundy-500 text-white py-12 md:py-16">
        <div className="container-x max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-gold-300 text-xs uppercase tracking-widest hover:text-gold-400 mb-3">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 uppercase tracking-[0.3em] text-xs font-semibold">Online Application • 2026</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            Apply Online for <em className="text-gold-400 not-italic">RIHM Dehradun</em>
          </h1>
          <p className="text-white/85 mt-2 max-w-2xl">
            Secure your seat with a one-time application fee of <b className="text-gold-300">₹{config.amount_inr}</b>. Pay safely via UPI, Cards, or Netbanking through Razorpay.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream">
        <div className="container-x max-w-2xl">
          <div className="bg-white rounded-sm shadow-elegant overflow-hidden border border-burgundy-100">
            <div className="h-1 bg-gradient-to-r from-burgundy-700 via-gold-500 to-burgundy-700" />
            <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5" data-testid="apply-form">
              <Field label="Full Name *" testid="apply-name">
                <input required minLength={2} value={form.name} onChange={update("name")} placeholder="As per Aadhaar / school records" className="form-input" data-testid="apply-name-input" />
              </Field>
              <Field label="Father's Name *" testid="apply-father">
                <input required minLength={2} value={form.father_name} onChange={update("father_name")} placeholder="Father's full name" className="form-input" data-testid="apply-father-input" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Mobile Number *" testid="apply-phone">
                  <input required pattern="[6-9][0-9]{9}" value={form.phone} onChange={update("phone")} placeholder="10-digit mobile" type="tel" className="form-input" data-testid="apply-phone-input" />
                </Field>
                <Field label="Email Address *" testid="apply-email">
                  <input required type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="form-input" data-testid="apply-email-input" />
                </Field>
              </div>
              <Field label="Choose Course *" testid="apply-course">
                <select required value={form.course} onChange={update("course")} className="form-input text-gray-700" data-testid="apply-course-input">
                  <option value="">-- Select your preferred course --</option>
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              {/* Fee summary */}
              <div className="bg-cream border border-burgundy-100 rounded-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500">Application Fee (Non-refundable)</p>
                  <p className="font-display text-2xl font-bold text-burgundy-700">₹{config.amount_inr.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Powered by</p>
                  <p className="font-bold text-[#3395FF] text-sm">Razorpay</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-sm p-3 flex gap-2 items-start text-sm text-red-700" data-testid="apply-error">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-burgundy w-full disabled:opacity-60" data-testid="apply-submit">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {status === "paying" ? "Opening payment…" : "Creating order…"}</>
                ) : (
                  <><Lock className="w-4 h-4" /> Pay ₹{config.amount_inr.toLocaleString("en-IN")} & Submit Application</>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-bit SSL</span>
                <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-600" /> Razorpay Secured</span>
                {!config.configured && <span className="text-amber-600 font-semibold">DEV MODE</span>}
              </div>
              <p className="text-[10px] text-center text-gray-400 leading-relaxed">
                By proceeding, I authorise Shri Ram Institute Dehradun &amp; its representatives to contact me via email, SMS, WhatsApp and call regarding my application. This will override DND/NDNC registry.
              </p>
            </form>
          </div>
        </div>
      </section>
      <style>{`.form-input{height:2.75rem;width:100%;padding:0 0.75rem;border-radius:0.125rem;border:1px solid hsl(345,20%,88%);font-size:0.875rem;background:white;transition:all .2s;outline:none}.form-input:focus{border-color:hsl(345,60%,35%);box-shadow:0 0 0 3px hsla(345,60%,35%,0.1)}`}</style>
    </>
  );
}

function Field({ label, children, testid }) {
  return (
    <div data-testid={testid}>
      <label className="text-xs uppercase tracking-widest text-gray-600 font-semibold block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
      <p className="font-semibold text-burgundy-700 break-words">{value}</p>
    </div>
  );
}
