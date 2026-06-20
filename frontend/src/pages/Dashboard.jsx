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

/* ── Shared card surface, matching AdminDashboard's gradient language ── */
const cardBase =
  "bg-gradient-to-br from-[#0f1219] to-[#080a10] border border-[#1a1d2e] rounded-2xl overflow-hidden";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gradient-to-br from-[#0f1219] to-[#080a10] border border-[#1a1d2e] rounded-2xl p-4 sm:p-5 transition-transform hover:-translate-y-1">
    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
    <div
      className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl mb-1"
      style={{ color }}
    >
      {value}
    </div>
    <div className="text-[#525878] text-xs sm:text-sm">{label}</div>
  </div>
);

const SectionHeader = ({ title, count, countLabel = "items", action }) => (
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1a1d2e] gap-3">
    <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg text-[#eef2ff]">
      {title}
    </h2>
    <div className="flex items-center gap-3 flex-shrink-0">
      {count !== undefined && (
        <span className="text-[#525878] text-xs font-mono whitespace-nowrap">
          {count} {countLabel}
        </span>
      )}
      {action}
    </div>
  </div>
);

const EmptyState = ({ icon, title, description, ctaLabel, ctaTo }) => (
  <div className="text-center py-12 sm:py-16 px-4">
    <div
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4 sm:mb-5"
      style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.15), rgba(124,92,252,0.03))" }}
    >
      {icon}
    </div>
    <h3 className="font-['Syne',sans-serif] font-bold text-lg sm:text-2xl text-[#eef2ff] mb-2">{title}</h3>
    <p className="text-[#525878] text-sm mb-6 max-w-xs mx-auto">{description}</p>
    {ctaLabel && ctaTo && (
      <Link to={ctaTo} className="nova-btn-primary px-6 py-3 rounded-xl inline-flex text-sm">
        {ctaLabel}
      </Link>
    )}
  </div>
);

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
    { label: "Total Orders", value: orders.length, icon: "🧾", color: "#60a5fa" },
    { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: "💰", color: "#34d399" },
    { label: "In Progress", value: pendingOrders, icon: "🚚", color: "#fbbf24" },
    { label: "Delivered", value: deliveredOrders, icon: "✅", color: "#a78bfa" },
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
    <div className="min-h-screen bg-[#060812] pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* ── HEADER — mirrors AdminDashboard's icon + title + subtitle pattern ── */}
        <div className="mb-6 sm:mb-10 flex items-start sm:items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Syne',sans-serif] font-bold text-xl sm:text-3xl text-[#eef2ff] truncate">
                  Welcome back, {user?.name?.split(" ")[0] || "User"}
                </h1>
                <span className="text-[0.65rem] sm:text-[0.7rem] font-mono px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34d399] border border-[rgba(52,211,153,0.25)] capitalize flex-shrink-0">
                  {user?.role || "member"}
                </span>
              </div>
              <p className="text-[#525878] text-xs sm:text-sm truncate">
                {user?.email || "—"}
                {user?.createdAt && (
                  <>
                    {" "}·{" "}
                    <span className="hidden xs:inline">
                      Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              to="/products"
              className="nova-btn-secondary px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              Shop
            </Link>
            <Link
              to="/orders"
              className="nova-btn-primary px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              My Orders
            </Link>
          </div>
        </div>

        {/* ── STATS GRID — same rhythm as AdminDashboard ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-9">
          {stats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-['DM_Sans',sans-serif] whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
              style={
                activeTab === tab.id
                  ? { background: "linear-gradient(135deg, #7c5cfc, #3b82f6)", color: "#fff", fontWeight: 600 }
                  : { background: "#0d0f1a", color: "#9ca3af", border: "1px solid #1a1d2e" }
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

            {/* RECENT ORDERS */}
            <div className={`lg:col-span-2 ${cardBase}`}>
              <SectionHeader
                title="Recent Orders"
                action={
                  <Link to="/orders" className="text-xs sm:text-sm text-[#a78bfa] hover:underline font-['DM_Sans',sans-serif] whitespace-nowrap">
                    View all
                  </Link>
                }
              />

              {loading ? (
                <div className="p-5 sm:p-8 space-y-5">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 shimmer rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 shimmer rounded" />
                        <div className="h-3 w-1/3 shimmer rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  icon="🧾"
                  title="No orders yet"
                  description="Your order history will show up here once you make a purchase"
                  ctaLabel="Start Shopping"
                  ctaTo="/products"
                />
              ) : (
                <div className="divide-y divide-[#1a1d2e]">
                  {recentOrders.map((order) => {
                    const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                    return (
                      <Link
                        key={order._id}
                        to="/orders"
                        className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <img
                          src={order.items?.[0]?.image || "https://via.placeholder.com/56"}
                          alt={order.items?.[0]?.title}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#1a1d2e] flex-shrink-0"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/56"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#eef2ff] truncate">
                            {order.items?.[0]?.title}
                            {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                          </p>
                          <p className="text-xs text-[#525878] font-mono">
                            #{order._id?.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="font-['Syne',sans-serif] font-bold text-[#eef2ff] text-sm">
                            ${order.totalAmount?.toFixed(2)}
                          </span>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[0.68rem] sm:text-[0.7rem] font-mono capitalize"
                            style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                          >
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
            <div className={`${cardBase} p-5 sm:p-6`}>
              <h2 className="font-['Syne',sans-serif] font-bold text-lg sm:text-xl text-[#eef2ff] mb-5 sm:mb-6">
                Account Details
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#eef2ff] truncate">{user?.name || "—"}</p>
                  <p className="text-xs text-[#525878] truncate">{user?.email || "—"}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono capitalize flex-shrink-0 bg-[rgba(52,211,153,0.12)] text-[#34d399] border border-[rgba(52,211,153,0.25)]">
                  {user?.role || "user"}
                </span>
              </div>
              {user?.createdAt && (
                <p className="text-xs text-[#525878]">
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===================== ORDER TRACKING TAB ===================== */}
        {activeTab === "tracking" && (
          <div className={`${cardBase} p-5 sm:p-8`}>
            {loading ? (
              <div className="text-center py-16 text-[#525878]">Loading...</div>
            ) : !activeOrder ? (
              <EmptyState
                icon="🚚"
                title="No active orders to track"
                description="Once you place an order, you can track its progress here"
                ctaLabel="Shop Now"
                ctaTo="/products"
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 sm:mb-10">
                  <div>
                    <h2 className="font-['Syne',sans-serif] font-bold text-lg sm:text-xl text-[#eef2ff] mb-1">
                      Order #{activeOrder._id?.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-sm text-[#525878]">
                      Placed on{" "}
                      {new Date(activeOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <span className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-[#eef2ff]">
                    ${activeOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>

                {activeOrder.status === "cancelled" ? (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl mb-8"
                    style={{ background: STATUS_COLORS.cancelled.bg, border: `1px solid ${STATUS_COLORS.cancelled.border}` }}
                  >
                    <span className="text-2xl flex-shrink-0">❌</span>
                    <div>
                      <p className="font-['Syne',sans-serif] font-semibold text-red-400 text-sm sm:text-base">
                        This order was cancelled
                      </p>
                      <p className="text-xs text-[#525878]">Contact support if you have questions about this order.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 sm:mb-10 overflow-x-auto">
                    <div className="relative flex items-center justify-between mb-3 min-w-[420px] sm:min-w-0">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = STATUS_STEPS.indexOf(activeOrder.status);
                        const reached = idx <= currentIdx;
                        const stepStyle = STATUS_COLORS[step];
                        return (
                          <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                            <div
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-bold mb-2 transition-all"
                              style={{
                                background: reached ? stepStyle.bg : "#13161e",
                                color: reached ? stepStyle.color : "#525878",
                                border: `2px solid ${reached ? stepStyle.border.replace("0.25", "0.6") : "#1e2130"}`,
                              }}
                            >
                              {idx === 0 && "📝"}
                              {idx === 1 && "⚙️"}
                              {idx === 2 && "🚚"}
                              {idx === 3 && "📦"}
                            </div>
                            <span
                              className="text-[0.68rem] sm:text-xs capitalize text-center"
                              style={{ color: reached ? stepStyle.color : "#525878" }}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                      <div className="absolute top-[18px] sm:top-5 left-0 right-0 h-0.5 -z-0 bg-[#1e2130]" />
                      <div
                        className="absolute top-[18px] sm:top-5 left-0 h-0.5 -z-0 transition-all bg-[#10b981]"
                        style={{
                          width: `${(STATUS_STEPS.indexOf(activeOrder.status) / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  <h3 className="font-['Syne',sans-serif] font-semibold text-[#eef2ff] mb-3 text-sm sm:text-base">
                    Items in this order
                  </h3>
                  {activeOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image || "https://via.placeholder.com/56"}
                        alt={item.title}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#1a1d2e] flex-shrink-0"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/56"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#eef2ff] truncate">{item.title}</p>
                        <p className="text-xs text-[#525878]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-[#eef2ff] font-mono flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#1a1d2e]">
                  <h3 className="font-['Syne',sans-serif] font-semibold text-[#eef2ff] mb-2 text-sm sm:text-base">
                    Shipping to
                  </h3>
                  <p className="text-sm text-[#525878] leading-relaxed">
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
          <div className={cardBase}>
            <SectionHeader title="My Wishlist" count={wishlist.length} />

            {wishlist.length === 0 ? (
              <EmptyState
                icon="❤️"
                title="Your wishlist is empty"
                description="Save items you love by tapping the heart icon on any product"
                ctaLabel="Explore Products"
                ctaTo="/products"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6">
                {wishlist.map((item) => (
                  <div key={item._id} className="bg-[#0c0e16] border border-[#1a1d2e] rounded-2xl p-3 sm:p-4 flex flex-col">
                    <img
                      src={item.image || "https://via.placeholder.com/200"}
                      alt={item.title}
                      className="w-full h-28 sm:h-36 object-cover rounded-xl border border-[#1a1d2e] mb-3"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                    />
                    <h3 className="font-['Syne',sans-serif] font-semibold text-xs sm:text-sm text-[#eef2ff] truncate mb-1">
                      {item.title}
                    </h3>
                    <p className="font-['Syne',sans-serif] font-bold text-[#7c5cfc] text-sm mb-3">
                      ${item.price?.toFixed?.(2) ?? item.price}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <Link to={`/products/${item._id}`} className="nova-btn-primary flex-1 text-center py-2 rounded-lg text-xs">
                        View
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="px-2.5 sm:px-3 py-2 rounded-lg text-xs hover:bg-red-500/10 transition-colors flex-shrink-0"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== ADDRESSES TAB ===================== */}
        {activeTab === "addresses" && (
          <div className={cardBase}>
            <SectionHeader title="Saved Addresses" count={addresses.length} countLabel="addresses" />

            {addresses.length === 0 ? (
              <EmptyState
                icon="📍"
                title="No saved addresses"
                description="Addresses you use at checkout will be saved here for next time"
                ctaLabel="Start Shopping"
                ctaTo="/products"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="rounded-xl p-4 sm:p-5 border border-[#1a1d2e] bg-[#0c0e16]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg flex-shrink-0">📍</span>
                      <h3 className="font-['Syne',sans-serif] font-semibold text-sm text-[#eef2ff] truncate">
                        {addr.firstName} {addr.lastName}
                      </h3>
                    </div>
                    <p className="text-sm text-[#525878] leading-relaxed">
                      {addr.address}<br />
                      {addr.city}, {addr.zip}<br />
                      {addr.country}
                    </p>
                    <p className="text-xs text-[#525878] font-mono mt-3 pt-3 border-t border-[#1a1d2e] truncate">
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