import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Routes that must never send a token
const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/register",
  "/login",
  "/register",
];

API.interceptors.request.use(
  (config) => {
    try {
      const currentPath = window.location.pathname;

      // ✅ Don't attach any token on public auth pages.
      // On /admin/register, attaching a stale novacart_admin token triggers
      // the "existing admin must authorize" gate in the backend → 401.
      if (PUBLIC_PATHS.includes(currentPath)) {
        return config;
      }

      const isAdminRoute = currentPath.startsWith("/admin");
      const key = isAdminRoute ? "novacart_admin" : "novacart_user";

      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }

      return config;
    } catch (error) {
      console.error("Request Interceptor Error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith("/admin");

      // ✅ Don't redirect/clear on public auth pages — let the component
      // handle the error and show the toast instead.
      if (PUBLIC_PATHS.includes(currentPath)) {
        return Promise.reject(error);
      }

      if (isAdminRoute) {
        localStorage.removeItem("novacart_admin");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("novacart_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;