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

  const inputClass =
    "w-full px-3.5 py-2.5 bg-[rgba(8,10,16,0.8)] border border-[#1c2030] rounded-[10px] text-[#eef2ff] text-[13.5px] font-['Inter',sans-serif] outline-none transition-[border-color,box-shadow] focus:border-[#7c5cfc] focus:shadow-[0_0_0_3px_rgba(124,92,252,0.12)]";

  return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center px-4 py-6 sm:px-6 font-['Inter',sans-serif]">
      <div className="w-full max-w-[860px] flex flex-col md:flex-row rounded-2xl overflow-hidden border border-[#1e2235] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">

        {/* ── LEFT PANEL — hidden on mobile, shown from md up ── */}
        <div className="hidden md:flex md:w-[42%] bg-[#0d0f1a] p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
          {/* Glow blobs */}
          <div className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] bg-[rgba(124,92,252,0.12)] rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[rgba(59,130,246,0.08)] rounded-full blur-[40px] pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center font-bold text-white text-base flex-shrink-0">
                N
              </div>
              <span className="text-xl font-bold text-[#eef2ff]">
                Nova<span className="text-[#7c5cfc]">Cart</span>
              </span>
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md mt-7 bg-[rgba(124,92,252,0.1)] border border-[rgba(124,92,252,0.25)] text-[#a78bfa] text-[10px] font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc] inline-block" />
              ADMIN PORTAL
            </div>

            <h2 className="text-[#eef2ff] text-[26px] font-bold leading-tight mt-4">
              Manage your store<br />with confidence
            </h2>
            <p className="text-[#6b7280] text-[13px] mt-2.5 leading-[1.7]">
              Secure access to NovaCart's admin panel. Control products, orders, and users all in one place.
            </p>

            <ul className="list-none mt-6 flex flex-col gap-2.5">
              {["Role-based access control", "Real-time order management", "Secure JWT authentication"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[#9ca3af] text-[12.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[#374151] text-[11px] relative z-10">
            © {new Date().getFullYear()} NovaCart. All rights reserved.
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 bg-[#080a10] p-6 sm:p-8 md:p-10 flex flex-col justify-center">

          {/* Mobile-only compact brand header */}
          <Link to="/" className="md:hidden flex items-center gap-2.5 no-underline mb-6">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              N
            </div>
            <span className="text-lg font-bold text-[#eef2ff]">
              Nova<span className="text-[#7c5cfc]">Cart</span>
            </span>
          </Link>

          <div className="mb-6 sm:mb-7">
            <h2 className="text-[#eef2ff] text-xl sm:text-2xl font-bold">Welcome back</h2>
            <p className="text-[#6b7280] text-[13px] mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3.5">
              <label className="block text-[#9ca3af] text-xs font-medium mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@novacart.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="mb-3.5">
              <label className="block text-[#9ca3af] text-xs font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#6b7280] cursor-pointer flex items-center"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-[10px] border-none text-white text-sm font-semibold font-['Inter',sans-serif] mt-1 transition-opacity ${
                loading
                  ? "bg-[rgba(124,92,252,0.5)] cursor-not-allowed"
                  : "bg-gradient-to-br from-[#7c5cfc] to-[#5b3fd4] cursor-pointer"
              }`}
            >
              {loading ? "Signing in…" : "Sign in as Admin"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1c2030]" />
            <span className="text-[#374151] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#1c2030]" />
          </div>

          <p className="text-center text-[#6b7280] text-[12.5px]">
            No admin account?{" "}
            <Link to="/admin/register" className="text-[#7c5cfc] no-underline">Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;