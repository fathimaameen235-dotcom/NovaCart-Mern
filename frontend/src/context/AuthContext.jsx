import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData  = localStorage.getItem("novacart_user");
      const adminData = localStorage.getItem("novacart_admin");
      if (userData)  setUser(JSON.parse(userData));
      if (adminData) setAdminUser(JSON.parse(adminData));
    } catch (error) {
      localStorage.removeItem("novacart_user");
      localStorage.removeItem("novacart_admin");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("novacart_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password });
    localStorage.setItem("novacart_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const adminLogin = async (email, password) => {
    const { data } = await API.post("/auth/admin/login", { email, password });
    localStorage.setItem("novacart_admin", JSON.stringify(data));
    setAdminUser(data);
    return data;
  };

  const adminRegister = async (name, email, password) => {
    const { data } = await API.post("/auth/admin/register", { name, email, password });
    localStorage.setItem("novacart_admin", JSON.stringify(data));
    setAdminUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("novacart_user");
    localStorage.removeItem("novacart_cart");
    setUser(null);
  };

  // ✅ FIX: cart clear added
  const adminLogout = () => {
    localStorage.removeItem("novacart_admin");
    localStorage.removeItem("novacart_cart");
    setAdminUser(null);
  };

  const updateUser = (updatedUser) => {
    if (updatedUser?.role === "admin") {
      setAdminUser(updatedUser);
      localStorage.setItem("novacart_admin", JSON.stringify(updatedUser));
    } else {
      setUser(updatedUser);
      localStorage.setItem("novacart_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user, adminUser, setUser, setAdminUser, loading,
      login, register, adminLogin, adminRegister,
      logout, adminLogout, updateUser,
      authenticated: !!user,
      isAdmin: !!adminUser,
      role: user?.role || adminUser?.role || null,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};