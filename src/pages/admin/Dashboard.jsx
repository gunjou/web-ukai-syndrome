import React, { useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import { Link } from "react-router-dom"; // import Link for routing

import logo from "../../assets/logo.png";
import homepage_img from "../../assets/hompage_img.png";
import garisKanan from "../../assets/garis-kanan.png";
import bgmaps from "../../assets/maps.png";

const Dashboard = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const menus = [
    {
      label: "USER",
      link: "/user", // Add link to "USER" menu
    },
    { label: "SOAL", link: "/soal" }, // Add link to "SOAL" menu
    { label: "MATERI", link: "/materi" }, // Add link to "MATERI" menu
    { label: "VIDEO" },
    { label: "PAKET" },
    { label: "PENDAFTARAN" },
    { label: "LAPORAN" },
    // { label: "SYNC" },
  ];

  const toggleSubmenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-custom-bg flex flex-col items-center relative">
      <img
        src={bgmaps}
        alt="Background Image"
        className="absolute top-0 right-0 pt-[90px] w-full h-full object-cover opacity-10"
      />

      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px] h-screen w-auto"
      />
      <img
        src={garisKanan}
        className="absolute bottom-0 left-0 pt-[90px] h-screen w-auto rotate-180 transform"
      />
      {/* Header */}
      <div className="w-full flex items-center px-6 py-4 shadow-lg bg-white rounded-b-[40px] relative">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="h-8" />
        </div>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-biru-gelap m-0">
          Selamat Datang
        </h1>
        <button className="ml-auto bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl px-4 mt-12 relative min-h-auto flex">
        {/* Right Menu */}
        <div className="w-full md:w-3/4 ml-auto text-center md:text-right">
          <div className="text-5xl font-bold text-biru-gelap mb-2">
            SYNDROME UKAI
          </div>
          <div className="text-lg text-black font-normal mb-8 min-w-md leading-[20px]">
            Platform penyedia layanan pendidikan farmasi berbasis teknologi
            terbaik dan ter-murah
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 py-4">
            {menus.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Main Menu Button */}
                <Link to={item.link || "#"}>
                  {" "}
                  {/* Use Link for navigation */}
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
                      <div className="text-sm text-left font-bold text-[#1f1f1f]">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Dropdown Submenu */}
                {/* {openMenuIndex === idx && item.subs && (
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
                )} */}
              </div>
            ))}
          </div>
        </div>

        {/* Left Image absolute bottom left */}
      </div>
      <img
        src={homepage_img}
        alt="welcome"
        className="max-h-[300px] object-contain absolute bottom-0 left-0"
      />
    </div>
  );
};

export default Dashboard;
