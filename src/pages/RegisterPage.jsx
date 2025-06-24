import { useNavigate } from "react-router-dom";
import { useState } from "react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Sementara: tidak validasi backend, langsung arahkan
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-[20px] shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-left">Buat Akun</h1>
        <p className="mb-6 text-gray-400">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo,
          excepturi repellat.
        </p>

        <form onSubmit={handleRegister} className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Nama
            </label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              placeholder="Masukkan nama lengkap anda"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="Masukkan email anda"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password anda"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password anda"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex justify-center items-center pt-4">
            <button
              type="submit"
              className="w-[10rem] bg-red-600 text-white py-2 font-bold rounded-lg hover:bg-red-700 transition"
            >
              Daftar
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Masuk
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
