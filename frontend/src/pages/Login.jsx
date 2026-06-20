import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const email = form.email.trim();
    const password = form.password.trim();
    if (!email || !password) return toast.error("Please fill in all fields");

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back!", {
        style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1e2130" },
        iconTheme: { primary: "#7c5cfc", secondary: "#fff" },
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(8,10,16,0.7)",
    border: "1px solid #1c2030",
    color: "#eef2ff",
    borderRadius: "12px",
    width: "100%",
    fontSize: "0.875rem",
    padding: "11px 14px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  const focusOn = (e) => {
    e.target.style.borderColor = "#7c5cfc";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)";
  };
  const focusOff = (e) => {
    e.target.style.borderColor = "#1c2030";
    e.target.style.boxShadow = "none";
  };

  const EyeIcon = ({ open }) =>
    open ? (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
      </svg>
    ) : (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#080a10", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Inter', sans-serif" }}>

      <div style={{ width: "100%", maxWidth: 860, display: "flex", borderRadius: 16, overflow: "hidden", border: "1px solid #1e2235", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>

        {/* LEFT PANEL — hidden on mobile */}
        <div style={{ width: "42%", background: "#0d0f1a", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}
          className="auth-left-panel"
        >
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 200, height: 200, background: "rgba(124,92,252,0.12)", borderRadius: "50%", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: 160, height: 160, background: "rgba(59,130,246,0.08)", borderRadius: "50%", filter: "blur(40px)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7c5cfc,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>N</div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#eef2ff" }}>Nova<span style={{ color: "#7c5cfc" }}>Cart</span></span>
            </Link>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, marginTop: 28, background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.25)", color: "#a78bfa", fontSize: 10, fontWeight: 600, letterSpacing: "0.6px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c5cfc" }} />
              SHOPPING PORTAL
            </div>

            <h2 style={{ color: "#eef2ff", fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginTop: 16 }}>
              Discover amazing<br />products every day
            </h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 10, lineHeight: 1.7 }}>
              Sign in to access your account, manage orders, wishlist and enjoy a seamless shopping experience.
            </p>

            <ul style={{ listStyle: "none", marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Fast & secure checkout", "Track orders in real-time", "Exclusive member offers"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 12.5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c5cfc", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p style={{ color: "#374151", fontSize: 11 }}>© 2026 NovaCart. All rights reserved.</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, background: "#080a10", padding: "clamp(24px, 5vw, 48px) clamp(20px, 5vw, 40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ display: "none", marginBottom: 28 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c5cfc,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>N</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff" }}>Nova<span style={{ color: "#7c5cfc" }}>Cart</span></span>
            </Link>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: "#eef2ff", fontSize: "clamp(1.25rem, 4vw, 1.5rem)", fontWeight: 700 }}>Welcome Back</h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Sign in to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="john@example.com" autoComplete="email"
              style={{ ...inputStyle, marginBottom: 12 }}
              onFocus={focusOn} onBlur={focusOff}
            />

            <div style={{ position: "relative", marginBottom: 4 }}>
              <input
                type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                placeholder="Enter your password" autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={focusOn} onBlur={focusOff}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", marginTop: 16, background: loading ? "rgba(124,92,252,0.5)" : "linear-gradient(135deg,#7c5cfc,#5b3fd4)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#1c2030" }} />
            <span style={{ color: "#374151", fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#1c2030" }} />
          </div>

          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#7c5cfc", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .auth-left-panel { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;