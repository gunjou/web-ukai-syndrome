import React, { useState } from "react";
import {
  FaGlobe,
  FaUsers,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaClipboardList,
  FaFileAlt,
  FaBook,
  FaUserTie,
  FaRegChartBar,
} from "react-icons/fa";
import { IoCreateSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Api from "../../utils/Api";
import logo from "../../assets/logo_syndrome_kuning.png";
import homepage_img from "../../assets/dokter_admin.png";
import garisKanan from "../../assets/garis-kanan.png";
import bgmaps from "../../assets/maps.png";
import ProfileDropdown from "./components/ProfileDropdown";

const HomeAdmin = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const navigate = useNavigate();

  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const nickname = user?.nickname;

  const confirmLogout = () => {
    const toastId = toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-800">
            Yakin ingin logout?
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                closeToast();

                // 1️⃣ FRONTEND LOGOUT (langsung)
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");

                // 2️⃣ BACKEND LOGOUT (tidak blocking)
                // Api.post("/auth/logout").catch((err) =>
                //   console.warn("Logout API gagal:", err)
                // );
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>

            <button
              onClick={closeToast}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        toastId: "confirm-logout",
        autoClose: false,
        closeButton: false,
        draggable: false,
        pauseOnHover: false,
      }
    );

    // OUTSIDE CLICK CLOSE
    const handleOutsideClick = (e) => {
      const toastEl = document.querySelector(".Toastify__toast");
      if (toastEl && !toastEl.contains(e.target)) {
        toast.dismiss(toastId);
        document.removeEventListener("mousedown", handleOutsideClick);
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 0);
  };

  const menus = [
    {
      label: "AKUN PUBLIK",
      link: "/akun-publik",
      icon: <FaGlobe className="text-yellow-500 text-sm" />,
    },
    {
      label: "PESERTA",
      link: "/peserta",
      icon: <FaUsers className="text-yellow-500 text-sm" />,
    },
    // {
    //   label: "PESERTA KELAS",
    //   link: "/peserta/peserta-kelas",
    //   icon: <FaUsers className="text-yellow-500 text-sm" />,
    // },
    // {
    //   label: "PESERTA BATCH",
    //   link: "/batch/peserta-batch",
    //   icon: <FaUsers className="text-yellow-500 text-sm" />,
    // },
    {
      label: "BATCH",
      link: "/batch",
      icon: <FaLayerGroup className="text-yellow-500 text-sm" />, // icon tumpukan
    },
    {
      label: "KELAS",
      link: "/kelas",
      icon: <FaChalkboardTeacher className="text-yellow-500 text-sm" />, // icon papan
    },
    {
      label: "MODUL",
      link: "/modul",
      icon: <FaBook className="text-yellow-500 text-sm" />, // icon buku
    },
    {
      label: "MATERI",
      link: "/materi",
      icon: <FaFileAlt className="text-yellow-500 text-sm" />, // icon file dokumen
    },
    {
      label: "MENTOR",
      link: "/mentor",
      icon: <FaUserTie className="text-yellow-500 text-sm" />, // icon orang berdasi
    },
    // {
    //   label: "MENTOR KELAS",
    //   link: "/mentor/mentor-kelas",
    //   icon: <FaChalkboardTeacher className="text-yellow-500 text-sm" />, // sama kayak kelas
    // },
    {
      label: "TRYOUT",
      link: "/tryout",
      icon: <IoCreateSharp className="text-yellow-500 text-sm" />, // icon laporan chart
    },
    {
      label: "LAPORAN",
      link: "/laporan",
      icon: <FaRegChartBar className="text-yellow-500 text-sm" />, // icon laporan chart
    },
  ];

  const menuByNickname = {
    superadmin: ["*"], // akses semua menu

    tryout: ["/tryout", "/laporan"],

    // contoh jika nanti ada role lain
    // mentor: [
    //   "/materi",
    //   "/modul",
    // ],
  };

  const filteredMenus = React.useMemo(() => {
    if (!nickname) return [];

    const allowedLinks = menuByNickname[nickname];

    if (!allowedLinks) return [];

    // wildcard → semua menu
    if (allowedLinks.includes("*")) return menus;

    // filter berdasarkan link
    return menus.filter((menu) => allowedLinks.includes(menu.link));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, menus]);

  const toggleSubmenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen w-auto bg-gradient-to-r from-[#a11d1d] to-[#531d1d] flex flex-col items-center relative">
      <img
        src={bgmaps}
        alt="Background Image"
        className="absolute top-0 right-0 pt-[90px] w-full h-full object-cover opacity-10"
      />

      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto opacity-40"
        alt="garis kanan"
      />

      {/* Header */}
      <div className="w-full flex items-center px-6 py-4 shadow-lg bg-white rounded-b-[40px] relative">
        {/* Logo kiri */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="h-8" />
        </div>

        {/* Judul tengah */}
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-biru-gelap m-0">
          Selamat Datang
        </h1>

        {/* KANAN: Profile + Logout */}
        <div className="ml-auto flex items-center gap-3">
          <ProfileDropdown />

          <button
            onClick={confirmLogout}
            className="bg-red-600 text-white px-4 py-1 rounded-full text-sm hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl px-4 mt-12 relative min-h-auto flex flex-col lg:flex-row">
        {/* Right Menu */}
        <div className="w-full lg:w-3/4 ml-auto text-center lg:text-right">
          <div className="text-3xl lg:text-6xl mt-1 font-bold lg:mt-6 text-white mb-2">
            SYNDROME UKAI
          </div>
          <div className="text-lg text-white font-normal mb-2 sm:mb-8 min-w-md leading-[20px]">
            Platform penyedia layanan pendidikan farmasi berbasis teknologi
            terbaik dan ter-murah
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 py-4 sticky z-10">
            {filteredMenus.map((item, idx) => (
              <div key={idx} className="relative">
                <Link to={item.link || "#"}>
                  <div
                    onClick={() => toggleSubmenu(idx)}
                    className="flex w-full h-14 pr-8 rounded-lg overflow-hidden shadow-md bg-[#f9f9f9] hover:brightness-95 transition cursor-pointer"
                  >
                    {/* Left Icon */}
                    <div className="lg:w-[40%] md:w-[40%] bg-yellow-500 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 mx-1.5">
                        {item.icon}
                      </div>
                    </div>

                    {/* Right Text */}
                    <div className="lg:w-[70%] flex flex-col justify-center pl-3 pr-2">
                      <div className="text-xs sm:text-sm text-left font-bold text-[#1f1f1f] whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Image */}
      <img
        src={homepage_img}
        alt="welcome"
        className="lg:max-h-[50%] max-h-[35%] object-contain absolute bottom-0 left-0"
      />
    </div>
  );
};

export default HomeAdmin;
