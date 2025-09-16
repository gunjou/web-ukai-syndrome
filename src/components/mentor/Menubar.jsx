import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { KelasContext } from "./KelasContext";

import ModalProfile from "./modal/ModalProfile";

const MenuBar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);

  const { kelasList, kelasUser, gantiKelas } = useContext(KelasContext);

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

  // helper ambil label batch
  const getBatchLabel = (kelas) => {
    if (!kelas) return "";
    return kelas.batch || kelas.batch_ke || kelas.angkatan || null;
  };

  const handleChangeKelas = (e) => {
    const id = e.target.value;
    const selected = kelasList.find((k) => k.id_paketkelas == id);
    if (selected) {
      gantiKelas(selected); // update global state
      toast.success(
        `Kelas diganti ke ${selected.nama_kelas}${
          selected.batch ? ` (Batch ${selected.batch})` : ""
        }`
      );

      setTimeout(() => {
        window.location.reload(); // 🔄 reload halaman
      }, 800); // kasih delay biar toast sempat tampil
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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

        {/* Kanan: Dropdown Kelas */}
        <div className="relative inline-block mr-4">
          <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
            Kelas
          </span>
          <select
            value={kelasUser?.id_paketkelas || ""}
            onChange={handleChangeKelas}
            className="px-4 py-1 border rounded-[15px] bg-white text-black shadow-sm"
          >
            <option value="" disabled>
              Pilih Kelas
            </option>
            {kelasList.map((kelas) => (
              <option key={kelas.id_paketkelas} value={kelas.id_paketkelas}>
                {kelas.nama_kelas}{" "}
                {getBatchLabel(kelas) ? `(Batch ${getBatchLabel(kelas)})` : ""}
              </option>
            ))}
          </select>
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
