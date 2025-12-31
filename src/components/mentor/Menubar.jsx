// src/components/mentor/Menubar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import ModalProfile from "./modal/ModalProfile";
import LoadingOverlay from "../../utils/LoadingOverlay";

import { FiBell, FiMenu, FiSun, FiMoon } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaChalkboardTeacher } from "react-icons/fa";

const MenuBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  // kelas
  const [showListKelasModal, setShowListKelasModal] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [isWaliKelas, setIsWaliKelas] = useState(false);

  // theme
  const [theme, setTheme] = useState("light");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedKelas = JSON.parse(localStorage.getItem("namaKelas"));
  const userName = storedUser?.nama || "Mentor";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  /* =======================
     THEME
  ======================= */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  /* =======================
     AVATAR COLOR
  ======================= */
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 55%, 50%)`;
  };
  const avatarColor = stringToColor(userName);

  /* =======================
     FETCH KELAS
  ======================= */
  useEffect(() => {
    const fetchKelas = async () => {
      setLoading(true);
      try {
        const endpoint = isWaliKelas
          ? "/paket-kelas/wali-kelas"
          : "/paket-kelas/mentor";

        const res = await Api.get(endpoint);
        setKelasList(res.data.data || []);
      } catch (err) {
        console.error("Gagal ambil kelas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKelas();
  }, [isWaliKelas]);

  const handleKelasClick = (kelas) => {
    localStorage.setItem("kelas", kelas.id_paketkelas);
    localStorage.setItem(
      "namaKelas",
      JSON.stringify({ namaKelas: kelas.nama_kelas })
    );
    setShowListKelasModal(false);
    window.location.href = "/mentor-dashboard/materi";
  };

  const handleLogout = async () => {
    try {
      await Api.post("/auth/logout");
    } catch {}
    localStorage.clear();
    navigate("/login");
  };

  /* =======================
     CLOSE MENU OUTSIDE
  ======================= */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {loading && <LoadingOverlay />}

      {/* NAVBAR */}
      <div className="bg-white dark:bg-gray-900 flex items-center justify-between px-3 sm:px-6 py-3 fixed top-0 w-full z-10 h-[65px] border-b dark:border-gray-700">
        {/* LEFT */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleSidebar(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiMenu size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
          <span className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
            Mentor Panel
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Kelas */}
          <button
            onClick={() => setShowListKelasModal(true)}
            className="hidden sm:block px-3 py-1 border dark:border-gray-700 rounded-[15px] bg-white dark:bg-gray-800 text-black dark:text-white text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {storedKelas?.namaKelas || "Pilih Kelas"}
          </button>

          {/* Toggle Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "light" ? (
              <FiMoon className="text-gray-700" />
            ) : (
              <FiSun className="text-yellow-400" />
            )}
          </button>

          {/* Notifikasi */}
          <div className="relative">
            <FiBell className="w-6 h-6 text-gray-700 dark:text-gray-200 cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              3
            </span>
          </div>

          {/* Avatar */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shadow text-sm"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PROFILE */}
      <ModalProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={storedUser}
        avatarColor={avatarColor}
        initials={initials}
      />

      {/* MODAL PILIH KELAS (DIPERTAHANKAN) */}
      {showListKelasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm z-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-3xl relative shadow-lg"
          >
            <button
              onClick={() => setShowListKelasModal(false)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-red-500"
            >
              <AiOutlineClose size={22} />
            </button>

            {/* Toggle Wali */}
            <div className="flex items-center gap-3 mt-2 mb-4">
              <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                Wali Kelas
              </span>
              <button
                onClick={() => setIsWaliKelas((p) => !p)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  isWaliKelas ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                    isWaliKelas ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
              {kelasList.map((kelas) => (
                <div
                  key={kelas.id}
                  onClick={() => handleKelasClick(kelas)}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                >
                  <div className="p-3 rounded-full bg-yellow-500 text-white">
                    <FaChalkboardTeacher size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">
                      {kelas.nama_kelas}
                    </p>
                    <p className="text-xs text-gray-500">{kelas.nama_batch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuBar;
