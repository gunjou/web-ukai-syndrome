import React, { useEffect, useRef, useState } from "react";
import { FiUser, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import Api from "../../../utils/Api";

const ProfileDropdown = () => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const nama = user?.nama || "User";

  const [form, setForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password_baru: "",
  });

  // close dropdown / modal saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (form.password_baru !== form.konfirmasi_password_baru) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    try {
      setLoading(true);
      await Api.put("/profile/password", form);

      toast.success("Password berhasil diganti");
      setShowModal(false);
      setForm({
        password_lama: "",
        password_baru: "",
        konfirmasi_password_baru: "",
      });
    } catch (err) {
      toast.error("Gagal mengganti password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon Profile */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 transition"
      >
        <FiUser />
        <FiChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md border z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold truncate">{nama}</p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Ganti Password
          </button>
        </div>
      )}

      {/* Modal Ganti Password */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-[90%] max-w-sm rounded-xl p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Ganti Password</h3>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="Password Lama"
                required
                value={form.password_lama}
                onChange={(e) =>
                  setForm({ ...form, password_lama: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <input
                type="password"
                placeholder="Password Baru"
                required
                value={form.password_baru}
                onChange={(e) =>
                  setForm({ ...form, password_baru: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                required
                value={form.konfirmasi_password_baru}
                onChange={(e) =>
                  setForm({
                    ...form,
                    konfirmasi_password_baru: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md
               flex items-center gap-2
               disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded-md
               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
