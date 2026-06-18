import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nova-glass border-b border-nova-border backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-nova-gradient flex items-center justify-center shadow-lg">
              <span className="text-white font-display font-bold text-sm">N</span>
            </div>
            <span className="font-display font-bold text-xl text-nova-text">
              Nova<span className="text-nova-accent">Cart</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-body text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-nova-accent"
                    : "text-nova-muted hover:text-nova-text"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-nova-accent rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Cart */}
            {user && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-nova-accent rounded-full text-white text-xs flex items-center justify-center font-mono font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Desktop: User Actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all duration-200"
                  >
                    <img
                      src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
                      alt={user?.name || "User"}
                      className="w-7 h-7 rounded-full object-cover border border-nova-border"
                    />
                    <span className="font-body text-sm">
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="nova-btn-secondary px-4 py-2 rounded-lg text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nova-btn-secondary px-4 py-2 rounded-lg text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="nova-btn-primary px-4 py-2 rounded-lg text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all duration-200"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-nova-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg font-body text-sm transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-nova-surface text-nova-accent"
                      : "text-nova-muted hover:text-nova-text hover:bg-nova-surface"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link to="/dashboard" className="px-3 py-2 rounded-lg font-body text-sm text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="px-3 py-2 rounded-lg font-body text-sm text-left text-red-400 hover:bg-nova-surface transition-all">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link to="/login" className="flex-1 nova-btn-secondary py-2 rounded-lg text-sm text-center">Login</Link>
                  <Link to="/register" className="flex-1 nova-btn-primary py-2 rounded-lg text-sm text-center">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;