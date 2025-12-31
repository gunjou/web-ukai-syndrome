// src/components/users/Menubar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import ModalProfile from "./modal/ModalProfile";
import { FiBell, FiMenu, FiSun, FiMoon } from "react-icons/fi";

const MenuBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [kelasUser, setKelasUser] = useState(false);
  const [theme, setTheme] = useState("light");
  const menuRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "User";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  /* =======================
     THEME (DARK / LIGHT)
  ======================= */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
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
    handleKelasSaya();
  }, []);

  const handleKelasSaya = async () => {
    try {
      const res = await Api.get("/profile/kelas-saya");
      setKelasUser(res.data);
    } catch (err) {
      console.error("Gagal cek kelas saya:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await Api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* =======================
     CLOSE MENU OUTSIDE
  ======================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
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
            Dashboard
          </span>
        </div>

        {/* CENTER – SEARCH DIHAPUS */}

        {/* RIGHT */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Kelas */}
          <div className="hidden sm:block relative">
            <span className="absolute -top-2 left-3 bg-white dark:bg-gray-900 px-1 text-[10px] text-gray-500 rounded-lg">
              Kelas
            </span>
            <div className="px-3 py-1 border dark:border-gray-700 rounded-[15px] bg-white dark:bg-gray-800 text-black dark:text-white text-sm shadow-sm min-w-[100px] text-center">
              {kelasUser?.nama_kelas || "-"}
            </div>
          </div>

          {/* Toggle Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Toggle Theme"
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
              onClick={() => setShowMenu((prev) => !prev)}
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

      <ModalProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={storedUser}
        avatarColor={avatarColor}
        initials={initials}
      />
    </>
  );
};

export default MenuBar;
