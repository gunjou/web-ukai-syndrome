import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ukai from "../assets/loginRegister/bg_ukai_new.png";
import ukaibawah from "../assets/loginRegister/bg_samping_login.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Static email and password for demo
  const users = [
    { email: "admin@coba.com", password: "123" },
    { email: "user@coba.com", password: "456" },
  ];

  // Handle form submission
  const handleLogin = (e) => {
    e.preventDefault();

    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      // Redirect to dashboard/home
      navigate("/dashboard/home");
    } else {
      alert("Email atau password salah!");
    }
  };

  return (
    <div className="flex min-h-screen bg-custom-bg px-4 py-8">
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
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Masukkan password anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-center items-center">
              <button
                type="submit"
                className="w-[100px] bg-red-600 text-white py-2 font-bold rounded-lg hover:bg-red-700 transition"
              >
                Login
              </button>
            </div>
          </form>
          <p className="text-sm text-center text-gray-500 mt-4">
            Belum punya akun?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Daftar
            </a>
          </p>
        </div>
      </div>

      {/* Kanan: Gambar */}
      <div className="hidden md:flex flex-col justify-between items-end w-1/2 pl-8">
        <img src={ukai} alt="Ukai atas" className="w-[600px] mb-2" />
        <img src={ukaibawah} alt="Ukai bawah" className="w-[600px]" />
      </div>
    </div>
  );
};

export default LoginPage;
