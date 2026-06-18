import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:    { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  processing: { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa", border: "rgba(96,165,250,0.25)" },
  shipped:    { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  delivered:  { bg: "rgba(52,211,153,0.12)",  color: "#34d399", border: "rgba(52,211,153,0.25)" },
  cancelled:  { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.25)" },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 w-48 shimmer rounded-xl mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="nova-card p-6 mb-4">
              <div className="h-5 w-2/3 shimmer rounded mb-3" />
              <div className="h-4 w-1/3 shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="font-display font-bold text-3xl text-nova-text mb-2">No orders yet</h2>
        <p className="text-nova-muted font-body mb-8">You haven't placed any orders.</p>
        <Link to="/products" className="nova-btn-primary px-8 py-3 rounded-xl text-base">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-4xl text-nova-text mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <div key={order._id} className="nova-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-nova-muted font-mono mb-1">
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-nova-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 9999,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status}
                    </span>
                    <span className="font-display font-bold text-nova-text">
                      ${order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
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

                {/* Shipping */}
                <div className="mt-4 pt-4 border-t border-nova-border text-sm text-nova-muted">
                  <span className="font-mono text-xs">Ship to: </span>
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName},{" "}
                  {order.shippingAddress?.city}, {order.shippingAddress?.country}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;