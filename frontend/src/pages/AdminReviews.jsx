import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";

const Stars = ({ rating }) => (
  <span style={{ letterSpacing: 1 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= rating ? "#facc15" : "#1a1d2e", fontSize: "0.9rem" }}>★</span>
    ))}
  </span>
);

const s = {
  page:      { minHeight: "100vh", background: "#060812", padding: "32px 24px 40px", fontFamily: "'DM Sans',sans-serif" },
  container: { maxWidth: 1100, margin: "0 auto" },
  heading:   { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#eef2ff", marginBottom: 4 },
  sub:       { color: "#525878", fontSize: "0.875rem", marginBottom: 28 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 28 },
  card:      { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, padding: "18px 20px" },
  filterRow: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  filterBtn: (active) => ({
    padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
    border: active ? "1px solid #7c5cfc" : "1px solid #1a1d2e",
    background: active ? "rgba(124,92,252,0.15)" : "#0d0f1a",
    color: active ? "#a78bfa" : "#525878",
  }),
  input:     { background: "#0d0f1a", border: "1px solid #1a1d2e", color: "#eef2ff", borderRadius: 10, padding: "9px 16px", fontSize: "0.875rem", outline: "none", flex: 1, maxWidth: 320 },
  table:     { width: "100%", borderCollapse: "collapse", background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, overflow: "hidden" },
  th:        { padding: "14px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#525878", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1a1d2e", background: "#0a0c14" },
  td:        { padding: "14px 16px", fontSize: "0.875rem", color: "#c8cde8", borderBottom: "1px solid #0f1120" },
  deleteBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" },
  modal:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24 },
  modalBox:  { background: "#0d0f1a", border: "1px solid #1a1d2e", borderRadius: 16, width: "100%", maxWidth: 420, padding: 28 },
  empty:     { textAlign: "center", padding: "64px 0", color: "#525878" },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/reviews/all");
      setReviews(Array.isArray(data) ? data : (data.reviews || []));
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete review");
    } finally {
      setConfirmDelete(null);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const ratingCounts = [1,2,3,4,5].reduce((acc, r) => {
    acc[r] = reviews.filter(rv => rv.rating === r).length;
    return acc;
  }, {});

  let filtered = reviews.filter(r => {
    const matchRating = ratingFilter === "all" || r.rating === parseInt(ratingFilter);
    const matchSearch = !search ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.productId?.title?.toLowerCase().includes(search.toLowerCase());
    return matchRating && matchSearch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "highest") return b.rating - a.rating;
    if (sort === "lowest") return a.rating - b.rating;
    return 0;
  });

  return (
    <AdminLayout>
      <div style={s.page}>
        <div style={s.container}>
          <h1 style={s.heading}>Review Management</h1>
          <p style={s.sub}>{reviews.length} total reviews</p>

          <div style={s.statsGrid}>
            <div style={s.card}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#facc15", marginBottom: 4 }}>
                {avgRating} ★
              </div>
              <div style={{ color: "#525878", fontSize: "0.8rem" }}>Average Rating</div>
            </div>
            <div style={s.card}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#a78bfa", marginBottom: 4 }}>
                {reviews.length}
              </div>
              <div style={{ color: "#525878", fontSize: "0.8rem" }}>Total Reviews</div>
            </div>
            {[5,4,3].map(r => (
              <div key={r} style={s.card}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: r >= 4 ? "#4ade80" : r === 3 ? "#facc15" : "#f87171", marginBottom: 4 }}>
                  {ratingCounts[r] || 0}
                </div>
                <div style={{ color: "#525878", fontSize: "0.8rem" }}>{r} Star Reviews</div>
              </div>
            ))}
          </div>

          <div style={{ ...s.filterRow, marginBottom: 20 }}>
            <input
              style={s.input}
              placeholder="Search reviews, users, products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ background: "#0d0f1a", border: "1px solid #1a1d2e", color: "#c8cde8", borderRadius: 8, padding: "8px 12px", fontSize: "0.8rem", cursor: "pointer" }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={s.filterRow}>
            <button style={s.filterBtn(ratingFilter === "all")} onClick={() => setRatingFilter("all")}>
              All ({reviews.length})
            </button>
            {[5,4,3,2,1].map(r => (
              <button key={r} style={s.filterBtn(ratingFilter === String(r))} onClick={() => setRatingFilter(String(r))}>
                {r}★ ({ratingCounts[r] || 0})
              </button>
            ))}
          </div>

          {loading ? (
            <div style={s.empty}>Loading reviews…</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>No reviews found.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["User", "Product", "Rating", "Comment", "Date", "Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(review => (
                  <tr key={review._id}>
                    <td style={s.td}>
                      <div style={{ color: "#eef2ff", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {review.userId?.name || "—"}
                      </div>
                      <div style={{ color: "#525878", fontSize: "0.72rem" }}>{review.userId?.email || ""}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ color: "#c8cde8", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {review.productId?.title || review.productId || "—"}
                      </div>
                    </td>
                    <td style={s.td}><Stars rating={review.rating} /></td>
                    <td style={s.td}>
                      <div style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#9ca3af", fontSize: "0.85rem" }}>
                        {review.comment}
                      </div>
                    </td>
                    <td style={{ ...s.td, color: "#525878", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={s.td}>
                      <button style={s.deleteBtn} onClick={() => setConfirmDelete(review)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div style={s.modal} onClick={() => setConfirmDelete(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#eef2ff", marginBottom: 12 }}>
              Delete Review?
            </h2>
            <div style={{ background: "#0a0c14", border: "1px solid #1a1d2e", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#eef2ff", fontWeight: 500 }}>{confirmDelete.userId?.name}</span>
                <Stars rating={confirmDelete.rating} />
              </div>
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>{confirmDelete.comment}</p>
            </div>
            <p style={{ color: "#525878", fontSize: "0.8rem", marginBottom: 20 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontWeight: 600, cursor: "pointer" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#1a1d2e", border: "1px solid #1a1d2e", color: "#c8cde8", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReviews;