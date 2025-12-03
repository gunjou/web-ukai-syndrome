import React, { useState, useEffect, useRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Api from "../utils/Api";

// ---- LocalStorage Safe ----
const safeLocalStorage = {
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  remove: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const saved = safeLocalStorage.get("savedEmail");
    const rememberFlag = safeLocalStorage.get("remember") === "true";

    if (saved && rememberFlag) {
      setEmail(saved);
      setRemember(true);
    }

    return () => (mounted.current = false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await Api.post("/auth/login/web", { email, password });
      const { access_token, id_user, nama, nickname, role } = res.data || {};

      safeLocalStorage.set("token", access_token);
      safeLocalStorage.set(
        "user",
        JSON.stringify({ id_user, nama, nickname, role })
      );

      if (remember) {
        safeLocalStorage.set("savedEmail", email);
        safeLocalStorage.set("remember", "true");
      } else {
        safeLocalStorage.remove("savedEmail");
        safeLocalStorage.remove("remember");
      }

      if (role === "admin") navigate("/admin-home");
      else if (role === "mentor") navigate("/mentor-home");
      else navigate("/home");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Email atau password salah.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#8f1a1a] via-[#742020] to-[#2b0f0f] flex items-center justify-center px-5 py-10">
      {/* SAFE LOADING */}
      <div
        className={`fixed inset-0 flex items-center justify-center transition ${
          loading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } bg-black/40 backdrop-blur-md`}
      >
        <div className="w-14 h-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-[fadeIn_0.6s_ease]">
        {/* Header */}
        <h1 className="text-center text-white text-3xl font-bold tracking-wide drop-shadow-lg">
          Selamat Datang Kembali
        </h1>
        <p className="text-center text-gray-200 text-sm mt-1 mb-6">
          Silakan masuk untuk melanjutkan
        </p>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label className="text-gray-100 text-sm font-medium">Email</label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="mt-1 w-full px-4 py-3 text-white bg-white/20 border border-white/30 rounded-xl placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-100 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="mt-1 w-full px-4 py-3 text-white bg-white/20 border border-white/30 rounded-xl placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none transition pr-12"
                style={{ WebkitAppearance: "none" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-4 right-4 text-gray-300 cursor-pointer"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Remember */}
          <label className="flex items-center gap-2 cursor-pointer text-gray-200">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Ingat saya
          </label>

          {errorMsg && (
            <p className="text-sm text-center text-red-400 bg-red-900/30 p-2 rounded-lg">
              {errorMsg}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.03] disabled:opacity-50"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-5 text-gray-300 text-sm">
          Belum punya akun? <br /> Hubungi admin untuk mendaftar.
        </p>
      </div>
    </div>
  );
}
