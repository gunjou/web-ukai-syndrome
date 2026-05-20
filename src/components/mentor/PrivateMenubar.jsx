// src/components/mentor/PrivateMenubar.jsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ModalProfile from "./modal/ModalProfile";

import { FiBell, FiMenu, FiSun, FiMoon } from "react-icons/fi";

const PrivateMenubar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // theme
  const [theme, setTheme] = useState("light");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const userName = storedUser?.nama || "Mentor";

  const initials = userName
    .split(" ")
    .slice(0, 2)
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
     LOGOUT
  ======================= */
  const handleLogout = async () => {
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
      {/* NAVBAR */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 w-full h-[65px] z-50 px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Button */}
          <button
            onClick={() => onToggleSidebar(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FiMenu size={22} className="text-gray-700 dark:text-gray-200" />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white leading-none">
              Kelas Private
            </h1>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
              Kelola materi kelas private
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Toggle Theme */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === "light" ? (
              <FiMoon className="text-gray-700" />
            ) : (
              <FiSun className="text-yellow-400" />
            )}
          </button>

          {/* Notification */}
          <button className="relative w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <FiBell className="text-gray-700 dark:text-gray-200 text-lg" />

            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {/* Avatar */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shadow-md text-sm"
              style={{
                backgroundColor: avatarColor,
              }}
            >
              {initials}
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">
                    {userName}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mentor
                  </p>
                </div>

                {/* Menu */}
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white transition"
                >
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
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

export default PrivateMenubar;
