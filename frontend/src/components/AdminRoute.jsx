import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { adminUser, loading } = useAuth();

  // Wait for auth state to be resolved from localStorage before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nova-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-nova-border"></div>
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-nova-accent animate-spin"></div>
          </div>
          <p className="text-sm font-body text-nova-muted tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;