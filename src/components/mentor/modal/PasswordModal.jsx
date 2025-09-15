import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ModalMenu from "./ModalMenu";
import Api from "../../../utils/Api";
import toast from "react-hot-toast";

const PasswordModal = ({ isOpen, onClose }) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password_baru: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password_baru !== form.konfirmasi_password_baru) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    try {
      setLoading(true);
      await Api.put("/profile/password", form);
      toast.success("Password berhasil diperbarui");
      setForm({
        password_lama: "",
        password_baru: "",
        konfirmasi_password_baru: "",
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengganti password");
      console.error("Gagal update password:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalMenu isOpen={isOpen} onClose={onClose} title="Ganti Password">
      <form className="space-y-3" onSubmit={handleSubmit}>
        {/* Password Lama */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Password Lama</label>
          <div className="relative">
            <input
              name="password_lama"
              type={showOld ? "text" : "password"}
              placeholder="Password lama"
              className="w-full border px-3 py-2 rounded-lg pr-10"
              value={form.password_lama}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowOld(!showOld)}
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Password Baru */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Password Baru</label>
          <div className="relative">
            <input
              name="password_baru"
              type={showNew ? "text" : "password"}
              placeholder="Password baru"
              className="w-full border px-3 py-2 rounded-lg pr-10"
              value={form.password_baru}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Konfirmasi */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <input
              name="konfirmasi_password_baru"
              type={showConfirm ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              className="w-full border px-3 py-2 rounded-lg pr-10"
              value={form.konfirmasi_password_baru}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </ModalMenu>
  );
};

export default PasswordModal;
