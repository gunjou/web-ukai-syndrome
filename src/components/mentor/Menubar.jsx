import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import ModalProfile from "./modal/ModalProfile";
import LoadingOverlay from "../../utils/LoadingOverlay";

import { FiBell, FiSearch, FiMenu } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaChalkboardTeacher } from "react-icons/fa";

const MenuBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showListKelasModal, setShowListKelasModal] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [isWaliKelas, setIsWaliKelas] = useState(false);

  const menuRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedKelas = JSON.parse(localStorage.getItem("namaKelas"));
  const userName = storedUser?.nama || "User";

  // Membuat avatar initial
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
    return `hsl(${hash % 360}, 50%, 45%)`;
  };

  const avatarColor = stringToColor(userName);

  // Fetch kelas mentor
  useEffect(() => {
    const fetchKelas = async () => {
      setLoading(true);
      try {
        const endpoint = isWaliKelas
          ? "/paket-kelas/wali-kelas"
          : "/paket-kelas/mentor";

        const response = await Api.get(endpoint);
        setKelasList(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil kelas:", error);
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      <div className="bg-white flex items-center justify-between px-3 sm:px-6 py-3 fixed top-0 w-full z-10 h-[65px] shadow-md">
        {/* LEFT: Hamburger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleSidebar(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <FiMenu size={22} className="text-gray-700" />
          </button>

          <span className="text-lg font-semibold text-gray-800 hidden sm:block">
            Mentor Panel
          </span>
        </div>

        {/* CENTER: Search */}
        <div className="hidden sm:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              className="w-full px-4 py-1.5 rounded-[20px] border border-gray-300 bg-transparent text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Search"
            />
            <button className="absolute right-0 top-0 bottom-0 px-3 py-1.5 bg-gray-300 text-white rounded-r-[20px] hover:bg-gray-400">
              <FiSearch size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT: kelas + notif + avatar */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Kelas */}
          <button
            onClick={() => setShowListKelasModal(true)}
            className="hidden sm:block px-3 py-1 border rounded-[15px] bg-white text-black shadow-sm text-sm hover:bg-gray-50"
          >
            {storedKelas ? storedKelas.namaKelas : "Pilih Kelas"}
          </button>

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
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg text-black">
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

      {/* MODAL PROFILE */}
      <ModalProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={storedUser}
        avatarColor={avatarColor}
        initials={initials}
      />

      {/* MODAL PILIH KELAS */}
      {showListKelasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm z-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-3xl relative shadow-lg"
          >
            <button
              onClick={() => setShowListKelasModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={22} />
            </button>

            {/* Toggle */}
            <div className="flex items-center gap-3 mt-2 mb-4">
              <span className="font-semibold text-gray-600 text-sm">
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
                ></div>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
              {kelasList.map((kelas) => (
                <div
                  key={kelas.id}
                  onClick={() => handleKelasClick(kelas)}
                  className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="p-3 rounded-full bg-yellow-500 text-white">
                    <FaChalkboardTeacher size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{kelas.nama_kelas}</p>
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
