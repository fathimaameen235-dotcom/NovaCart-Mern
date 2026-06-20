import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirm = form.confirm.trim();

    if (!name || !email || !password || !confirm)
      return toast.error("Please fill in all fields");

    if (!/^\S+@\S+\.\S+$/.test(email))
      return toast.error("Please enter a valid email");

    if (password !== confirm)
      return toast.error("Passwords do not match");

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);

      await register(name, email, password);

      toast.success("Account created successfully 🚀", {
        style: {
          background: "#13161e",
          color: "#e2e8f0",
          border: "1px solid #1e2130",
        },
        iconTheme: {
          primary: "#7c5cfc",
          secondary: "#fff",
        },
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[rgba(8,10,16,0.7)] border border-[#1c2030] text-[#eef2ff] rounded-xl text-sm px-4 py-3 outline-none font-['DM_Sans',sans-serif] transition-[border-color,box-shadow] focus:border-[#7c5cfc] focus:shadow-[0_0_0_3px_rgba(124,92,252,0.12)]";

  const EyeIcon = ({ open }) =>
    open ? (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
      </svg>
    ) : (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center px-4 py-6 sm:px-6 font-['Inter',sans-serif]">
      <div className="w-full max-w-[860px] flex flex-col md:flex-row rounded-2xl overflow-hidden border border-[#1e2235] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">

        {/* LEFT PANEL — hidden on mobile, shown from md (tablet) up */}
        <div className="hidden md:flex md:w-[42%] bg-[#0d0f1a] p-8 lg:p-10 flex-col justify-between relative overflow-hidden">

          <div className="absolute -top-[60px] -left-[60px] w-[200px] h-[200px] bg-[rgba(124,92,252,0.12)] rounded-full blur-[50px]" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[rgba(59,130,246,0.08)] rounded-full blur-[40px]" />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-white font-bold flex-shrink-0">
                N
              </div>
              <span className="text-xl font-bold text-[#eef2ff]">
                Nova<span className="text-[#7c5cfc]">Cart</span>
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md mt-7 bg-[rgba(124,92,252,0.1)] border border-[rgba(124,92,252,0.25)] text-[#a78bfa] text-[10px] font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc]" />
              SHOPPING PORTAL
            </div>

            <h2 className="text-[#eef2ff] text-[26px] font-bold leading-tight mt-4">
              Create your shopping
              <br />
              account
            </h2>

            <p className="text-[#6b7280] text-[13px] mt-2.5 leading-[1.7]">
              Join NovaCart today and explore thousands
              of products with secure checkout and
              exclusive offers.
            </p>

            <ul className="list-none mt-6 flex flex-col gap-2.5">
              {[
                "Secure shopping experience",
                "Track orders anytime",
                "Wishlist & exclusive deals",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[#9ca3af] text-[12.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[#374151] text-[11px] relative z-10">
            © {new Date().getFullYear()} NovaCart. All rights reserved.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-[#080a10] p-6 sm:p-8 md:p-10 flex flex-col justify-center">

          {/* Mobile-only compact brand header (shown when left panel is hidden) */}
          <Link to="/" className="md:hidden flex items-center gap-2.5 no-underline mb-6">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
              N
            </div>
            <span className="text-lg font-bold text-[#eef2ff]">
              Nova<span className="text-[#7c5cfc]">Cart</span>
            </span>
          </Link>

          <div className="mb-6">
            <h2 className="text-[#eef2ff] text-xl sm:text-2xl font-bold">
              Create Account
            </h2>
            <p className="text-[#6b7280] text-[13px] mt-1">
              Join NovaCart today
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`${inputClass} mb-3.5`}
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`${inputClass} mb-3.5`}
            />

            <div className="relative mb-3.5">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#6b7280] cursor-pointer"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#6b7280] cursor-pointer"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            {form.confirm && form.password !== form.confirm && (
              <p className="text-[#f87171] text-xs mt-2">
                Passwords don't match
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-4 rounded-[10px] border-none text-white font-semibold transition-colors ${
                loading
                  ? "bg-[rgba(124,92,252,0.5)] cursor-not-allowed"
                  : "bg-gradient-to-br from-[#7c5cfc] to-[#5b3fd4] cursor-pointer"
              }`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1c2030]" />
            <span className="text-[#374151] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#1c2030]" />
          </div>

          <p className="text-center text-[#6b7280] text-[12.5px]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#7c5cfc] no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;