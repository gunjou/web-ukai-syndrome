import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Api from "../utils/Api";
import ukai from "../assets/logo_putih.png";
import ukaibawah from "../assets/loginRegister/bg_samping_login.png";

const RegisterPage = () => {
  const navigate = useNavigate();

  // step: 1=email, 2=kode, 3=form lengkap
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "", // ✅ ditambahkan
    password: "",
    confirmPassword: "",
    kode_pemulihan: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // STEP 1: kirim kode verifikasi ke email
  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      await Api.post("/auth/register/email", { email: form.email });
      alert("Kode verifikasi telah dikirim ke email Anda.");
      setStep(2);
    } catch (error) {
      alert(
        error?.response?.data?.message || "Gagal mengirim kode verifikasi."
      );
    }
  };

  // STEP 2: verifikasi kode
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      await Api.post("/auth/register/verify", {
        email: form.email,
        kode_pemulihan: form.kode_pemulihan,
      });
      alert("Kode verifikasi benar, silakan lengkapi data.");
      setStep(3);
    } catch (error) {
      alert(error?.response?.data?.message || "Kode verifikasi salah.");
    }
  };

  // STEP 3: register full
  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama.");
      return;
    }

    try {
      await Api.post("/auth/register/complete", {
        nama: form.nama,
        email: form.email,
        no_hp: form.no_hp, // ✅ ikut dikirim ke API
        password: form.password,
      });
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Registrasi gagal. Pastikan data benar."
      );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-l from-[#a11d1d] to-[#531d1d] px-4 py-8">
      <div className="flex items-center justify-center w-full md:w-1/2">
        <div className="bg-white p-8 rounded-[20px] shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-left">Buat Akun</h1>
          <p className="mb-6 text-gray-400">
            {step === 1 && "Masukkan email Anda untuk menerima kode verifikasi"}
            {step === 2 && "Masukkan kode verifikasi dari email Anda"}
            {step === 3 && "Lengkapi data untuk membuat akun"}
          </p>

          {/* STEP 1: Input Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan email anda"
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 font-bold rounded-lg hover:bg-yellow-700"
              >
                Kirim Kode
              </button>
            </form>
          )}

          {/* STEP 2: Input Kode */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Kode Verifikasi
                </label>
                <input
                  type="text"
                  name="kode_pemulihan"
                  value={form.kode_pemulihan}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan kode dari email"
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 font-bold rounded-lg hover:bg-yellow-700"
              >
                Verifikasi
              </button>
            </form>
          )}

          {/* STEP 3: Lengkapi Data */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nama
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama lengkap anda"
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              {/* ✅ Tambahan No HP */}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nomor HP anda"
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan password"
                    className="w-full px-4 py-2 border rounded-md pr-10"
                  />
                  <div
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan ulang password"
                    className="w-full px-4 py-2 border rounded-md pr-10"
                  />
                  <div
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 font-bold rounded-lg hover:bg-yellow-700"
              >
                Daftar
              </button>
            </form>
          )}

          <p className="text-sm text-center text-gray-500 mt-4">
            Sudah punya akun?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Masuk
            </a>
          </p>
        </div>
      </div>

      {/* Kanan */}
      <div className="hidden md:flex flex-col justify-between items-end w-1/2 pl-8">
        <img src={ukai} alt="Ukai atas" className="px-12 mb-2" />
        <img src={ukaibawah} alt="Ukai bawah" className="px-12" />
      </div>
    </div>
  );
};

export default RegisterPage;
