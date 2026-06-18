import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: "linear-gradient(145deg,#0f1219,#080a10)",
    border: "1px solid #1a1d2e",
    borderRadius: 16,
    padding: "24px 20px",
  }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color, marginBottom: 4 }}>
      {value}
    </div>
    <div style={{ color: "#525878", fontSize: "0.875rem" }}>{label}</div>
  </div>
);

const SectionHeader = ({ title, count }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px", borderBottom: "1px solid #1a1d2e",
  }}>
    <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#eef2ff" }}>
      {title}
    </h2>
    <span style={{ color: "#525878", fontSize: "0.8rem", fontFamily: "monospace" }}>{count} items</span>
  </div>
);

const AdminDashboard = () => {
  const { adminUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]     = useState([]);
  const [orders, setOrders]   = useState([]);
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
      // Fetch all products (public endpoint)
      const { data: pData } = await API.get("/products");
      setProducts(Array.isArray(pData) ? pData : (pData.products || []));

      // Fetch all users
      const { data: uData } = await API.get("/auth/users");
      setUsers(Array.isArray(uData) ? uData : (uData.users || []));

      // Fetch all reviews
      const { data: rData } = await API.get("/reviews/all");
      setReviews(Array.isArray(rData) ? rData : (rData.reviews || []));

      // Fetch all orders
     const { data: oData } = await API.get("/orders/all");
      setOrders(Array.isArray(oData) ? oData : (oData.orders || []));
    } catch (err) {
      // Silently handle missing endpoints — show what we have
      console.error("Admin data fetch:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardBase = {
    background: "linear-gradient(145deg,#0f1219,#080a10)",
    border: "1px solid #1a1d2e",
    borderRadius: 16,
    overflow: "hidden",
  };

  const th = {
    textAlign: "left", padding: "12px 16px",
    fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em",
    color: "#525878", fontFamily: "monospace", borderBottom: "1px solid #1a1d2e",
  };
  const td = {
    padding: "12px 16px", fontSize: "0.875rem", color: "#c7d2fe",
    borderBottom: "1px solid rgba(26,29,46,0.5)",
  };

  return (
    <AdminLayout>
    <div style={{ minHeight: "100vh", background: "#060812", paddingTop: 32, paddingBottom: 64, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🛡️</div>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#eef2ff" }}>
                Admin Dashboard
              </h1>
              <p style={{ color: "#525878", fontSize: "0.8rem" }}>Global overview — all users, orders &amp; reviews</p>
            </div>
          </div>

          <Link
            to="/admin/add-product"
            className="nova-btn-primary px-5 py-3 rounded-xl text-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 36 }}>
          <StatCard icon="👥" label="Total Users"    value={users.length}    color="#60a5fa" />
          <StatCard icon="📦" label="Total Products" value={products.length} color="#a78bfa" />
          <StatCard icon="🛒" label="Total Orders"   value={orders.length}   color="#34d399" />
          <StatCard icon="⭐" label="Total Reviews"  value={reviews.length}  color="#fbbf24" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#525878" }}>Loading admin data…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* ── Users Table ── */}
            <div style={cardBase}>
              <SectionHeader title="All Users" count={users.length} />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Name</th>
                      <th style={th}>Email</th>
                      <th style={th}>Role</th>
                      <th style={th}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={4} style={{ ...td, textAlign: "center", color: "#525878" }}>No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id} style={{ transition: "background 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.75rem", color: "#fff", fontWeight: 700, flexShrink: 0,
                            }}>{(u.name || "U")[0].toUpperCase()}</div>
                            <span style={{ color: "#eef2ff", fontWeight: 500 }}>{u.name || "—"}</span>
                          </div>
                        </td>
                        <td style={td}>{u.email}</td>
                        <td style={td}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 9999, fontSize: "0.7rem", fontFamily: "monospace",
                            background: u.role === "admin" ? "rgba(124,92,252,0.15)" : "rgba(52,211,153,0.12)",
                            color:      u.role === "admin" ? "#a78bfa"              : "#34d399",
                            border: `1px solid ${u.role === "admin" ? "rgba(124,92,252,0.25)" : "rgba(52,211,153,0.2)"}`,
                          }}>{u.role || "user"}</span>
                        </td>
                        <td style={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── All Products Table ── */}
            <div style={cardBase}>
              <SectionHeader title="All Products" count={products.length} />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Product</th>
                      <th style={th}>Category</th>
                      <th style={th}>Price</th>
                      <th style={th}>Stock</th>
                      <th style={th}>Seller</th>
                      <th style={th}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#525878" }}>No products found</td></tr>
                    ) : products.map(p => (
                      <tr key={p._id}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={(Array.isArray(p.images) && p.images[0]) || p.image || "https://via.placeholder.com/48"}
                              alt={p.title}
                              style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "1px solid #1a1d2e", flexShrink: 0 }}
                              onError={e=>{ e.target.src="https://via.placeholder.com/48"; }}
                            />
                            <span style={{ color: "#eef2ff", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                          </div>
                        </td>
                        <td style={td}><span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: "0.7rem", background: "#13161f", border: "1px solid #1a1d2e", color: "#525878" }}>{p.category}</span></td>
                        <td style={{ ...td, color: "#eef2ff", fontWeight: 600 }}>${p.price?.toFixed(2)}</td>
                        <td style={{ ...td, color: p.stock > 10 ? "#34d399" : p.stock > 0 ? "#fbbf24" : "#f87171" }}>{p.stock}</td>
                        <td style={td}>{p.createdBy?.name || p.createdBy?.email || "—"}</td>
                        <td style={{ ...td, color: "#fbbf24" }}>★ {p.averageRating || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Reviews Table ── */}
            <div style={cardBase}>
              <SectionHeader title="All Reviews" count={reviews.length} />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>User</th>
                      <th style={th}>Product</th>
                      <th style={th}>Rating</th>
                      <th style={th}>Comment</th>
                      <th style={th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#525878" }}>No reviews found</td></tr>
                    ) : reviews.map(r => (
                      <tr key={r._id}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={td}>{r.userId?.name || "Anonymous"}</td>
                        <td style={td}>{r.productId?.title || r.productId || "—"}</td>
                        <td style={{ ...td, color: "#fbbf24" }}>{"★".repeat(r.rating || 0)}</td>
                        <td style={{ ...td, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.comment}</td>
                        <td style={td}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Orders Table ── */}
            <div style={cardBase}>
              <SectionHeader title="All Orders" count={orders.length} />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Order ID</th>
                      <th style={th}>Buyer</th>
                      <th style={th}>Items</th>
                      <th style={th}>Total</th>
                      <th style={th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#525878" }}>No orders found</td></tr>
                    ) : orders.map(o => (
                      <tr key={o._id}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ ...td, fontFamily: "monospace", fontSize: "0.75rem" }}>{o._id?.slice(-8)}</td>
                        <td style={td}>{o.user?.name || o.user?.email || "—"}</td>
                        <td style={td}>{o.items?.length || 1} item(s)</td>
                        <td style={{ ...td, color: "#34d399", fontWeight: 600 }}>${(o.total || o.totalAmount || 0).toFixed(2)}</td>
                        <td style={td}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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