import { useState } from "react";
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
    label: "Add Product", path: "/admin/add-product", // ✅ fixed
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4"/></svg>,
  },
];

const SIDEBAR_W   = 220;
const COLLAPSED_W = 64;
const TOPBAR_H    = 60;

const AdminLayout = ({ children }) => {
  const { adminUser, adminLogout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarW = collapsed ? COLLAPSED_W : SIDEBAR_W;

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const initials  = (adminUser?.name || "A")[0].toUpperCase();
  const pageLabel = NAV_ITEMS.find(i => isActive(i))?.label || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060812", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 98 }} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 99,
        width: sidebarW,
        background: "#090b13",
        borderRight: "1px solid #1a1d2e",
        display: "flex", flexDirection: "column",
        transition: "width 0.22s ease",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{
          height: TOPBAR_H, display: "flex", alignItems: "center",
          padding: "0 16px", gap: 10, flexShrink: 0,
          borderBottom: "1px solid #1a1d2e",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }}>N</span>
          </div>
          {!collapsed && (
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "#eef2ff", whiteSpace: "nowrap" }}>
              Nova<span style={{ color: "#7c5cfc" }}>Cart</span>
            </span>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
            color: "#525878", padding: 4, borderRadius: 6, display: "flex", flexShrink: 0,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <Link key={item.path} to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: 10, padding: collapsed ? "10px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10, marginBottom: 2, textDecoration: "none",
                  color: active ? "#a78bfa" : "#525878",
                  background: active ? "rgba(124,92,252,0.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(124,92,252,0.2)" : "transparent"}`,
                  fontWeight: active ? 600 : 400, fontSize: "0.875rem",
                  whiteSpace: "nowrap", transition: "all 0.15s",
                }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{
          padding: collapsed ? "12px 0" : "12px 14px",
          borderTop: "1px solid #1a1d2e",
          display: "flex", alignItems: "center",
          gap: 10, justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 12,
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#eef2ff", fontSize: "0.8rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminUser?.name || "Admin"}
              </div>
              <div style={{ color: "#525878", fontSize: "0.7rem" }}>Administrator</div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{
        marginLeft: sidebarW,
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "margin-left 0.22s ease",
      }}>

        {/* Topbar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          height: TOPBAR_H,
          background: "rgba(6,8,18,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1a1d2e",
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 12, flexShrink: 0,
        }}>
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ background: "none", border: "none", color: "#525878", cursor: "pointer", display: "none" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, color: "#eef2ff", fontSize: "0.95rem" }}>
            {pageLabel}
          </span>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontSize: "0.7rem", fontFamily: "monospace", padding: "2px 9px",
              borderRadius: 6, background: "rgba(124,92,252,0.12)",
              color: "#a78bfa", border: "1px solid rgba(124,92,252,0.25)",
            }}>ADMIN</span>

            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 13,
            }}>{initials}</div>

            <span style={{ color: "#c8cde8", fontSize: "0.875rem" }}>
              {adminUser?.name?.split(" ")[0] || "Admin"}
            </span>

            <button onClick={handleLogout} style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", borderRadius: 8, padding: "5px 14px",
              fontSize: "0.8rem", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            }}>
              Logout
            </button>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;