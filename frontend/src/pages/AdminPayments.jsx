import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  success: { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", border: "rgba(34,197,94,0.3)" },
  pending: { bg: "rgba(234,179,8,0.12)",  text: "#facc15", border: "rgba(234,179,8,0.3)" },
  failed:  { bg: "rgba(239,68,68,0.12)",  text: "#f87171", border: "rgba(239,68,68,0.3)" },
};

const METHOD_LABELS = { card: "Card", upi: "UPI", netbanking: "Net Banking", cod: "COD" };

const s = {
  page:      { minHeight: "100vh", background: "#060812", padding: "24px 14px 40px", fontFamily: "'DM Sans',sans-serif" },
  container: { maxWidth: 1200, margin: "0 auto" },
  heading:   { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#eef2ff", marginBottom: 4 },
  sub:       { color: "#525878", fontSize: "0.875rem", marginBottom: 24 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 },
  card:      { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, padding: "16px" },
  tableWrap: { width: "100%", overflowX: "auto", borderRadius: 16, border: "1px solid #1a1d2e", WebkitOverflowScrolling: "touch" },
  table:     { width: "100%", minWidth: 760, borderCollapse: "collapse", background: "linear-gradient(145deg,#0d0f1a,#080a10)" },
  th:        { padding: "14px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#525878", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1a1d2e", background: "#0a0c14", whiteSpace: "nowrap" },
  td:        { padding: "14px 16px", fontSize: "0.875rem", color: "#c8cde8", borderBottom: "1px solid #0f1120" },
  badge:     (st) => ({
    display: "inline-flex", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600,
    background: STATUS_COLORS[st]?.bg || "#1a1d2e",
    color: STATUS_COLORS[st]?.text || "#c8cde8",
    border: `1px solid ${STATUS_COLORS[st]?.border || "#1a1d2e"}`,
    whiteSpace: "nowrap",
  }),
  filterRow: { display: "flex", gap: 8, marginBottom: 0, flexWrap: "wrap" },
  filterBtn: (active) => ({
    padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
    border: active ? "1px solid #7c5cfc" : "1px solid #1a1d2e",
    background: active ? "rgba(124,92,252,0.15)" : "#0d0f1a",
    color: active ? "#a78bfa" : "#525878",
    whiteSpace: "nowrap",
  }),
  empty:     { textAlign: "center", padding: "64px 0", color: "#525878" },
  input:     { background: "#0d0f1a", border: "1px solid #1a1d2e", color: "#eef2ff", borderRadius: 10, padding: "10px 16px", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box" },
};

const AdminPayments = () => {
  // Payments are derived from orders since the payment endpoint may just mirror orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Try payments endpoint first, fall back to orders
      try {
        const { data } = await API.get("/payments/all");
        const payments = Array.isArray(data) ? data : (data.payments || []);
        if (payments.length) { setOrders(payments); return; }
      } catch (_) {}

      const { data } = await API.get("/orders/all");
      const raw = Array.isArray(data) ? data : (data.orders || []);
      // Map orders into payment records
      setOrders(raw.map(o => ({
        _id: o._id,
        transactionId: `TXN${o._id.slice(-10).toUpperCase()}`,
        user: o.user,
        amount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        status: o.status === "cancelled" ? "failed" : o.status === "pending" ? "pending" : "success",
        orderId: o._id,
        createdAt: o.createdAt,
      })));
    } catch (err) {
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue    = orders.filter(p => p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);
  const pendingAmount   = orders.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
  const failedCount     = orders.filter(p => p.status === "failed").length;
  const successRate     = orders.length ? ((orders.filter(p => p.status === "success").length / orders.length) * 100).toFixed(1) : 0;

  const methodCounts = orders.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
    return acc;
  }, {});
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const filtered = orders.filter(p => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    const matchSearch = !search ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchMethod && matchSearch;
  });

  return (
    <AdminLayout>
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.heading}>Payment Management</h1>
        <p style={s.sub}>{orders.length} total payment records</p>

        {/* KPI cards */}
        <div style={s.statsGrid}>
          {[
            { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, color: "#4ade80" },
            { label: "Pending Amount", value: `₹${pendingAmount.toFixed(2)}`, color: "#facc15" },
            { label: "Failed Payments", value: failedCount, color: "#f87171" },
            { label: "Success Rate", value: `${successRate}%`, color: "#a78bfa" },
            { label: "Top Method", value: (METHOD_LABELS[topMethod] || topMethod).toUpperCase(), color: "#60a5fa" },
          ].map(({ label, value, color }) => (
            <div key={label} style={s.card}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem", color, marginBottom: 4, wordBreak: "break-word" }}>{value}</div>
              <div style={{ color: "#525878", fontSize: "0.8rem" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <input
            style={s.input}
            placeholder="Search transaction ID or user…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ ...s.filterRow, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
            {["all","success","pending","failed"].map(st => (
              <button key={st} style={s.filterBtn(statusFilter === st)} onClick={() => setStatusFilter(st)}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ ...s.filterRow, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
            {["all","card","upi","netbanking","cod"].map(m => (
              <button key={m} style={s.filterBtn(methodFilter === m)} onClick={() => setMethodFilter(m)}>
                {m === "all" ? "All Methods" : METHOD_LABELS[m] || m}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={s.empty}>Loading payments…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No payments match filters.</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Transaction ID", "Customer", "Amount", "Method", "Status", "Date"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <tr key={payment._id}>
                    <td style={s.td}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#7c5cfc" }}>
                        {payment.transactionId || `TXN${payment._id.slice(-10).toUpperCase()}`}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ color: "#eef2ff", fontWeight: 500 }}>{payment.user?.name || "—"}</div>
                      <div style={{ color: "#525878", fontSize: "0.75rem" }}>{payment.user?.email || ""}</div>
                    </td>
                    <td style={{ ...s.td }}>
                      <span style={{ color: "#a78bfa", fontWeight: 600 }}>₹{payment.amount?.toFixed(2)}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ background: "#13151f", border: "1px solid #1a1d2e", borderRadius: 6, padding: "3px 8px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                        {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                      </span>
                    </td>
                    <td style={s.td}><span style={s.badge(payment.status)}>{payment.status}</span></td>
                    <td style={{ ...s.td, color: "#525878", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      <div>{new Date(payment.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminPayments;