import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import API from "../api/axios";

const COLORS = ["#7c5cfc", "#3b82f6", "#4ade80", "#facc15", "#f87171", "#c084fc"];

const s = {
  heading:   { fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#eef2ff" },
  sub:       { color: "#525878", fontSize: "0.875rem" },
  card:      { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16 },
  cardVal:   (color) => ({ fontFamily: "'Syne',sans-serif", fontWeight: 700, color }),
  cardLbl:   { color: "#525878", fontSize: "0.78rem" },
  chartCard: { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16 },
  chartTitle:{ fontFamily: "'Syne',sans-serif", fontWeight: 600, color: "#eef2ff", fontSize: "0.9rem" },
  tooltipStyle: { background: "#0f1120", border: "1px solid #1a1d2e", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem" },
  empty:     { textAlign: "center", padding: "48px 0", color: "#525878", fontSize: "0.875rem" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { padding: "10px 12px", textAlign: "left", fontSize: "0.68rem", fontWeight: 600, color: "#525878", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1a1d2e" },
  td:        { padding: "10px 12px", fontSize: "0.82rem", color: "#c8cde8", borderBottom: "1px solid #0f1120" },
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#060812] px-4 sm:px-6 pt-8 pb-10">
          <div style={s.empty}>Loading analytics…</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#060812] px-3 sm:px-6 pt-6 sm:pt-8 pb-10 font-['DM_Sans',sans-serif]">
        <div className="max-w-[1280px] mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h1 style={s.heading} className="text-xl sm:text-[1.75rem] mb-1">Analytics Dashboard</h1>
              <p style={s.sub}>Platform overview &amp; insights</p>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  border: range === r ? "1px solid #7c5cfc" : "1px solid #1a1d2e",
                  background: range === r ? "rgba(124,92,252,0.15)" : "#0d0f1a",
                  color: range === r ? "#a78bfa" : "#525878",
                }} className="px-3 py-1.5 rounded-lg text-xs sm:text-[0.8rem] cursor-pointer">
                  {r}d
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards — 2 cols mobile, 4 cols tablet, fits naturally on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-7">
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
              <div key={label} style={s.card} className="px-3.5 sm:px-5 py-4 sm:py-[22px]">
                <div style={s.cardVal(color)} className="text-lg sm:text-[1.9rem] mb-1 truncate">{value}</div>
                <div style={s.cardLbl}>{label}</div>
              </div>
            ))}
          </div>

          {/* Orders + Revenue over time */}
          <div style={s.chartCard} className="p-4 sm:p-5 mb-5">
            <p style={s.chartTitle} className="mb-4 sm:mb-5">Orders &amp; Revenue ({range}d)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ordersByDay} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                <XAxis dataKey="date" tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false}
                  interval={Math.floor(ordersByDay.length / 5)} />
                <YAxis yAxisId="left" tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "0.75rem", color: "#525878" }} />
                <Line yAxisId="left" type="monotone" dataKey="Orders" stroke="#7c5cfc" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#4ade80" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status + Payment Methods — stacked on mobile, 2-col on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Order Status Pie */}
            <div style={s.chartCard} className="p-4 sm:p-5">
              <p style={s.chartTitle} className="mb-4 sm:mb-5">Order Status Breakdown</p>
              {statusData.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={s.tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div style={s.empty}>No orders yet</div>}
            </div>

            {/* Payment Method Bar */}
            <div style={s.chartCard} className="p-4 sm:p-5">
              <p style={s.chartTitle} className="mb-4 sm:mb-5">Payment Methods</p>
              {paymentData.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={paymentData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                    <XAxis dataKey="name" tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={s.tooltipStyle} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={s.empty}>No payment data</div>}
            </div>
          </div>

          {/* Top Products + Rating Distribution — stacked on mobile, 2-col on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Top Products */}
            <div style={s.chartCard} className="p-4 sm:p-5">
              <p style={s.chartTitle} className="mb-4 sm:mb-5">Top Products (by units sold)</p>
              {topProducts.length ? (
                <div className="overflow-x-auto">
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
                          <td style={{ ...s.td, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                          <td style={{ ...s.td, color: "#a78bfa", fontWeight: 600 }}>{p.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div style={s.empty}>No sales data</div>}
            </div>

            {/* Rating Distribution */}
            <div style={s.chartCard} className="p-4 sm:p-5">
              <p style={s.chartTitle} className="mb-4 sm:mb-5">Rating Distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ratingDist} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                  <XAxis dataKey="rating" tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={s.tooltipStyle} />
                  <Bar dataKey="Count" fill="#facc15" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Growth */}
          <div style={s.chartCard} className="p-4 sm:p-5">
            <p style={s.chartTitle} className="mb-4 sm:mb-5">Cumulative User Growth (30d)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usersByDay} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                <XAxis dataKey="date" tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: "#525878", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
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