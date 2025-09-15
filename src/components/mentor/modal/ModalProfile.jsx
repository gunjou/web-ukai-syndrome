import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User, Key, Info, HelpCircle, Eye, EyeOff } from "lucide-react";
import Api from "../../../utils/Api";
import ModalMenu from "./ModalMenu";
import toast, { Toaster } from "react-hot-toast";
import EditProfileModal from "./EditProfileModal";
import PasswordModal from "./PasswordModal";
import AboutModal from "./AboutModal";
import HelpModal from "./HelpModal";

const ModalProfile = ({ isOpen, onClose }) => {
  const [kelasUser, setKelasUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false); // overlay loading
  const [menuOpen, setMenuOpen] = useState(null);
  const [editData, setEditData] = useState({ nama: "", email: "", no_hp: "" });
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "User";

  // Avatar fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 60%)`;
  };
  const avatarColor = stringToColor(userName);

  // Fetch kelas + profile
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const resKelas = await Api.get("/profile/kelas-saya");
          setKelasUser(resKelas.data);

          const resProfile = await Api.get("/profile");
          setEditData(resProfile.data.data);
        } catch (err) {
          toast.error("Gagal mengambil data profile");
          console.error("Gagal ambil data profile:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();

      setProfilePic(storedUser?.photo || null);
    }
  }, [isOpen]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setUploading(true);
      const res = await Api.post("/profile/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPhotoUrl = res.data?.photoUrl;
      setProfilePic(newPhotoUrl);

      const updatedUser = { ...storedUser, photo: newPhotoUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Foto profil berhasil diperbarui");
    } catch (err) {
      toast.error("Upload foto gagal");
      console.error("Upload gagal:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await Api.put("/profile", {
        nama: editData.nama,
        no_hp: editData.no_hp,
      });

      const updatedUser = { ...storedUser, nama: editData.nama };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profil berhasil diperbarui");
      setMenuOpen(null);
    } catch (err) {
      toast.error("Gagal memperbarui profil");
      console.error("Update gagal:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-center" />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl py-4 px-8 w-full max-w-md mx-4 my-6 relative"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>

              {/* Avatar */}
              <div className="relative w-24 h-24 mt-4 mx-auto">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div
                    className="w-24 h-24 flex items-center justify-center rounded-full text-white font-bold text-2xl shadow-lg"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {initials}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  {uploading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  ) : (
                    <Camera className="w-6 h-6 text-gray-600 hover:text-gray-800 transition" />
                  )}
                </label>
              </div>

              {/* Info */}
              <h2 className="mt-4 text-2xl font-bold text-gray-800 text-center capitalize">
                {editData.nama}
              </h2>
              <div className="flex justify-center mt-3">
                <span className="inline-block px-4 py-1 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow">
                  {kelasUser?.nama_kelas || "Belum ada kelas"}
                </span>
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Menu */}
              <div className="space-y-2">
                <button
                  onClick={() => setMenuOpen("edit")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setMenuOpen("password")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <Key className="w-5 h-5 text-gray-600" />
                  <span>Ganti Password</span>
                </button>
                <button
                  onClick={() => setMenuOpen("about")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                  <span>Tentang</span>
                </button>
                <button
                  onClick={() => setMenuOpen("help")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span>Bantuan</span>
                </button>
              </div>
              <hr className="my-4 border-gray-200" />

              {/* Overlay loading */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl">
                  <svg
                    className="animate-spin h-10 w-10 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Edit Profile */}
      <EditProfileModal
        isOpen={menuOpen === "edit"}
        onClose={() => setMenuOpen(null)}
        editData={editData}
        setEditData={setEditData}
        handleSaveProfile={handleSaveProfile}
        saving={saving}
      />

      <PasswordModal
        isOpen={menuOpen === "password"}
        onClose={() => setMenuOpen(null)}
      />

      <AboutModal
        isOpen={menuOpen === "about"}
        onClose={() => setMenuOpen(null)}
      />

      <HelpModal
        isOpen={menuOpen === "help"}
        onClose={() => setMenuOpen(null)}
      />
    </>
  );
};

export default ModalProfile;
