// src/utils/api.jsx
import axios from "axios";

const Api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ganti ke baseURL API production
  // baseURL: "http://127.0.0.1:5000",
  headers: { "Content-Type": "application/json" },
});

// Flag global biar logout hanya sekali
let isLogoutTriggered = false;

// Interceptor request: tambahkan token
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: handle error 401
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const statusMessage = error.response?.data?.status;
      const apiMessage = error.response?.data?.message;

      // Jika username/password salah
      if (statusMessage === "Invalid username or password") {
        return Promise.reject(error);
      }

      // Handle token expired biasa
      if (statusMessage === "Token expired, Login ulang") {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true;
          alert("Sesi Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          window.location.replace("/login");
        }
      }

      // Handle expired session karena login di device lain
      if (
        statusMessage === "Session invalid or expired" ||
        apiMessage === "Session invalid or expired"
      ) {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true;
          alert("Anda login di perangkat lain. Silakan login kembali.");
          localStorage.clear();
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
