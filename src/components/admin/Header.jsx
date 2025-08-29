import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import homepage_img from "../../assets/logo_syndrome_kuning.png";
import { FiMenu, FiX } from "react-icons/fi";
import Api from "../../utils/Api.jsx";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Peserta", href: "/peserta" },
    { name: "Peserta Kelas", href: "/peserta/peserta-kelas" },
    { name: "Peserta Batch", href: "/batch/peserta-batch" },
    { name: "Batch", href: "/batch" },
    { name: "Kelas", href: "/kelas" },
    { name: "Mentor", href: "/mentor" },
    { name: "Mentor Kelas", href: "/mentor/mentor-kelas" },
    { name: "Modul", href: "/modul" },
    { name: "Materi", href: "/materi" },
    { name: "Laporan", href: "/laporan" },
  ];

  const isMenuActive = (item) => location.pathname === item.href;

  const handleLogout = async () => {
    try {
      await Api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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
      <nav className="flex-grow flex justify-center font-semibold space-x-2 hidden md:flex">
        {navItems.map((item) => (
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

      {/* Tombol Logout Desktop */}
      <div className="flex items-center gap-2 ml-auto hidden md:flex">
        <button
          onClick={handleLogout}
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
          {navItems.map((item) => (
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
              onClick={handleLogout}
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
