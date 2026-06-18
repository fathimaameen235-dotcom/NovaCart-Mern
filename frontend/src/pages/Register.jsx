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

  const inputStyle = {
    background: "rgba(8,10,16,0.7)",
    border: "1px solid #1c2030",
    color: "#eef2ff",
    borderRadius: "12px",
    width: "100%",
    fontSize: "0.875rem",
    padding: "12px 16px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
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
  <div
    style={{
      minHeight: "100vh",
      background: "#080a10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter', sans-serif",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "860px",
        display: "flex",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #1e2235",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          width: "42%",
          background: "#0d0f1a",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "200px",
            height: "200px",
            background: "rgba(124,92,252,0.12)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "-40px",
            width: "160px",
            height: "160px",
            background: "rgba(59,130,246,0.08)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "700",
              }}
            >
              N
            </div>

            <span
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#eef2ff",
              }}
            >
              Nova<span style={{ color: "#7c5cfc" }}>Cart</span>
            </span>
          </Link>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "6px",
              marginTop: "28px",
              background: "rgba(124,92,252,0.1)",
              border: "1px solid rgba(124,92,252,0.25)",
              color: "#a78bfa",
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "0.6px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#7c5cfc",
              }}
            />
            SHOPPING PORTAL
          </div>

          <h2
            style={{
              color: "#eef2ff",
              fontSize: "26px",
              fontWeight: "700",
              lineHeight: "1.3",
              marginTop: "16px",
            }}
          >
            Create your shopping
            <br />
            account
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginTop: "10px",
              lineHeight: "1.7",
            }}
          >
            Join NovaCart today and explore thousands
            of products with secure checkout and
            exclusive offers.
          </p>

          <ul
            style={{
              listStyle: "none",
              marginTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[
              "Secure shopping experience",
              "Track orders anytime",
              "Wishlist & exclusive deals",
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#9ca3af",
                  fontSize: "12.5px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#7c5cfc",
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ color: "#374151", fontSize: "11px" }}>
          © 2026 NovaCart. All rights reserved.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          background: "#080a10",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              color: "#eef2ff",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Create Account
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
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
            style={{ ...inputStyle, marginBottom: "14px" }}
            onFocus={focusOn}
            onBlur={focusOff}
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            style={{ ...inputStyle, marginBottom: "14px" }}
            onFocus={focusOn}
            onBlur={focusOff}
          />

          <div style={{ position: "relative", marginBottom: "14px" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              style={{ ...inputStyle, paddingRight: "44px" }}
              onFocus={focusOn}
              onBlur={focusOff}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={{ ...inputStyle, paddingRight: "44px" }}
              onFocus={focusOn}
              onBlur={focusOff}
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>

          {form.confirm && form.password !== form.confirm && (
            <p
              style={{
                color: "#f87171",
                fontSize: "12px",
                marginTop: "8px",
              }}
            >
              Passwords don't match
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "16px",
              background: loading
                ? "rgba(124,92,252,0.5)"
                : "linear-gradient(135deg,#7c5cfc,#5b3fd4)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#1c2030" }} />
          <span style={{ color: "#374151", fontSize: "12px" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#1c2030" }} />
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "12.5px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#7c5cfc",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export default Register;