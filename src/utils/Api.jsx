import axios from "axios";

// const baseURL = "http://127.0.0.1:5000";
const baseURL = process.env.REACT_APP_API_URL;

export const CDN_ASSET_URL = process.env.REACT_APP_CDN_ASSET_URL;

const Api = axios.create({
  baseURL: baseURL,

  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// 1. INTERCEPTOR REQUEST
// ============================================================================

Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Jika request menggunakan FormData,
    // jangan gunakan application/json.
    //
    // Biarkan browser/Axios menentukan multipart boundary.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// ============================================================================
// 2. INTERCEPTOR RESPONSE
// ============================================================================

Api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // Jangan intercept logout jika ini request login
    if (config.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (response?.status === 401) {
      const isExpired =
        response.data?.message?.includes("expired") ||
        response.data?.status === "Token expired";

      if (isExpired && !originalRequest._retry) {
        // ... logika refresh token Anda tetap di sini
      } else if (!originalRequest._retry) {
        handleForceLogout("Sesi telah habis. Silakan login kembali.");
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================================
// FORCE LOGOUT
// ============================================================================

const handleForceLogout = (message) => {
  // Gunakan flag agar alert tidak muncul berkali-kali
  // jika banyak request gagal bersamaan.

  if (!window.isLoggingOut) {
    window.isLoggingOut = true;

    alert(message);

    localStorage.clear();

    window.location.href = "/login";
  }
};

export default Api;
