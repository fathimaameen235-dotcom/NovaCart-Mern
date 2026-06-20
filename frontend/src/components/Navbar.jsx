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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-nova-border backdrop-blur-lg transition-all duration-200 ${
          scrolled ? "bg-nova-bg/95 shadow-lg shadow-black/20" : "bg-nova-bg/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-nova-gradient flex items-center justify-center shadow-lg">
                <span className="text-white font-display font-bold text-xs sm:text-sm">N</span>
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-nova-text">
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
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search icon (mobile) */}
              <Link
                to="/products"
                className="md:hidden p-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
                aria-label="Search products"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Cart */}
              {user && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
                  aria-label="Open cart"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-nova-accent rounded-full text-white text-[10px] flex items-center justify-center font-mono font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
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
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
                    >
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=7c5cfc&color=fff`}
                        alt={user?.name || "User"}
                        className="w-7 h-7 rounded-full object-cover border border-nova-border"
                      />
                      <span className="font-body text-sm hidden lg:block">
                        {user?.name?.split(" ")[0] || "Account"}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="nova-btn-secondary px-3 py-1.5 rounded-lg text-sm"
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

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <div className="w-5 h-5 flex flex-col justify-center gap-1.5 relative">
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-nova-card border-l border-nova-border flex flex-col md:hidden transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-nova-border">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <div className="w-7 h-7 rounded-lg bg-nova-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-display font-bold text-nova-text">Nova<span className="text-nova-accent">Cart</span></span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1.5 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User section */}
        {user && (
          <div className="px-5 py-4 border-b border-nova-border bg-nova-surface/40">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=7c5cfc&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-nova-accent/30"
              />
              <div className="min-w-0">
                <p className="text-nova-text font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-nova-muted text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <p className="text-nova-muted text-xs font-mono uppercase tracking-widest px-3 mb-2">Menu</p>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm font-medium mb-1 transition-all ${
                isActive(link.path)
                  ? "bg-nova-accent/10 text-nova-accent border border-nova-accent/20"
                  : "text-nova-muted hover:text-nova-text hover:bg-nova-surface"
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-nova-accent" />
              )}
            </Link>
          ))}

          {user && (
            <>
              <div className="h-px bg-nova-border my-3 mx-3" />
              <p className="text-nova-muted text-xs font-mono uppercase tracking-widest px-3 mb-2">Account</p>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-nova-muted hover:text-nova-text hover:bg-nova-surface mb-1 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Dashboard
              </Link>
              <Link
                to="/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-nova-muted hover:text-nova-text hover:bg-nova-surface mb-1 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Orders
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-red-400 hover:bg-red-400/10 mb-1 transition-all text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Auth buttons for guests */}
        {!user && (
          <div className="p-4 border-t border-nova-border flex flex-col gap-2">
            <Link to="/register" className="nova-btn-primary py-3 rounded-xl text-sm text-center font-semibold">
              Create Account
            </Link>
            <Link to="/login" className="nova-btn-secondary py-3 rounded-xl text-sm text-center">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;