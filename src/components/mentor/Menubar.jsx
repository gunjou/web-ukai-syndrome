import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import ModalProfile from "./modal/ModalProfile";
const MenuBar = () => {
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
    const id = localStorage.getItem("kelas");
    try {
      if (id) {
        handleKelasSaya(id); // panggil API dengan id_paketkelas
      }
    } catch (err) {
      console.error("Gagal fetch data:", err);
    }
  }, []);

  const handleKelasSaya = async (id_paketkelas) => {
    try {
      const res = await Api.get(`/paket-kelas/${id_paketkelas}`);
      setKelasUser(res.data.data);
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
      <div className="bg-white text-white flex justify-between items-center p-4 sticky top-0 z-10">
        {/* Tengah: Search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              className="w-full px-4 py-1 rounded-[20px] border border-gray-300 bg-transparent text-base font-normal text-neutral-700 outline-none transition duration-200 ease-in-out focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              placeholder="Search"
              aria-label="Search"
            />
            <button
              className="absolute right-0 top-0 bottom-0 px-4 py-1.5 bg-gray-300 text-white rounded-r-[20px] hover:bg-gray-400 focus:outline-none"
              type="button"
            >
              🔍
            </button>
          </div>
        </div>

        {/* Kanan: Kelas */}
        <div className="relative inline-block mr-4">
          <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
            Kelas
          </span>
          <div className="px-4 py-1 border rounded-[15px] bg-white text-black shadow-sm">
            {kelasUser.nama_kelas}
          </div>
        </div>

        {/* Avatar + Menu */}
        <div className="relative mr-3" ref={menuRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shadow"
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
