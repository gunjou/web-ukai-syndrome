import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { Link as RouterLink } from "react-router-dom";
import { MdOutlineArrowDropDown } from "react-icons/md";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-custom-bg fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <RouterLink to="/home" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
        </RouterLink>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center text-gray-700">
          <li>
            <RouterLink
              to="/home"
              className="flex items-center space-x-1 hover:text-blue-600"
            >
              Home
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/pembayaran" className="hover:text-blue-600">
              Pembayaran
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/dashboard/materi" className="hover:text-blue-600">
              Kelas Saya
            </RouterLink>
          </li>

          <RouterLink
            to="/"
            className="ml-4 bg-custom-biru text-white font-semibold px-6 py-2 rounded-[20px] hover:bg-blue-700 transition"
          >
            Logout
          </RouterLink>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(true)}>
            <FiMenu size={24} />
          </button>
        </div>
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
          <RouterLink to="/home" onClick={() => setIsOpen(false)}>
            Home
          </RouterLink>
          <RouterLink to="/pembayaran" onClick={() => setIsOpen(false)}>
            Pembayaran
          </RouterLink>
          <RouterLink to="/dashboard/materi" onClick={() => setIsOpen(false)}>
            Kelas Saya
          </RouterLink>

          <RouterLink
            to="/"
            className="bg-blue-600 text-white text-center font-semibold px-6 py-2 rounded-[20px] hover:bg-blue-700 transition"
            onClick={() => setIsOpen(false)}
          >
            Logout
          </RouterLink>
        </ul>
      </div>

      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
