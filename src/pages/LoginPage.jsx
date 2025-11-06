import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai"; // ikon untuk toast
import Api from "../utils/Api";
import ukai from "../assets/logo_putih.png";
import ukaibawah from "../assets/loginRegister/bg_samping_login.png";

// Komponen Loading Overlay
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

// Komponen Toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg text-white text-center transition
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
      >
        {type === "success" ? (
          <AiOutlineCheckCircle size={22} className="text-white" />
        ) : (
          <AiOutlineCloseCircle size={22} className="text-white" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage error:", e);
  }
};

const safeLocalStorageGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("localStorage error:", e);
    return null;
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {message, type}
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Api.post("/auth/login/web", {
        email,
        password,
      });

      const {
        access_token,
        id_user,
        nama,
        nickname,
        email: userEmail,
        role,
      } = response.data;

      safeLocalStorageSet("token", access_token);
      safeLocalStorageSet(
        "user",
        JSON.stringify({ id_user, nama, nickname, email: userEmail, role })
      );

      // localStorage.setItem("token", access_token);
      // localStorage.setItem(
      //   "user",
      //   JSON.stringify({ id_user, nama, nickname, email: userEmail, role })
      // );

      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin-home");
        } else if (role === "mentor") {
          // navigate("/mentor-dashboard/materi");
          navigate("/mentor-home");
        } else {
          navigate("/home");
        }
      }, 500);
      setToast({ message: "Login berhasil!", type: "success" });
    } catch (error) {
      console.error("Login failed:", error);
      setToast({ message: "Email atau password salah!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-b from-[#a11d1d] to-[#531d1d] px-4 py-8">
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Kiri: Form Login */}
      <div className="flex items-center justify-center w-full md:w-1/2">
        <div className="bg-white p-8 rounded-[20px] shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-left">Login</h1>
          <p className="mb-6 text-gray-400">Login untuk menggunakan aplikasi</p>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Masukkan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 pr-10"
                  placeholder="Masukkan password anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute right-3 top-2.5 text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <button
                type="submit"
                className="w-[100px] bg-yellow-500 text-white py-2 font-bold rounded-lg hover:bg-yellow-700 transition"
              >
                Login
              </button>
            </div>
          </form>
          <p className="text-sm text-center text-gray-500 mt-4">
            Belum punya akun? Silahkan hubungi admin untuk mendaftar.
            {/* <a href="/register" className="text-blue-600 hover:underline">
              Daftar
            </a> */}
          </p>
        </div>
      </div>

      {/* Kanan: Gambar */}
      <div className="hidden md:flex flex-col justify-between items-end w-1/2 pl-8">
        <img src={ukai} alt="Ukai atas" className="px-12 mb-2" />
        <img src={ukaibawah} alt="Ukai bawah" className="px-12" />
      </div>
    </div>
  );
};

export default LoginPage;
