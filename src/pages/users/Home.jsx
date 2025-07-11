import React, { useState } from "react";
import { FaArrowDown } from "react-icons/fa";

import logo from "../../assets/logo.png";
import homepage_img from "../../assets/hompage_img.png";

const Home = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const menus = [
    {
      label: "USER",
      subs: ["Tambah User", "Kelola Hak Akses"],
    },
    { label: "SOAL", subs: ["Buat Soal", "Bank Soal"] },
    { label: "MATERI", subs: ["List Materi", "Upload Materi"] },
    { label: "VIDEO", subs: ["Tambah Video", "Video Saya"] },
    { label: "PAKET", subs: ["Buat Paket", "Kelola Paket"] },
    { label: "PENDAFTARAN", subs: ["Verifikasi", "Riwayat"] },
    { label: "LAPORAN", subs: ["Absensi", "Rekap Nilai"] },
    { label: "SYNC", subs: ["Sinkron Data", "Jadwal"] },
  ];

  const toggleSubmenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-custom-bg flex flex-col items-center relative">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-4 shadow-lg bg-white rounded-b-[40px]">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="h-8" />
        </div>
        <h1 className="text-xl font-semibold text-biru-gelap">
          Selamat Datang
        </h1>
        <button className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl px-4 mt-8 grid md:grid-cols-2 gap-6 items-center">
        {/* Left Image */}
        <div className="flex justify-center">
          <img
            src={homepage_img}
            alt="welcome"
            className="max-h-[400px] object-contain absolute bottom-0 left-0"
          />
        </div>

        {/* Right Menu */}
        <div className="text-right md:text-left">
          <div className="text-5xl text-right font-bold text-biru-gelap">
            SYNDROME UKAI
          </div>
          <div className="text-lg text-black font-normal text-right mt-1 mb-8 min-w-md leading-[20px]">
            Platform penyedia layanan pendidikan farmasi berbasis teknologi
            terbaik dan ter-murah
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
            {menus.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Main Menu Button */}
                <div
                  onClick={() => toggleSubmenu(idx)}
                  className="flex w-full h-12 pr-8 rounded-lg overflow-hidden shadow-md bg-[#f9f9f9] hover:brightness-95 transition cursor-pointer"
                >
                  {/* Left Icon */}
                  <div className="w-[35%] bg-[#0680DC] flex items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <FaArrowDown className="text-[#0680DC] text-sm" />
                    </div>
                  </div>

                  {/* Right Text */}
                  <div className="w-[65%] flex flex-col justify-center pl-3 pr-2">
                    <div className="text-sm font-bold text-[#1f1f1f]">
                      {item.label}
                    </div>
                  </div>
                </div>

                {/* Dropdown Submenu */}
                {openMenuIndex === idx && item.subs && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 overflow-hidden">
                    {item.subs.map((subItem, subIdx) => (
                      <div
                        key={subIdx}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                      >
                        {subItem}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
