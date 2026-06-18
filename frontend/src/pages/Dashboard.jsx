import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:    { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  processing: { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa", border: "rgba(96,165,250,0.25)" },
  shipped:    { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  delivered:  { bg: "rgba(52,211,153,0.12)",  color: "#34d399", border: "rgba(52,211,153,0.25)" },
  cancelled:  { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.25)" },
};

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const Dashboard = () => {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?._id) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/orders/my");
      setOrders(data.orders || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: "🧾",
      gradient: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.02))",
      accent: "#60a5fa",
    },
    {
      label: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      icon: "💰",
      gradient: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.02))",
      accent: "#34d399",
    },
    {
      label: "In Progress",
      value: pendingOrders,
      icon: "🚚",
      gradient: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.02))",
      accent: "#fbbf24",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: "✅",
      gradient: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.02))",
      accent: "#a78bfa",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const addresses = [];
  const seenAddr = new Set();
  orders.forEach((order) => {
    const a = order.shippingAddress;
    if (!a) return;
    const key = `${a.address}-${a.city}-${a.zip}`;
    if (!seenAddr.has(key)) {
      seenAddr.add(key);
      addresses.push(a);
    }
  });

  const activeOrder = orders.find(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "tracking", label: "Order Tracking", icon: "🚚" },
    { id: "wishlist", label: "Wishlist", icon: "❤️" },
    { id: "addresses", label: "Addresses", icon: "📍" },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0].toUpperCase()).join("").slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── HERO SECTION (redesigned) ── */}
        <div style={{ fontFamily: "var(--font-sans)", paddingBottom: 0, marginBottom: "2rem" }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: "var(--nova-muted, #525878)", display: "flex", alignItems: "center", gap: 5, marginBottom: 18 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color: "var(--nova-text, #eef2ff)" }}>My account</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color: "var(--nova-text, #eef2ff)" }}>Dashboard</span>
          </div>

          {/* Main row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

            {/* Left — initials avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "rgba(124,92,252,0.15)",
                border: "1px solid rgba(124,92,252,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 600, color: "#a78bfa",
                flexShrink: 0, letterSpacing: 1,
              }}>
                {initials}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <h1 style={{
                    fontSize: 22, fontWeight: 700,
                    color: "var(--nova-text, #eef2ff)",
                    margin: 0, fontFamily: "'Syne', sans-serif",
                  }}>
                    Welcome back, {user?.name?.split(" ")[0] || "User"}
                  </h1>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    background: "rgba(52,211,153,0.12)",
                    color: "#34d399",
                    border: "1px solid rgba(52,211,153,0.25)",
                    fontWeight: 600, fontFamily: "monospace",
                    textTransform: "capitalize",
                  }}>
                    {user?.role || "member"}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "var(--nova-muted, #525878)", margin: 0, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {user?.email || "—"}
                  &nbsp;·&nbsp;
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {user?.createdAt
                    ? `Member since ${new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                    : "Member"}
                </p>
              </div>
            </div>

            {/* Right — stat pills + action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "6px 14px",
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 13, color: "var(--nova-muted, #525878)", whiteSpace: "nowrap",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <strong style={{ color: "var(--nova-text, #eef2ff)", fontWeight: 600 }}>{orders.length}</strong> orders
              </div>

              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "6px 14px",
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 13, color: "var(--nova-muted, #525878)", whiteSpace: "nowrap",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <strong style={{ color: "var(--nova-text, #eef2ff)", fontWeight: 600 }}>{wishlist.length}</strong> wishlist
              </div>

              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "6px 14px",
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 13, color: "var(--nova-muted, #525878)", whiteSpace: "nowrap",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <strong style={{ color: "var(--nova-text, #eef2ff)", fontWeight: 600 }}>${totalSpent.toFixed(2)}</strong> spent
              </div>

              <Link
                to="/products"
                className="nova-btn-secondary"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: 13, fontWeight: 500,
                  padding: "8px 16px", borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Shop
              </Link>

              <Link
                to="/orders"
                className="nova-btn-primary"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: 13, fontWeight: 500,
                  padding: "8px 16px", borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                My orders
              </Link>

            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: "none", borderTop: "1px solid var(--nova-border, #1e2130)", margin: "20px 0 0" }} />
        </div>
        {/* ── END HERO SECTION ── */}

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-5 border border-nova-border transition-transform hover:-translate-y-1"
              style={{ background: stat.gradient }}
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <h2 className="font-display font-bold text-2xl mb-1" style={{ color: stat.accent }}>
                {stat.value}
              </h2>
              <p className="text-sm text-nova-muted font-body">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-body whitespace-nowrap transition-all flex items-center gap-2"
              style={
                activeTab === tab.id
                  ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "#06150f", fontWeight: 600 }
                  : { background: "var(--nova-surface, #13161e)", color: "#9ca3af", border: "1px solid var(--nova-border, #1e2130)" }
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* RECENT ORDERS */}
            <div className="lg:col-span-2 nova-card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-nova-border">
                <h2 className="font-display font-bold text-xl text-nova-text">Recent Orders</h2>
                <Link to="/orders" className="text-sm text-nova-accent hover:underline font-body">View all</Link>
              </div>

              {loading ? (
                <div className="p-8 space-y-5">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-4">
                      <div className="w-14 h-14 shimmer rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 shimmer rounded" />
                        <div className="h-3 w-1/3 shimmer rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-16 text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
                    style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))" }}
                  >
                    🧾
                  </div>
                  <h3 className="font-display font-bold text-2xl text-nova-text mb-2">No orders yet</h3>
                  <p className="text-nova-muted text-sm mb-6">Your order history will show up here once you make a purchase</p>
                  <Link to="/products" className="nova-btn-primary px-6 py-3 rounded-xl inline-flex">Start Shopping</Link>
                </div>
              ) : (
                <div className="divide-y divide-nova-border/50">
                  {recentOrders.map((order) => {
                    const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                    return (
                      <Link
                        key={order._id}
                        to="/orders"
                        className="flex items-center gap-4 p-4 hover:bg-nova-surface/40 transition-colors"
                      >
                        <img
                          src={order.items?.[0]?.image || "https://via.placeholder.com/56"}
                          alt={order.items?.[0]?.title}
                          className="w-14 h-14 rounded-xl object-cover border border-nova-border flex-shrink-0"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/56"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-nova-text truncate">
                            {order.items?.[0]?.title}
                            {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                          </p>
                          <p className="text-xs text-nova-muted font-mono">
                            #{order._id?.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="font-display font-bold text-nova-text text-sm">${order.totalAmount?.toFixed(2)}</span>
                          <span style={{
                            padding: "2px 10px", borderRadius: 9999, fontSize: "0.7rem",
                            fontFamily: "monospace", background: statusStyle.bg,
                            color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                            textTransform: "capitalize",
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACCOUNT INFO */}
            <div className="nova-card p-6">
              <h2 className="font-display font-bold text-xl text-nova-text mb-6">Account Details</h2>
              <div className="flex items-center gap-3 mb-4">
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(124,92,252,0.15)",
                  border: "1px solid rgba(124,92,252,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 600, color: "#a78bfa", flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-nova-text truncate">{user?.name || "—"}</p>
                  <p className="text-xs text-nova-muted font-body truncate">{user?.email || "—"}</p>
                </div>
                <span
                  className="ml-auto px-3 py-1 rounded-full text-xs font-mono capitalize flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  {user?.role || "user"}
                </span>
              </div>
              {user?.createdAt && (
                <p className="text-xs text-nova-muted font-body">
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===================== ORDER TRACKING TAB ===================== */}
        {activeTab === "tracking" && (
          <div className="nova-card p-6 sm:p-8">
            {loading ? (
              <div className="text-center py-16 text-nova-muted">Loading...</div>
            ) : !activeOrder ? (
              <div className="text-center py-16">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.03))" }}
                >
                  🚚
                </div>
                <h3 className="font-display font-bold text-2xl text-nova-text mb-2">No active orders to track</h3>
                <p className="text-nova-muted text-sm mb-6">Once you place an order, you can track its progress here</p>
                <Link to="/products" className="nova-btn-primary px-6 py-3 rounded-xl inline-flex">Shop Now</Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-10">
                  <div>
                    <h2 className="font-display font-bold text-xl text-nova-text mb-1">
                      Order #{activeOrder._id?.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-sm text-nova-muted font-body">
                      Placed on{" "}
                      {new Date(activeOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <span className="font-display font-bold text-2xl text-nova-text">
                    ${activeOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>

                {activeOrder.status === "cancelled" ? (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl mb-8"
                    style={{ background: STATUS_COLORS.cancelled.bg, border: `1px solid ${STATUS_COLORS.cancelled.border}` }}
                  >
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="font-display font-semibold text-red-400">This order was cancelled</p>
                      <p className="text-xs text-nova-muted">Contact support if you have questions about this order.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-10">
                    <div className="relative flex items-center justify-between mb-3">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = STATUS_STEPS.indexOf(activeOrder.status);
                        const reached = idx <= currentIdx;
                        const stepStyle = STATUS_COLORS[step];
                        return (
                          <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-2 transition-all"
                              style={{
                                background: reached ? stepStyle.bg : "var(--nova-surface, #13161e)",
                                color: reached ? stepStyle.color : "#525878",
                                border: `2px solid ${reached ? stepStyle.border.replace("0.25", "0.6") : "var(--nova-border, #1e2130)"}`,
                              }}
                            >
                              {idx === 0 && "📝"}
                              {idx === 1 && "⚙️"}
                              {idx === 2 && "🚚"}
                              {idx === 3 && "📦"}
                            </div>
                            <span className="text-xs font-body capitalize text-center" style={{ color: reached ? stepStyle.color : "#525878" }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-0 right-0 h-0.5 -z-0" style={{ background: "var(--nova-border, #1e2130)" }} />
                      <div
                        className="absolute top-5 left-0 h-0.5 -z-0 transition-all"
                        style={{
                          background: "#10b981",
                          width: `${(STATUS_STEPS.indexOf(activeOrder.status) / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  <h3 className="font-display font-semibold text-nova-text mb-3">Items in this order</h3>
                  {activeOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image || "https://via.placeholder.com/56"}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover border border-nova-border flex-shrink-0"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/56"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-nova-text truncate">{item.title}</p>
                        <p className="text-xs text-nova-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-nova-text font-mono flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-nova-border">
                  <h3 className="font-display font-semibold text-nova-text mb-2">Shipping to</h3>
                  <p className="text-sm text-nova-muted font-body">
                    {activeOrder.shippingAddress?.firstName} {activeOrder.shippingAddress?.lastName}<br />
                    {activeOrder.shippingAddress?.address}, {activeOrder.shippingAddress?.city}<br />
                    {activeOrder.shippingAddress?.zip}, {activeOrder.shippingAddress?.country}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===================== WISHLIST TAB ===================== */}
        {activeTab === "wishlist" && (
          <div className="nova-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-nova-border">
              <h2 className="font-display font-bold text-xl text-nova-text">My Wishlist</h2>
              <span className="text-nova-muted text-sm font-mono">{wishlist.length} items</span>
            </div>

            {wishlist.length === 0 ? (
              <div className="p-16 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(248,113,113,0.03))" }}
                >
                  ❤️
                </div>
                <h3 className="font-display font-bold text-2xl text-nova-text mb-2">Your wishlist is empty</h3>
                <p className="text-nova-muted text-sm mb-6">Save items you love by tapping the heart icon on any product</p>
                <Link to="/products" className="nova-btn-primary px-6 py-3 rounded-xl inline-flex">Explore Products</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {wishlist.map((item) => (
                  <div key={item._id} className="nova-card p-4 flex flex-col">
                    <img
                      src={item.image || "https://via.placeholder.com/200"}
                      alt={item.title}
                      className="w-full h-36 object-cover rounded-xl border border-nova-border mb-3"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                    />
                    <h3 className="font-display font-semibold text-sm text-nova-text truncate mb-1">{item.title}</h3>
                    <p className="font-display font-bold text-nova-accent text-sm mb-3">
                      ${item.price?.toFixed?.(2) ?? item.price}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <Link to={`/products/${item._id}`} className="nova-btn-primary flex-1 text-center py-2 rounded-lg text-xs">View</Link>
                      <button onClick={() => removeFromWishlist(item._id)} className="px-3 py-2 rounded-lg text-xs hover:bg-red-500/10 transition-colors">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== ADDRESSES TAB ===================== */}
        {activeTab === "addresses" && (
          <div className="nova-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-nova-border">
              <h2 className="font-display font-bold text-xl text-nova-text">Saved Addresses</h2>
              <span className="text-nova-muted text-sm font-mono">{addresses.length} addresses</span>
            </div>

            {addresses.length === 0 ? (
              <div className="p-16 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.03))" }}
                >
                  📍
                </div>
                <h3 className="font-display font-bold text-2xl text-nova-text mb-2">No saved addresses</h3>
                <p className="text-nova-muted text-sm mb-6">Addresses you use at checkout will be saved here for next time</p>
                <Link to="/products" className="nova-btn-primary px-6 py-3 rounded-xl inline-flex">Start Shopping</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="rounded-xl p-5 border border-nova-border bg-nova-surface/40">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📍</span>
                      <h3 className="font-display font-semibold text-sm text-nova-text">
                        {addr.firstName} {addr.lastName}
                      </h3>
                    </div>
                    <p className="text-sm text-nova-muted font-body leading-relaxed">
                      {addr.address}<br />
                      {addr.city}, {addr.zip}<br />
                      {addr.country}
                    </p>
                    <p className="text-xs text-nova-muted font-mono mt-3 pt-3 border-t border-nova-border">
                      {addr.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;