import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import API from "../api/axios";

const COLORS = ["#7c5cfc", "#3b82f6", "#4ade80", "#facc15", "#f87171", "#c084fc"];

const s = {
  page:      { minHeight: "100vh", background: "#060812", padding: "32px 24px 40px", fontFamily: "'DM Sans',sans-serif" },
  container: { maxWidth: 1280, margin: "0 auto" },
  heading:   { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#eef2ff", marginBottom: 4 },
  sub:       { color: "#525878", fontSize: "0.875rem", marginBottom: 32 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 },
  card:      { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, padding: "22px 20px" },
  cardVal:   (color) => ({ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.9rem", color, marginBottom: 4 }),
  cardLbl:   { color: "#525878", fontSize: "0.8rem" },
  cardChange:(pos) => ({ fontSize: "0.75rem", color: pos ? "#4ade80" : "#f87171", marginTop: 4 }),
  chartGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  chartCard: { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, padding: "20px 20px 16px" },
  chartTitle:{ fontFamily: "'Syne',sans-serif", fontWeight: 600, color: "#eef2ff", fontSize: "0.95rem", marginBottom: 20 },
  fullChart: { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, padding: "20px", marginBottom: 20 },
  tooltipStyle: { background: "#0f1120", border: "1px solid #1a1d2e", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem" },
  empty:     { textAlign: "center", padding: "64px 0", color: "#525878" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#525878", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1a1d2e" },
  td:        { padding: "12px 16px", fontSize: "0.85rem", color: "#c8cde8", borderBottom: "1px solid #0f1120" },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={s.tooltipStyle}>
        <div style={{ padding: "8px 12px" }}>
          <p style={{ color: "#525878", fontSize: "0.75rem", marginBottom: 4 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontWeight: 600 }}>
              {p.name}: {p.name === "Revenue" ? `₹${p.value?.toFixed(0)}` : p.value}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const AdminAnalytics = () => {
  const [data, setData] = useState({ users: [], orders: [], products: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes, productsRes, reviewsRes] = await Promise.allSettled([
        API.get("/auth/users"),
        API.get("/orders/all"),
        API.get("/products"),
        API.get("/reviews/all"),
      ]);

      const get = (res) => {
        if (res.status !== "fulfilled") return [];
        const d = res.value.data;
        return Array.isArray(d) ? d : (d.users || d.orders || d.products || d.reviews || []);
      };

      setData({
        users:    get(usersRes),
        orders:   get(ordersRes),
        products: get(productsRes),
        reviews:  get(reviewsRes),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Derived stats ---
  const totalRevenue = data.orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const delivered    = data.orders.filter(o => o.status === "delivered").length;
  const pending      = data.orders.filter(o => o.status === "pending").length;
  const avgOrderVal  = data.orders.length ? totalRevenue / data.orders.length : 0;
  const avgRating    = data.reviews.length
    ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1)
    : "—";

  // --- Orders over time (last N days) ---
  const now = new Date();
  const dayMs = 86400000;
  const ordersByDay = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const dayOrders = data.orders.filter(o => {
      const od = new Date(o.createdAt);
      return od.toDateString() === d.toDateString();
    });
    ordersByDay.push({
      date: label,
      Orders: dayOrders.length,
      Revenue: dayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
    });
  }
  // Sparse — show every 3rd label
  const sparseOrders = ordersByDay.filter((_, i) => i % 3 === 0 || i === ordersByDay.length - 1 || ordersByDay.length <= 10);

  // --- Order status breakdown ---
  const statusData = ["pending","processing","shipped","delivered","cancelled"].map(st => ({
    name: st.charAt(0).toUpperCase() + st.slice(1),
    value: data.orders.filter(o => o.status === st).length,
  })).filter(d => d.value > 0);

  // --- Payment method breakdown ---
  const paymentData = ["card","upi","netbanking","cod"].map(pm => ({
    name: pm.toUpperCase(),
    value: data.orders.filter(o => o.paymentMethod === pm).length,
  })).filter(d => d.value > 0);

  // --- Top products by order count ---
  const productCounts = {};
  data.orders.forEach(o => o.items?.forEach(item => {
    const t = item.title || "Unknown";
    productCounts[t] = (productCounts[t] || 0) + item.quantity;
  }));
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, units]) => ({ name, units }));

  // --- Rating distribution ---
  const ratingDist = [1,2,3,4,5].map(r => ({
    rating: `${r}★`,
    Count: data.reviews.filter(rv => rv.rating === r).length,
  }));

  // --- Users over time (last 30 days) ---
  const usersByDay = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    usersByDay.push({
      date: label,
      Users: data.users.filter(u => new Date(u.createdAt) <= d).length,
    });
  }

  if (loading) return <div style={s.page}><div style={s.empty}>Loading analytics…</div></div>;

  return (
    <AdminLayout>
    <div style={s.page}>
      <div style={s.container}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={s.heading}>Analytics Dashboard</h1>
            <p style={s.sub}>Platform overview & insights</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[7, 30, 90].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", cursor: "pointer",
                border: range === r ? "1px solid #7c5cfc" : "1px solid #1a1d2e",
                background: range === r ? "rgba(124,92,252,0.15)" : "#0d0f1a",
                color: range === r ? "#a78bfa" : "#525878",
              }}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={s.statsGrid}>
          {[
            { label: "Total Revenue", value: `₹${totalRevenue.toFixed(0)}`, color: "#a78bfa" },
            { label: "Total Orders", value: data.orders.length, color: "#60a5fa" },
            { label: "Total Users", value: data.users.length, color: "#4ade80" },
            { label: "Avg Order Value", value: `₹${avgOrderVal.toFixed(0)}`, color: "#facc15" },
            { label: "Delivered", value: delivered, color: "#4ade80" },
            { label: "Pending", value: pending, color: "#facc15" },
            { label: "Products", value: data.products.length, color: "#c084fc" },
            { label: "Avg Rating", value: avgRating, color: "#fb923c" },
          ].map(({ label, value, color }) => (
            <div key={label} style={s.card}>
              <div style={s.cardVal(color)}>{value}</div>
              <div style={s.cardLbl}>{label}</div>
            </div>
          ))}
        </div>

        {/* Orders + Revenue over time */}
        <div style={s.fullChart}>
          <p style={s.chartTitle}>Orders & Revenue ({range}d)</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ordersByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
              <XAxis dataKey="date" tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false}
                interval={Math.floor(ordersByDay.length / 7)} />
              <YAxis yAxisId="left" tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#525878" }} />
              <Line yAxisId="left" type="monotone" dataKey="Orders" stroke="#7c5cfc" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Two-column charts */}
        <div style={s.chartGrid}>
          {/* Order Status Pie */}
          <div style={s.chartCard}>
            <p style={s.chartTitle}>Order Status Breakdown</p>
            {statusData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} fontSize={11}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={s.tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={s.empty}>No orders yet</div>}
          </div>

          {/* Payment Method Bar */}
          <div style={s.chartCard}>
            <p style={s.chartTitle}>Payment Methods</p>
            {paymentData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={paymentData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                  <XAxis dataKey="name" tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={s.tooltipStyle} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={s.empty}>No payment data</div>}
          </div>
        </div>

        <div style={s.chartGrid}>
          {/* Top Products */}
          <div style={s.chartCard}>
            <p style={s.chartTitle}>Top Products (by units sold)</p>
            {topProducts.length ? (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Product</th>
                    <th style={s.th}>Units</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i}>
                      <td style={{ ...s.td, color: COLORS[i], fontWeight: 700 }}>{i + 1}</td>
                      <td style={s.td}>{p.name}</td>
                      <td style={{ ...s.td, color: "#a78bfa", fontWeight: 600 }}>{p.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div style={s.empty}>No sales data</div>}
          </div>

          {/* Rating Distribution */}
          <div style={s.chartCard}>
            <p style={s.chartTitle}>Rating Distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                <XAxis dataKey="rating" tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={s.tooltipStyle} />
                <Bar dataKey="Count" fill="#facc15" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div style={s.fullChart}>
          <p style={s.chartTitle}>Cumulative User Growth (30d)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={usersByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
              <XAxis dataKey="date" tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: "#525878", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={s.tooltipStyle} />
              <Line type="monotone" dataKey="Users" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;