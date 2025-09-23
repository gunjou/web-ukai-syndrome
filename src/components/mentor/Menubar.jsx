import React, { useState, useRef, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { KelasContext } from "./KelasContext";
import { AiOutlineClose } from "react-icons/ai";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FiBell } from "react-icons/fi";

import ModalProfile from "./modal/ModalProfile";
import Api from "../../utils/Api";

const MenuBar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showListKelasModal, setShowListKelasModal] = useState(false);
  const [kelasList, setKelasList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedKelas, setSelectedKelas] = useState(null);
  const menuRef = useRef(null);

  // const { kelasList, kelasUser, gantiKelas } = useContext(KelasContext);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedKelas = JSON.parse(localStorage.getItem("namaKelas"));
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

  // ambil kelas yang diampu mentor
  useEffect(() => {
    const fetchKelas = async () => {
      setLoading(true);
      try {
        const response = await Api.get("/paket-kelas/mentor");
        setKelasList(response.data.data || []);
        console.log(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil kelas mentor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKelas();
  }, []);

  const handleKelasClick = (kelas) => {
    setSelectedKelas(kelas);
    localStorage.setItem("kelas", kelas.id_paketkelas);
    localStorage.setItem(
      "namaKelas",
      JSON.stringify({ namaKelas: kelas.nama_kelas })
    );
    setShowListKelasModal(false);
    window.location.href = "/mentor-dashboard/materi";
  };

  const onToggleWaliKelas = () => {
    setIsWaliKelas(true);
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

        {/* Kanan: Button Kelas */}
        <div className="flex items-center mr-4 space-x-3">
          <button
            onClick={() => setShowListKelasModal(true)}
            className="w-full text-left px-4 py-1 border rounded-[15px] bg-white text-black shadow-sm flex justify-between items-center hover:bg-gray-50"
          >
            {storedKelas ? storedKelas.namaKelas : "Pilih Kelas"}
            <svg
              className="w-4 h-4 ml-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {/* Notifikasi */}
          <div className="relative">
            <FiBell className="w-6 h-6 text-gray-700 cursor-pointer" />
            {/* Badge notif */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              3
            </span>
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

      {/* Modal List Kelas */}
      {showListKelasModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowListKelasModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowListKelasModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <div className="flex items-center space-x-4 pb-3">
              {/* Toggle Wali Kelas */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">
                  Wali Kelas
                </span>
                <button
                  onClick={onToggleWaliKelas}
                  className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                    isWaliKelas ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                      isWaliKelas ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
            <div className="w-full max-h-[60vh] overflow-y-auto py-4">
              {loading ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
                </div>
              ) : kelasList.length === 0 ? (
                <div className="text-white">Anda belum memiliki kelas.</div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 py-4 sticky z-10">
                  {kelasList.map((kelas, idx) => (
                    <div key={idx} className="relative">
                      <div
                        onClick={() => handleKelasClick(kelas)}
                        className="flex w-full h-14 pr-8 rounded-lg overflow-hidden shadow-md bg-[#f9f9f9] hover:brightness-95 transition cursor-pointer"
                      >
                        {/* Left Icon */}
                        <div className="lg:w-[40%] md:w-[40%] bg-yellow-500 flex items-center justify-center">
                          <div className="bg-white rounded-full p-3 mx-1.5">
                            <FaChalkboardTeacher className="text-yellow-500 text-sm" />
                          </div>
                        </div>

                        {/* Right Text */}
                        <div className="lg:w-[80%] flex flex-col justify-center pl-2 pr-2">
                          <div className="text-xs sm:text-sm text-left font-bold text-[#1f1f1f] capitalize">
                            {kelas.nama_kelas}
                          </div>
                          <div className="text-[10px] text-left text-gray-600">
                            {kelas.nama_batch}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuBar;
