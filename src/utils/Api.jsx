import axios from "axios";

const Api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000, // 15 detik = UX timeout
  headers: { "Content-Type": "application/json" },
});

// Flag global biar logout hanya sekali
let isLogoutTriggered = false;

// ==============================
// REQUEST INTERCEPTOR
// ==============================
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // reset logout flag setiap request baru
    isLogoutTriggered = false;

    return config;
  },
  (error) => Promise.reject(error),
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    /**
     * =========================
     * 1. NETWORK / TIMEOUT ERROR
     * =========================
     */
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        alert(
          "Koneksi jaringan Anda lambat atau tidak stabil.\nSilakan periksa Wi-Fi atau coba lagi.",
        );
      } else {
        alert(
          "Tidak dapat terhubung ke server.\nKemungkinan jaringan terblokir atau server sedang bermasalah.",
        );
      }
      return Promise.reject(error);
    }

    /**
     * =========================
     * 2. HANDLE 401 (AUTH)
     * =========================
     */
    if (error.response.status === 401) {
      const statusMessage = error.response?.data?.status;
      const apiMessage = error.response?.data?.message;

      // Salah username / password
      if (statusMessage === "Invalid username or password") {
        return Promise.reject(error);
      }

      // Token expired normal
      if (statusMessage === "Token expired, Login ulang") {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true;
          alert("Sesi Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }

      // Login di device lain
      if (
        statusMessage === "Session invalid or expired" ||
        apiMessage === "Session invalid or expired"
      ) {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true;
          alert("Akun Anda login di perangkat lain.");
          localStorage.clear();
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }
    }

    /**
     * =========================
     * 3. SERVER ERROR (5xx)
     * =========================
     */
    if (error.response.status >= 500) {
      alert(
        "Server sedang sibuk atau mengalami gangguan.\nSilakan coba beberapa saat lagi.",
      );
    }

    return Promise.reject(error);
  },
);

export default Api;
