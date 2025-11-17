import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import ModalProfile from "./modal/ModalProfile";
import { FiBell, FiSearch, FiMenu } from "react-icons/fi";

const MenuBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [kelasUser, setKelasUser] = useState(false);
  const menuRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "User";

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
    const hue = hash % 360;
    const saturation = 40 + (hash % 30);
    const lightness = 45 + (hash % 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const avatarColor = stringToColor(userName);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await handleKelasSaya();
      } catch (err) {
        console.error("Gagal fetch data:", err);
      }
    };
    fetchData();
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
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="bg-white flex items-center justify-between px-3 sm:px-6 py-3 fixed top-0 w-full z-10 h-[65px] ">
        {/* LEFT: Hamburger menu for mobile */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleSidebar(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <FiMenu size={22} className="text-gray-700" />
          </button>
          <span className="text-lg font-semibold text-gray-800 hidden sm:block">
            Dashboard
          </span>
        </div>

        {/* CENTER: Search bar */}
        <div className="hidden sm:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              className="w-full px-4 py-1.5 rounded-[20px] border border-gray-300 bg-transparent text-sm text-neutral-700 outline-none transition duration-200 ease-in-out focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              placeholder="Search"
              aria-label="Search"
            />
            <button
              className="absolute right-0 top-0 bottom-0 px-3 py-1.5 bg-gray-300 text-white rounded-r-[20px] hover:bg-gray-400 focus:outline-none"
              type="button"
            >
              <FiSearch size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT: kelas + bell + avatar */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Kelas */}
          <div className="hidden sm:block relative">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-gray-500">
              Kelas
            </span>
            <div className="px-3 py-1 border rounded-[15px] bg-white text-black text-sm shadow-sm min-w-[100px] text-center">
              {kelasUser?.nama_kelas || "-"}
            </div>
          </div>

          {/* Notifikasi */}
          <div className="relative">
            <FiBell className="w-6 h-6 text-gray-700 cursor-pointer" />
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
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-black">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
