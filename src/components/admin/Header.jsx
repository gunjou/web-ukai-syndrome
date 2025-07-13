import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import homepage_img from "../../assets/logo.png";
import { FaCaretDown } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import Api from "../../utils/Api.jsx"; // Axios instance

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Peserta",
      href: "/peserta",
      dropdown: [
        { name: "Peserta Kelas", href: "/peserta/peserta-kelas" },
        { name: "Settings", href: "/peserta/settings" },
      ],
    },
    { name: "Mentor", href: "/daftar-mentor", dropdown: [] },
    { name: "Batch", href: "/daftar-batch", dropdown: [] },
    { name: "Kelas", href: "/daftar-kelas", dropdown: [] },
    {
      name: "Soal",
      href: "/soal",
      dropdown: [
        { name: "Kategori 1", href: "/soal/kategori1" },
        { name: "Kategori 2", href: "/soal/kategori2" },
      ],
    },
    {
      name: "Materi",
      href: "/materi",
      dropdown: [{ name: "Upload", href: "/materi/upload" }],
    },
    { name: "Video", href: "/video", dropdown: [] },
    { name: "Paket", href: "/paket", dropdown: [] },
    { name: "Pendaftaran", href: "/pendaftaran", dropdown: [] },
    { name: "Laporan", href: "/laporan", dropdown: [] },
  ];

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const isMenuActive = (item) => {
    return (
      location.pathname === item.href ||
      item.dropdown.some((sub) => location.pathname === sub.href)
    );
  };

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
      <Link to="/home-admin">
        <img src={homepage_img} alt="Logo" className="h-10 cursor-pointer" />
      </Link>

      {/* Mobile Menu Button */}
      <div className="md:hidden ml-auto">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Desktop Menu */}
      <nav className="flex-grow flex justify-center font-semibold space-x-6 hidden md:flex">
        {navItems.map((item, index) => (
          <div key={item.name} className="relative group z-20">
            <Link
              to={item.href}
              className={`rounded-md p-2 flex items-center gap-2 transition-colors duration-200 ${
                isMenuActive(item)
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.name}
              {item.dropdown.length > 0 && (
                <FaCaretDown className="text-gray-300 text-sm" />
              )}
            </Link>

            {item.dropdown.length > 0 && (
              <div className="absolute left-0 hidden pt-2 space-y-2 bg-white shadow-lg group-hover:block w-48 z-40">
                {item.dropdown.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.href}
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      location.pathname === subItem.href
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button Desktop */}
      <div className="flex items-center gap-2 ml-auto hidden md:flex">
        <button
          onClick={handleLogout}
          className="py-1 px-4 bg-blue-600 text-white flex items-center justify-center rounded-full"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
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
          {navItems.map((item, index) => (
            <li key={item.name}>
              <div>
                <button
                  onClick={() => toggleDropdown(index)}
                  className={`flex items-center gap-2 p-2 w-full text-left ${
                    isMenuActive(item)
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                  {item.dropdown.length > 0 && (
                    <FaCaretDown className="text-gray-300 text-sm" />
                  )}
                </button>
                {activeDropdown === index && item.dropdown.length > 0 && (
                  <ul className="space-y-2 ml-4">
                    {item.dropdown.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-2 transition-colors duration-200 ${
                            location.pathname === subItem.href
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-blue-100"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
