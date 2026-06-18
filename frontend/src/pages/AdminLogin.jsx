import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
    </svg>
  ) : (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

const AdminLogin = () => {
  const { adminUser, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (adminUser) navigate("/admin", { replace: true });
  }, [adminUser, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const email = form.email.trim();
    const password = form.password.trim();
    if (!email || !password) return toast.error("Please fill in all fields");
    try {
      setLoading(true);
      await adminLogin(email, password);
      toast.success("Admin login successful");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(8,10,16,0.8)",
    border: "1px solid #1c2030",
    borderRadius: "10px",
    color: "#eef2ff",
    fontSize: "13.5px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const focusOn = (e) => {
    e.target.style.borderColor = "#7c5cfc";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)";
  };
  const focusOff = (e) => {
    e.target.style.borderColor = "#1c2030";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080a10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "860px",
        display: "flex",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #1e2235",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: "42%",
          background: "#0d0f1a",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow blobs */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"200px", height:"200px", background:"rgba(124,92,252,0.12)", borderRadius:"50%", filter:"blur(50px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-40px", left:"-40px", width:"160px", height:"160px", background:"rgba(59,130,246,0.08)", borderRadius:"50%", filter:"blur(40px)", pointerEvents:"none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <Link to="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none" }}>
              <div style={{
                width:"38px", height:"38px", borderRadius:"10px",
                background:"linear-gradient(135deg,#7c5cfc,#3b82f6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:"700", color:"#fff", fontSize:"16px",
              }}>N</div>
              <span style={{ fontSize:"20px", fontWeight:"700", color:"#eef2ff" }}>
                Nova<span style={{ color:"#7c5cfc" }}>Cart</span>
              </span>
            </Link>

            {/* Badge */}
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"6px",
              padding:"5px 12px", borderRadius:"6px", marginTop:"28px",
              background:"rgba(124,92,252,0.1)", border:"1px solid rgba(124,92,252,0.25)",
              color:"#a78bfa", fontSize:"10px", fontWeight:"600", letterSpacing:"0.6px",
            }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#7c5cfc", display:"inline-block" }} />
              ADMIN PORTAL
            </div>

            <h2 style={{ color:"#eef2ff", fontSize:"26px", fontWeight:"700", lineHeight:"1.3", marginTop:"16px" }}>
              Manage your store<br />with confidence
            </h2>
            <p style={{ color:"#6b7280", fontSize:"13px", marginTop:"10px", lineHeight:"1.7" }}>
              Secure access to NovaCart's admin panel. Control products, orders, and users all in one place.
            </p>

            <ul style={{ listStyle:"none", marginTop:"24px", display:"flex", flexDirection:"column", gap:"10px" }}>
              {["Role-based access control", "Real-time order management", "Secure JWT authentication"].map((f) => (
                <li key={f} style={{ display:"flex", alignItems:"center", gap:"10px", color:"#9ca3af", fontSize:"12.5px" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#7c5cfc", flexShrink:0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ color:"#374151", fontSize:"11px", position:"relative", zIndex:1 }}>
            © 2025 NovaCart. All rights reserved.
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1,
          background: "#080a10",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ color:"#eef2ff", fontSize:"24px", fontWeight:"700" }}>Welcome back</h2>
            <p style={{ color:"#6b7280", fontSize:"13px", marginTop:"4px" }}>Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:"14px" }}>
              <label style={{ display:"block", color:"#9ca3af", fontSize:"12px", fontWeight:"500", marginBottom:"6px" }}>
                Email address
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="admin@novacart.com"
                style={inputBase} onFocus={focusOn} onBlur={focusOff}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom:"14px" }}>
              <label style={{ display:"block", color:"#9ca3af", fontSize:"12px", fontWeight:"500", marginBottom:"6px" }}>
                Password
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" value={form.password}
                  onChange={handleChange} placeholder="Enter your password"
                  style={{ ...inputBase, paddingRight:"44px" }}
                  onFocus={focusOn} onBlur={focusOff}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#6b7280", cursor:"pointer", display:"flex", alignItems:"center" }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width:"100%", padding:"12px",
                background: loading ? "rgba(124,92,252,0.5)" : "linear-gradient(135deg,#7c5cfc,#5b3fd4)",
                border:"none", borderRadius:"10px",
                color:"#fff", fontSize:"14px", fontWeight:"600",
                fontFamily:"'Inter', sans-serif", cursor: loading ? "not-allowed" : "pointer",
                marginTop:"4px", transition:"opacity 0.2s",
              }}
            >
              {loading ? "Signing in…" : "Sign in as Admin"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"20px 0" }}>
            <div style={{ flex:1, height:"1px", background:"#1c2030" }} />
            <span style={{ color:"#374151", fontSize:"12px" }}>OR</span>
            <div style={{ flex:1, height:"1px", background:"#1c2030" }} />
          </div>

          <p style={{ textAlign:"center", color:"#6b7280", fontSize:"12.5px" }}>
            No admin account?{" "}
            <Link to="/admin/register" style={{ color:"#7c5cfc", textDecoration:"none" }}>Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;