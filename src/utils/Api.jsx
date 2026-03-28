import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL;
// const baseURL = "http://127.0.0.1:5000";
export const CDN_ASSET_URL = process.env.REACT_APP_CDN_ASSET_URL;
const Api = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
});

// 1. Interceptor Request: Tambahkan token ke setiap header
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Interceptor Response: Handle Token Expired & Refresh
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // JANGAN lakukan intercept logout jika ini adalah request LOGIN
    if (config.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (response?.status === 401) {
      const isExpired =
        response.data?.message?.includes("expired") ||
        response.data?.status === "Token expired";

      if (isExpired && !originalRequest._retry) {
        // ... (logika refresh token tetap sama)
      }
      // Kondisi B: Token tidak valid / Salah
      else if (!originalRequest._retry) {
        handleForceLogout("Sesi telah habis. Silakan login kembali.");
      }
    }

    return Promise.reject(error);
  },
);

const handleForceLogout = (message) => {
  // Gunakan flag agar alert tidak muncul berkali-kali jika ada banyak request gagal bersamaan
  if (!window.isLoggingOut) {
    window.isLoggingOut = true;
    alert(message);
    localStorage.clear(); // Hapus semua (token, user data, dll)
    window.location.href = "/login"; // Force redirect ke login
  }
};

export default Api;
