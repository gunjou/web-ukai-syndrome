import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Api from "../utils/Api";
import ukai from "../assets/logo_putih.png";
import ukaibawah from "../assets/loginRegister/bg_samping_login.png";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Load saved email if "remember me" was activated
  useEffect(() => {
    const savedRemember = safeLocalStorageGet("remember");
    const savedEmail = safeLocalStorageGet("savedEmail");

    if (savedRemember === "true" && savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

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

      // Handle remember me storage
      if (remember) {
        safeLocalStorageSet("savedEmail", email);
        safeLocalStorageSet("remember", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("remember");
      }

      setErrorMsg("");

      setTimeout(() => {
        if (role === "admin") navigate("/admin-home");
        else if (role === "mentor") navigate("/mentor-home");
        else navigate("/home");
      }, 300);
    } catch (error) {
      setErrorMsg("Email atau password salah.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-[#a11d1d] to-[#531d1d] px-4 py-8">
      <div className="flex items-center justify-center w-full md:w-1/2">
        <div className="bg-white p-8 rounded-[20px] shadow-md w-full max-w-md relative z-20">
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

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <span className="text-sm text-gray-600">Ingat saya</span>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm text-center mt-2">
                {errorMsg}
              </p>
            )}

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
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden md:flex flex-col justify-between items-end w-1/2 pl-8">
        <img src={ukai} alt="Ukai atas" className="px-12 mb-2" />
        <img src={ukaibawah} alt="Ukai bawah" className="px-12" />
      </div>
    </div>
  );
}
