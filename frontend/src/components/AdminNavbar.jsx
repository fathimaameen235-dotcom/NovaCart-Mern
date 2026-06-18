import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AdminNavbar = () => {
  const { adminUser, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // All hooks must come before any conditional return
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const hideNavbarRoutes = [
    "/admin/login",
    "/admin/register",
  ];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    toast.success("Admin logged out");
    navigate("/admin/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nova-glass border-b border-nova-border backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
              }}
            >
              <span className="text-white font-display font-bold text-sm">
                N
              </span>
            </div>

            <span className="font-display font-bold text-xl text-nova-text">
              Nova<span className="text-nova-accent">Cart</span>
            </span>

            <span
              className="ml-1 text-xs font-mono px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(124,92,252,0.15)",
                color: "#a78bfa",
                border: "1px solid rgba(124,92,252,0.25)",
              }}
            >
              ADMIN
            </span>
          </Link>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            {adminUser && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nova-surface">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg,#7c5cfc,#3b82f6)",
                    }}
                  >
                    {(adminUser?.name || "A")[0].toUpperCase()}
                  </div>

                  <span className="font-body text-sm text-nova-text">
                    {adminUser?.name?.split(" ")[0] || "Admin"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="nova-btn-secondary px-4 py-2 rounded-lg text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;