import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";

const MenuBar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "User";
  const namaPaket = storedUser?.nama_paket || "Premium";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Fungsi warna avatar random dari nama
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
  };

  const avatarColor = stringToColor(userName);

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
    <div className="bg-white text-white flex justify-between items-center p-4 sticky top-0 z-10">
      {/* Kiri: Nama Paket */}
      {/* <div className="text-base font-normal text-white bg-yellow-500 rounded-2xl px-4 py-1">
        {namaPaket}
      </div> */}

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Kanan: Avatar + Menu */}
      <div className="relative" ref={menuRef}>
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
                navigate("/profile");
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
  );
};

export default MenuBar;
