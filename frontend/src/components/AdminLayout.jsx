import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  {
    label: "Dashboard", path: "/admin", exact: true,
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  },
  {
    label: "Orders", path: "/admin/orders",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  },
  {
    label: "Users", path: "/admin/users",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    label: "Analytics", path: "/admin/analytics",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  },
  {
    label: "Payments", path: "/admin/payments",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  },
  {
    label: "Reviews", path: "/admin/reviews",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
  {
    label: "Add Product", path: "/admin/add-product",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4"/></svg>,
  },
];

const TOPBAR_H = 60;

const AdminLayout = ({ children }) => {
  const { adminUser, adminLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // collapsed = desktop icon-only mode (lg and up)
  const [collapsed, setCollapsed] = useState(false);
  // mobileOpen = slide-in drawer on mobile/tablet
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const initials = (adminUser?.name || "A")[0].toUpperCase();
  const pageLabel = NAV_ITEMS.find((i) => isActive(i))?.label || "Admin";

  return (
    <div className="min-h-screen flex bg-[#060812] font-['DM_Sans',sans-serif] relative">

      {/* Mobile/tablet overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/65 z-[98] lg:hidden"
        />
      )}

      {/* ── Sidebar ──
          - Mobile/Tablet (< lg): fixed drawer, slides in/out via translate-x, always full width (220px) when open
          - Desktop (lg+): static, can collapse to icon-only width
      */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-[99] flex flex-col overflow-hidden
          bg-[#090b13] border-r border-[#1a1d2e]
          transition-transform duration-200 ease-in-out
          w-[240px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:transition-[width] lg:duration-200
          ${collapsed ? "lg:w-[64px]" : "lg:w-[220px]"}
        `}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-4 flex-shrink-0 border-b border-[#1a1d2e]"
          style={{ height: TOPBAR_H }}
        >
          <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center">
            <span className="text-white font-['Syne',sans-serif] font-bold text-[13px]">N</span>
          </div>

          {!collapsed && (
            <span className="font-['Syne',sans-serif] font-bold text-[17px] text-[#eef2ff] whitespace-nowrap">
              Nova<span className="text-[#7c5cfc]">Cart</span>
            </span>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto hidden lg:flex bg-transparent border-none cursor-pointer text-[#525878] p-1 rounded-md flex-shrink-0"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>

          {/* Close drawer — mobile/tablet only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden bg-transparent border-none cursor-pointer text-[#525878] p-1 rounded-md flex-shrink-0"
            aria-label="Close menu"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-2.5 rounded-[10px] mb-0.5 no-underline
                  text-sm whitespace-nowrap transition-all
                  px-3 py-2.5
                  ${collapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : ""}
                  ${active
                    ? "text-[#a78bfa] bg-[rgba(124,92,252,0.12)] border border-[rgba(124,92,252,0.2)] font-semibold"
                    : "text-[#525878] bg-transparent border border-transparent font-normal"}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div
          className={`flex items-center gap-2.5 border-t border-[#1a1d2e] px-3.5 py-3 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <div className="w-[30px] h-[30px] rounded-full flex-shrink-0 bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
          <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <div className="text-[#eef2ff] text-[0.8rem] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              {adminUser?.name || "Admin"}
            </div>
            <div className="text-[#525878] text-[0.7rem]">Administrator</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div
        className={`
          flex-1 min-w-0 flex flex-col min-h-screen
          transition-[margin-left] duration-200 ease-in-out
          ml-0
          ${collapsed ? "lg:ml-[64px]" : "lg:ml-[220px]"}
        `}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-50 flex items-center gap-3 px-4 sm:px-6 border-b border-[#1a1d2e] bg-[rgba(6,8,18,0.9)] backdrop-blur-md flex-shrink-0"
          style={{ height: TOPBAR_H }}
        >
          {/* Hamburger — mobile/tablet only */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden bg-transparent border-none text-[#525878] cursor-pointer flex items-center justify-center p-1 -ml-1"
            aria-label="Open menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="font-['Syne',sans-serif] font-semibold text-[#eef2ff] text-[0.95rem] truncate">
            {pageLabel}
          </span>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-block text-[0.7rem] font-mono px-2.5 py-0.5 rounded-md bg-[rgba(124,92,252,0.12)] text-[#a78bfa] border border-[rgba(124,92,252,0.25)]">
              ADMIN
            </span>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">
              {initials}
            </div>

            <span className="hidden sm:inline text-[#c8cde8] text-sm">
              {adminUser?.name?.split(" ")[0] || "Admin"}
            </span>

            <button
              onClick={handleLogout}
              className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#f87171] rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-[0.8rem] cursor-pointer font-['DM_Sans',sans-serif] whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;