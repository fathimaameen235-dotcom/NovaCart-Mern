import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gradient-to-br from-[#0f1219] to-[#080a10] border border-[#1a1d2e] rounded-2xl p-4 sm:p-5">
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

const SectionHeader = ({ title, count }) => (
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1a1d2e]">
    <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg text-[#eef2ff]">
      {title}
    </h2>
    <span className="text-[#525878] text-xs font-mono">{count} items</span>
  </div>
);

/* Generic empty-state row used inside both table and card views */
const EmptyState = ({ label }) => (
  <div className="text-center py-10 text-[#525878] text-sm">{label}</div>
);

const AdminDashboard = () => {
  const { adminUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUser) {
      navigate("/admin/login");
      return;
    }

    if (adminUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchAdminData();
  }, [adminUser, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const { data: pData } = await API.get("/products");
      setProducts(Array.isArray(pData) ? pData : (pData.products || []));

      const { data: uData } = await API.get("/auth/users");
      setUsers(Array.isArray(uData) ? uData : (uData.users || []));

      const { data: rData } = await API.get("/reviews/all");
      setReviews(Array.isArray(rData) ? rData : (rData.reviews || []));

      const { data: oData } = await API.get("/orders/all");
      setOrders(Array.isArray(oData) ? oData : (oData.orders || []));
    } catch (err) {
      console.error("Admin data fetch:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardBase =
    "bg-gradient-to-br from-[#0f1219] to-[#080a10] border border-[#1a1d2e] rounded-2xl overflow-hidden";

  const th =
    "text-left px-4 py-3 text-[0.7rem] uppercase tracking-wider text-[#525878] font-mono border-b border-[#1a1d2e] whitespace-nowrap";
  const td =
    "px-4 py-3 text-sm text-[#c7d2fe] border-b border-[rgba(26,29,46,0.5)]";

  const rowHover =
    "hover:bg-white/[0.02] transition-colors";

  /* Mobile card row style helper */
  const mCard = "bg-[#0c0e16] border border-[#1a1d2e] rounded-xl p-4 flex flex-col gap-2";

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#060812] pt-6 sm:pt-8 pb-12 sm:pb-16 px-3 sm:px-6">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                🛡️
              </div>
              <div>
                <h1 className="font-['Syne',sans-serif] font-bold text-xl sm:text-3xl text-[#eef2ff]">
                  Admin Dashboard
                </h1>
                <p className="text-[#525878] text-xs sm:text-sm">
                  Global overview — all users, orders &amp; reviews
                </p>
              </div>
            </div>

            <Link
              to="/admin/add-product"
              className="nova-btn-primary px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-9">
            <StatCard icon="👥" label="Total Users" value={users.length} color="#60a5fa" />
            <StatCard icon="📦" label="Total Products" value={products.length} color="#a78bfa" />
            <StatCard icon="🛒" label="Total Orders" value={orders.length} color="#34d399" />
            <StatCard icon="⭐" label="Total Reviews" value={reviews.length} color="#fbbf24" />
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#525878]">Loading admin data…</div>
          ) : (
            <div className="flex flex-col gap-6 sm:gap-7">

              {/* ── Users ── */}
              <div className={cardBase}>
                <SectionHeader title="All Users" count={users.length} />

                {/* Desktop / tablet table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>Name</th>
                        <th className={th}>Email</th>
                        <th className={th}>Role</th>
                        <th className={th}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={4} className={`${td} text-center text-[#525878]`}>No users found</td></tr>
                      ) : users.map((u) => (
                        <tr key={u._id} className={rowHover}>
                          <td className={td}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                                {(u.name || "U")[0].toUpperCase()}
                              </div>
                              <span className="text-[#eef2ff] font-medium">{u.name || "—"}</span>
                            </div>
                          </td>
                          <td className={td}>{u.email}</td>
                          <td className={td}>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[0.7rem] font-mono border"
                              style={{
                                background: u.role === "admin" ? "rgba(124,92,252,0.15)" : "rgba(52,211,153,0.12)",
                                color: u.role === "admin" ? "#a78bfa" : "#34d399",
                                borderColor: u.role === "admin" ? "rgba(124,92,252,0.25)" : "rgba(52,211,153,0.2)",
                              }}
                            >
                              {u.role || "user"}
                            </span>
                          </td>
                          <td className={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden flex flex-col gap-2 p-3">
                  {users.length === 0 ? (
                    <EmptyState label="No users found" />
                  ) : users.map((u) => (
                    <div key={u._id} className={mCard}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                          {(u.name || "U")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[#eef2ff] font-medium text-sm truncate">{u.name || "—"}</div>
                          <div className="text-[#525878] text-xs truncate">{u.email}</div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-[0.65rem] font-mono border flex-shrink-0"
                          style={{
                            background: u.role === "admin" ? "rgba(124,92,252,0.15)" : "rgba(52,211,153,0.12)",
                            color: u.role === "admin" ? "#a78bfa" : "#34d399",
                            borderColor: u.role === "admin" ? "rgba(124,92,252,0.25)" : "rgba(52,211,153,0.2)",
                          }}
                        >
                          {u.role || "user"}
                        </span>
                      </div>
                      <div className="text-[#525878] text-[0.7rem] font-mono">
                        Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Products ── */}
              <div className={cardBase}>
                <SectionHeader title="All Products" count={products.length} />

                {/* Desktop / tablet table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>Product</th>
                        <th className={th}>Category</th>
                        <th className={th}>Price</th>
                        <th className={th}>Stock</th>
                        <th className={th}>Seller</th>
                        <th className={th}>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={6} className={`${td} text-center text-[#525878]`}>No products found</td></tr>
                      ) : products.map((p) => (
                        <tr key={p._id} className={rowHover}>
                          <td className={td}>
                            <div className="flex items-center gap-2.5">
                              <img
                                src={(Array.isArray(p.images) && p.images[0]) || p.image || "https://via.placeholder.com/48"}
                                alt={p.title}
                                className="w-11 h-11 rounded-lg object-cover border border-[#1a1d2e] flex-shrink-0"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/48"; }}
                              />
                              <span className="text-[#eef2ff] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                {p.title}
                              </span>
                            </div>
                          </td>
                          <td className={td}>
                            <span className="px-2.5 py-0.5 rounded-full text-[0.7rem] bg-[#13161f] border border-[#1a1d2e] text-[#525878]">
                              {p.category}
                            </span>
                          </td>
                          <td className={`${td} text-[#eef2ff] font-semibold`}>${p.price?.toFixed(2)}</td>
                          <td className={td} style={{ color: p.stock > 10 ? "#34d399" : p.stock > 0 ? "#fbbf24" : "#f87171" }}>
                            {p.stock}
                          </td>
                          <td className={td}>{p.createdBy?.name || p.createdBy?.email || "—"}</td>
                          <td className={`${td} text-[#fbbf24]`}>★ {p.averageRating || "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden flex flex-col gap-2 p-3">
                  {products.length === 0 ? (
                    <EmptyState label="No products found" />
                  ) : products.map((p) => (
                    <div key={p._id} className={mCard}>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={(Array.isArray(p.images) && p.images[0]) || p.image || "https://via.placeholder.com/48"}
                          alt={p.title}
                          className="w-12 h-12 rounded-lg object-cover border border-[#1a1d2e] flex-shrink-0"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/48"; }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[#eef2ff] text-sm truncate">{p.title}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[0.65rem] bg-[#13161f] border border-[#1a1d2e] text-[#525878]">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1a1d2e]">
                        <span className="text-[#eef2ff] font-semibold text-sm">${p.price?.toFixed(2)}</span>
                        <span style={{ color: p.stock > 10 ? "#34d399" : p.stock > 0 ? "#fbbf24" : "#f87171" }}>
                          Stock: {p.stock}
                        </span>
                        <span className="text-[#fbbf24]">★ {p.averageRating || "0"}</span>
                      </div>
                      <div className="text-[#525878] text-[0.7rem] truncate">
                        Seller: {p.createdBy?.name || p.createdBy?.email || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Reviews ── */}
              <div className={cardBase}>
                <SectionHeader title="All Reviews" count={reviews.length} />

                {/* Desktop / tablet table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>User</th>
                        <th className={th}>Product</th>
                        <th className={th}>Rating</th>
                        <th className={th}>Comment</th>
                        <th className={th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.length === 0 ? (
                        <tr><td colSpan={5} className={`${td} text-center text-[#525878]`}>No reviews found</td></tr>
                      ) : reviews.map((r) => (
                        <tr key={r._id} className={rowHover}>
                          <td className={td}>{r.userId?.name || "Anonymous"}</td>
                          <td className={td}>{r.productId?.title || r.productId || "—"}</td>
                          <td className={`${td} text-[#fbbf24]`}>{"★".repeat(r.rating || 0)}</td>
                          <td className={`${td} max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap`}>{r.comment}</td>
                          <td className={td}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden flex flex-col gap-2 p-3">
                  {reviews.length === 0 ? (
                    <EmptyState label="No reviews found" />
                  ) : reviews.map((r) => (
                    <div key={r._id} className={mCard}>
                      <div className="flex items-center justify-between">
                        <span className="text-[#eef2ff] text-sm font-medium">{r.userId?.name || "Anonymous"}</span>
                        <span className="text-[#fbbf24] text-sm">{"★".repeat(r.rating || 0)}</span>
                      </div>
                      <div className="text-[#525878] text-xs truncate">
                        Product: {r.productId?.title || r.productId || "—"}
                      </div>
                      <p className="text-[#c7d2fe] text-xs leading-relaxed line-clamp-3">{r.comment}</p>
                      <div className="text-[#525878] text-[0.7rem]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Orders ── */}
              <div className={cardBase}>
                <SectionHeader title="All Orders" count={orders.length} />

                {/* Desktop / tablet table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>Order ID</th>
                        <th className={th}>Buyer</th>
                        <th className={th}>Items</th>
                        <th className={th}>Total</th>
                        <th className={th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={5} className={`${td} text-center text-[#525878]`}>No orders found</td></tr>
                      ) : orders.map((o) => (
                        <tr key={o._id} className={rowHover}>
                          <td className={`${td} font-mono text-xs`}>{o._id?.slice(-8)}</td>
                          <td className={td}>{o.user?.name || o.user?.email || "—"}</td>
                          <td className={td}>{o.items?.length || 1} item(s)</td>
                          <td className={`${td} text-[#34d399] font-semibold`}>${(o.total || o.totalAmount || 0).toFixed(2)}</td>
                          <td className={td}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden flex flex-col gap-2 p-3">
                  {orders.length === 0 ? (
                    <EmptyState label="No orders found" />
                  ) : orders.map((o) => (
                    <div key={o._id} className={mCard}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#525878]">#{o._id?.slice(-8)}</span>
                        <span className="text-[#34d399] font-semibold text-sm">
                          ${(o.total || o.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[#eef2ff] text-sm truncate">
                        {o.user?.name || o.user?.email || "—"}
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#525878]">
                        <span>{o.items?.length || 1} item(s)</span>
                        <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;