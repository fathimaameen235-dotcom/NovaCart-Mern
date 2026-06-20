import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../api/axios";
import toast from "react-hot-toast";

const roleBadgeClasses = (role) =>
  `inline-flex px-2.5 py-0.5 rounded-md text-[0.72rem] font-semibold capitalize border ${
    role === "admin"
      ? "bg-[rgba(124,92,252,0.15)] text-[#a78bfa] border-[rgba(124,92,252,0.3)]"
      : "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border-[rgba(34,197,94,0.25)]"
  }`;

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
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const regularCount = users.filter((u) => u.role === "user").length;

  return (
    <AdminLayout>
      <div className="px-3 sm:px-6 py-6 sm:py-8 pb-10 font-['DM_Sans',sans-serif]">
        <div className="max-w-[1200px] mx-auto">

          <h1 className="font-['Syne',sans-serif] font-bold text-xl sm:text-[1.75rem] text-[#eef2ff] mb-1">
            User Management
          </h1>
          <p className="text-[#525878] text-sm mb-6 sm:mb-7">{totalUsers} registered users</p>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-7">
            {[
              { label: "Total Users", value: totalUsers, color: "#a78bfa" },
              { label: "Admins", value: adminCount, color: "#7c5cfc" },
              { label: "Regular Users", value: regularCount, color: "#4ade80" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-gradient-to-br from-[#0d0f1a] to-[#080a10] border border-[#1a1d2e] rounded-[14px] px-3 sm:px-5 py-3.5 sm:py-[18px]"
              >
                <div
                  className="font-['Syne',sans-serif] font-bold text-lg sm:text-[1.75rem] mb-1"
                  style={{ color }}
                >
                  {value}
                </div>
                <div className="text-[#525878] text-[0.7rem] sm:text-[0.8rem]">{label}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              className="flex-1 bg-[#0d0f1a] border border-[#1a1d2e] text-[#eef2ff] rounded-[10px] px-4 py-2.5 text-sm outline-none focus:border-[#7c5cfc] transition-colors"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              {["all", "user", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-[0.8rem] font-medium cursor-pointer whitespace-nowrap border transition-colors ${
                    roleFilter === r
                      ? "border-[#7c5cfc] bg-[rgba(124,92,252,0.15)] text-[#a78bfa]"
                      : "border-[#1a1d2e] bg-[#0d0f1a] text-[#525878]"
                  }`}
                >
                  {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1) + "s"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#525878]">Loading users…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#525878]">No users found.</div>
          ) : (
            <>
              {/* Desktop / tablet table */}
              <div className="hidden sm:block w-full overflow-x-auto rounded-2xl border border-[#1a1d2e] bg-gradient-to-br from-[#0d0f1a] to-[#080a10]">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr>
                      {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-left text-xs font-semibold text-[#525878] uppercase tracking-wide border-b border-[#1a1d2e] bg-[#0a0c14]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4 py-3.5 text-sm text-[#c8cde8] border-b border-[#0f1120]">
                          <div className="flex items-center gap-2.5">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-[#1a1d2e]" />
                            ) : (
                              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] text-white font-bold text-sm flex-shrink-0">
                                {(user.name || "U")[0].toUpperCase()}
                              </div>
                            )}
                            <span className="text-[#eef2ff] font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#c8cde8] border-b border-[#0f1120]">{user.email}</td>
                        <td className="px-4 py-3.5 text-sm border-b border-[#0f1120]">
                          <span className={roleBadgeClasses(user.role)}>{user.role}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#525878] border-b border-[#0f1120]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-sm border-b border-[#0f1120]">
                          {user.role !== "admin" && (
                            <button
                              onClick={() => setConfirmDelete(user)}
                              className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#f87171] rounded-md px-3 py-1 text-xs cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden flex flex-col gap-2.5">
                {filtered.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gradient-to-br from-[#0d0f1a] to-[#080a10] border border-[#1a1d2e] rounded-2xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#1a1d2e] flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] text-white font-bold flex-shrink-0">
                          {(user.name || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[#eef2ff] font-medium text-sm truncate">{user.name}</div>
                        <div className="text-[#525878] text-xs truncate">{user.email}</div>
                      </div>
                      <span className={roleBadgeClasses(user.role) + " flex-shrink-0"}>{user.role}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1a1d2e]">
                      <span className="text-[#525878] text-xs">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#f87171] rounded-md px-3 py-1.5 text-xs cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4 sm:p-6"
            onClick={() => setConfirmDelete(null)}
          >
            <div
              className="bg-[#0d0f1a] border border-[#1a1d2e] rounded-2xl w-full max-w-[400px] p-6 sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-['Syne',sans-serif] font-bold text-[#eef2ff] mb-3 text-lg">
                Delete User?
              </h2>
              <p className="text-[#c8cde8] text-sm mb-2">
                Are you sure you want to delete <strong className="text-[#eef2ff]">{confirmDelete.name}</strong>?
              </p>
              <p className="text-[#525878] text-[0.8rem] mb-6">
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleDelete(confirmDelete._id)}
                  className="flex-1 py-2.5 rounded-[10px] bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#f87171] font-semibold cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-[10px] bg-[#1a1d2e] border border-[#1a1d2e] text-[#c8cde8] cursor-pointer"
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