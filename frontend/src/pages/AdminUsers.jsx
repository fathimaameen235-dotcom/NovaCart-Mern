
import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../api/axios";
import toast from "react-hot-toast";

const s = {
  page:      { padding: "32px 24px 40px", fontFamily: "'DM Sans',sans-serif" },
  container: { maxWidth: 1200, margin: "0 auto" },
  heading:   { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#eef2ff", marginBottom: 4 },
  sub:       { color: "#525878", fontSize: "0.875rem", marginBottom: 28 },
  searchRow: { display: "flex", gap: 12, marginBottom: 24 },
  input:     { flex: 1, background: "#0d0f1a", border: "1px solid #1a1d2e", color: "#eef2ff", borderRadius: 10, padding: "10px 16px", fontSize: "0.875rem", outline: "none" },
  table:     { width: "100%", borderCollapse: "collapse", background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 16, overflow: "hidden" },
  th:        { padding: "14px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#525878", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1a1d2e", background: "#0a0c14" },
  td:        { padding: "14px 16px", fontSize: "0.875rem", color: "#c8cde8", borderBottom: "1px solid #0f1120" },
  avatar:    { width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #1a1d2e" },
  avatarFallback: (name) => ({
    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg,#7c5cfc,#3b82f6)", color: "#fff", fontWeight: 700, fontSize: "0.875rem",
  }),
  roleBadge:  (role) => ({
    display: "inline-flex", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600,
    background: role === "admin" ? "rgba(124,92,252,0.15)" : "rgba(34,197,94,0.1)",
    color: role === "admin" ? "#a78bfa" : "#4ade80",
    border: `1px solid ${role === "admin" ? "rgba(124,92,252,0.3)" : "rgba(34,197,94,0.25)"}`,
    textTransform: "capitalize",
  }),
  deleteBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" },
  modal:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24 },
  modalBox:  { background: "#0d0f1a", border: "1px solid #1a1d2e", borderRadius: 16, width: "100%", maxWidth: 400, padding: 28 },
  empty:     { textAlign: "center", padding: "64px 0", color: "#525878" },
  stats:     { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 28 },
  statCard:  { background: "linear-gradient(145deg,#0d0f1a,#080a10)", border: "1px solid #1a1d2e", borderRadius: 14, padding: "18px 20px" },
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/auth/users");
      setUsers(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await API.delete(`/auth/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers   = users.length;
  const adminCount   = users.filter(u => u.role === "admin").length;
  const regularCount = users.filter(u => u.role === "user").length;

  return (
    <AdminLayout>
      <div style={s.page}>
        <div style={s.container}>
          <h1 style={s.heading}>User Management</h1>
          <p style={s.sub}>{totalUsers} registered users</p>

          {/* Stat Cards */}
          <div style={s.stats}>
            {[
              { label: "Total Users", value: totalUsers, color: "#a78bfa" },
              { label: "Admins", value: adminCount, color: "#7c5cfc" },
              { label: "Regular Users", value: regularCount, color: "#4ade80" },
            ].map(({ label, value, color }) => (
              <div key={label} style={s.statCard}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.75rem", color, marginBottom: 4 }}>{value}</div>
                <div style={{ color: "#525878", fontSize: "0.8rem" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div style={s.searchRow}>
            <input
              style={s.input}
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {["all", "user", "admin"].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                  border: roleFilter === r ? "1px solid #7c5cfc" : "1px solid #1a1d2e",
                  background: roleFilter === r ? "rgba(124,92,252,0.15)" : "#0d0f1a",
                  color: roleFilter === r ? "#a78bfa" : "#525878",
                }}
              >
                {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1) + "s"}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={s.empty}>Loading users…</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>No users found.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id}>
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} style={s.avatar} />
                        ) : (
                          <div style={s.avatarFallback(user.name)}>
                            {(user.name || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <span style={{ color: "#eef2ff", fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={s.td}>{user.email}</td>
                    <td style={s.td}><span style={s.roleBadge(user.role)}>{user.role}</span></td>
                    <td style={{ ...s.td, color: "#525878", fontSize: "0.75rem" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      {user.role !== "admin" && (
                        <button style={s.deleteBtn} onClick={() => setConfirmDelete(user)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div style={s.modal} onClick={() => setConfirmDelete(null)}>
            <div style={s.modalBox} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#eef2ff", marginBottom: 12 }}>
                Delete User?
              </h2>
              <p style={{ color: "#c8cde8", fontSize: "0.875rem", marginBottom: 8 }}>
                Are you sure you want to delete <strong style={{ color: "#eef2ff" }}>{confirmDelete.name}</strong>?
              </p>
              <p style={{ color: "#525878", fontSize: "0.8rem", marginBottom: 24 }}>
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
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;