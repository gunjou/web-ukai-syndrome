import React, { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import homepage_img from "../../assets/logo_syndrome_kuning.png";
import { FiMenu, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Api from "../../utils/Api.jsx";
import ProfileDropdown from "../../pages/admin/components/ProfileDropdown.jsx";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const nickname = user?.nickname;

  const navItems = [
    { name: "Akun Publik", href: "/akun-publik" },
    { name: "Peserta", href: "/peserta" },
    { name: "Mentor", href: "/mentor" },
    { name: "Batch", href: "/batch" },
    { name: "Kelas", href: "/kelas" },
    { name: "Modul", href: "/modul" },
    { name: "Materi", href: "/materi" },
    { name: "Tryout", href: "/tryout" },
    { name: "Laporan", href: "/laporan" },
    // { name: "Peserta Kelas", href: "/peserta/peserta-kelas" },
    // { name: "Peserta Batch", href: "/batch/peserta-batch" },
    // { name: "Mentor Kelas", href: "/mentor/mentor-kelas" },
  ];

  const menuByNickname = {
    superadmin: ["*"],

    tryout: ["/tryout", "/laporan"],
  };

  const filteredNavItems = useMemo(() => {
    if (!nickname) return [];
    const allowed = menuByNickname[nickname];
    if (!allowed) return [];
    if (allowed.includes("*")) return navItems;
    return navItems.filter((item) => allowed.includes(item.href));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, navItems]);

  const isMenuActive = (item) => location.pathname === item.href;

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

  return (
    <header className="bg-white py-4 px-8 shadow flex justify-between items-center rounded-b-[40px] sticky top-0 z-50">
      <Link to="/admin-home">
        <img src={homepage_img} alt="Logo" className="h-10 cursor-pointer" />
      </Link>

      {/* Tombol menu mobile */}
      <div className="md:hidden ml-auto">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Menu Desktop */}
      <nav className="absolute left-1/2 -translate-x-1/2 font-semibold space-x-2 hidden md:flex">
        {filteredNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`rounded-md p-2 flex items-center gap-2 transition-colors duration-200 ${
              isMenuActive(item)
                ? "bg-yellow-500 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Tombol Profile dan Logout Desktop */}
      <div className="flex items-center gap-2 ml-auto hidden md:flex">
        <ProfileDropdown />
        <button
          onClick={confirmLogout}
          className="py-1 px-4 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center rounded-full"
        >
          Logout
        </button>
      </div>

      {/* Menu Mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setIsOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        <ul className="flex flex-col space-y-4 px-6 text-gray-700">
          <li>
            <ProfileDropdown />
          </li>
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 p-2 w-full text-left ${
                  isMenuActive(item)
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={confirmLogout}
              className="py-2 px-4 bg-blue-500 text-white w-full text-center rounded-md"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
