import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:    { bg: "rgba(234,179,8,0.12)",   text: "#facc15", border: "rgba(234,179,8,0.3)" },
  processing: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  shipped:    { bg: "rgba(168,85,247,0.12)",  text: "#c084fc", border: "rgba(168,85,247,0.3)" },
  delivered:  { bg: "rgba(34,197,94,0.12)",   text: "#4ade80", border: "rgba(34,197,94,0.3)" },
  cancelled:  { bg: "rgba(239,68,68,0.12)",   text: "#f87171", border: "rgba(239,68,68,0.3)" },
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const s = {
  page:       { minHeight: "100vh", background: "#060812", padding: "32px 24px 40px", fontFamily: "'DM Sans',sans-serif" },
  container:  { maxWidth: 1200, margin: "0 auto" },
  heading:    { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#eef2ff", marginBottom: 4 },
  sub:        { color: "#525878", fontSize: "0.875rem", marginBottom: 32 },
  filterRow:  { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  filterBtn:  (active) => ({
    padding: "6px 16px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
    border: active ? "1px solid #7c5cfc" : "1px solid #1a1d2e",
    background: active ? "rgba(124,92,252,0.15)" : "#0d0f1a",
    color: active ? "#a78bfa" : "#525878", transition: "all 0.2s",
  }),
  table:      { width: "100%", borderCollapse: "collapse", background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, overflow: "hidden" },
  th:         { padding: "14px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#525878", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1a1d2e", background: "#0a0c14" },
  td:         { padding: "14px 16px", fontSize: "0.875rem", color: "#c8cde8", borderBottom: "1px solid #0f1120" },
  badge:      (status) => ({
    display: "inline-flex", padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600,
    background: STATUS_COLORS[status]?.bg || "#1a1d2e",
    color: STATUS_COLORS[status]?.text || "#c8cde8",
    border: `1px solid ${STATUS_COLORS[status]?.border || "#1a1d2e"}`,
  }),
  select:     { background: "#0f1120", border: "1px solid #1a1d2e", color: "#c8cde8", borderRadius: 6, padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer" },
  modal:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24 },
  modalBox:   { background: "#0d0f1a", border: "1px solid #1a1d2e", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: 28 },
  closeBtn:   { background: "none", border: "none", color: "#525878", fontSize: "1.25rem", cursor: "pointer", float: "right" },
  label:      { color: "#525878", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  value:      { color: "#eef2ff", fontSize: "0.875rem", marginBottom: 16 },
  itemRow:    { display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1d2e" },
  itemImg:    { width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: "#1a1d2e" },
  empty:      { textAlign: "center", padding: "64px 0", color: "#525878" },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/orders/all");
      setOrders(Array.isArray(data) ? data : (data.orders || []));
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <AdminLayout>
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.heading}>Order Management</h1>
        <p style={s.sub}>{orders.length} total orders</p>

        {/* Filter tabs */}
        <div style={s.filterRow}>
          <button style={s.filterBtn(filter === "all")} onClick={() => setFilter("all")}>
            All ({orders.length})
          </button>
          {STATUSES.map(st => (
            <button key={st} style={s.filterBtn(filter === st)} onClick={() => setFilter(st)}>
              {st.charAt(0).toUpperCase() + st.slice(1)} ({counts[st] || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.empty}>Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No orders found.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order._id} style={{ cursor: "pointer" }}>
                  <td style={s.td}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#7c5cfc" }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ color: "#eef2ff", fontWeight: 500 }}>{order.user?.name || "—"}</div>
                    <div style={{ color: "#525878", fontSize: "0.75rem" }}>{order.user?.email || ""}</div>
                  </td>
                  <td style={s.td}>{order.items?.length || 0} items</td>
                  <td style={s.td}>
                    <span style={{ color: "#a78bfa", fontWeight: 600 }}>
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ textTransform: "capitalize", color: "#c8cde8" }}>{order.paymentMethod}</span>
                  </td>
                  <td style={s.td}><span style={s.badge(order.status)}>{order.status}</span></td>
                  <td style={s.td} style={{ ...s.td, color: "#525878", fontSize: "0.75rem" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        style={s.select}
                        value={order.status}
                        disabled={updating === order._id}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                      <button
                        onClick={() => setSelected(order)}
                        style={{ background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.25)", color: "#a78bfa", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div style={s.modal} onClick={() => setSelected(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#eef2ff", marginBottom: 20 }}>
              Order #{selected._id.slice(-8).toUpperCase()}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <div style={s.label}>Customer</div>
                <div style={s.value}>{selected.user?.name}</div>
                <div style={s.label}>Email</div>
                <div style={s.value}>{selected.user?.email}</div>
              </div>
              <div>
                <div style={s.label}>Status</div>
                <div style={{ marginBottom: 16 }}>
                  <select
                    style={{ ...s.select, width: "100%", padding: "6px 10px" }}
                    value={selected.status}
                    onChange={e => handleStatusChange(selected._id, e.target.value)}
                  >
                    {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div style={s.label}>Payment Method</div>
                <div style={s.value} style={{ ...s.value, textTransform: "capitalize" }}>{selected.paymentMethod}</div>
              </div>
            </div>

            <div style={s.label}>Shipping Address</div>
            <div style={{ ...s.value, background: "#0a0c14", borderRadius: 8, padding: 12 }}>
              {selected.shippingAddress?.firstName} {selected.shippingAddress?.lastName}<br />
              {selected.shippingAddress?.address}<br />
              {selected.shippingAddress?.city}, {selected.shippingAddress?.zip}<br />
              {selected.shippingAddress?.country}
            </div>

            <div style={s.label}>Items</div>
            <div style={{ marginBottom: 16 }}>
              {selected.items?.map((item, i) => (
                <div key={i} style={s.itemRow}>
                  {item.image && <img src={item.image} alt={item.title} style={s.itemImg} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#eef2ff", fontSize: "0.875rem" }}>{item.title}</div>
                    <div style={{ color: "#525878", fontSize: "0.75rem" }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ color: "#a78bfa", fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #1a1d2e" }}>
              <span style={{ color: "#525878" }}>Total</span>
              <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "1.1rem" }}>₹{selected.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminOrders;