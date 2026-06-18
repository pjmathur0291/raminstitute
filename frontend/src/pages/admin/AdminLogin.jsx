import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, Mail, Loader2 } from "lucide-react";
import { login } from "../../lib/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-burgundy-700 flex items-center justify-center p-4 font-dash">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(43,74%,50%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-white text-burgundy-600 flex flex-col items-center justify-center rounded-sm border-2 border-gold-500 mb-3">
            <span className="font-display text-xl leading-none font-bold">श्री</span>
            <span className="font-display text-[10px] leading-none tracking-widest mt-0.5">RAM</span>
          </div>
          <h1 className="font-display text-3xl text-white font-bold">RIHM Admin Console</h1>
          <p className="text-gold-300 text-xs uppercase tracking-widest mt-1">CMS Dashboard</p>
        </div>
        <div className="bg-white rounded-sm shadow-elegant p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ram.institute"
                className="w-full h-11 px-3 rounded-sm border border-gray-200 focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 text-sm"
                data-testid="admin-login-email"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1 mb-1.5"><Lock className="w-3.5 h-3.5" /> Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-sm border border-gray-200 focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 text-sm"
                data-testid="admin-login-password"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-sm p-2.5" data-testid="admin-login-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-burgundy w-full h-11"
              data-testid="admin-login-submit"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign in to Console
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">For internal RIHM staff only</p>
        </div>
      </div>
    </div>
  );
}
