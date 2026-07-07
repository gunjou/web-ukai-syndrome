// utils/ApiExternal.js
import axios from "axios";

const externalBaseURL = process.env.REACT_APP_EXTERNAL_API_URL;

const ApiExternal = axios.create({
  baseURL: externalBaseURL,
  headers: { "Content-Type": "application/json" },
});

ApiExternal.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Opsional: handle response error juga (401, dll)
ApiExternal.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default ApiExternal;
