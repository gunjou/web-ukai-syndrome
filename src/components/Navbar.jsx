import { useState } from "react";
import { Link } from "react-scroll"; // Menggunakan Link dari react-scroll
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo_syndrome_kuning.png";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { Link as RouterLink } from "react-router-dom"; // Import Link dari react-router-dom untuk Login

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-l from-[#a11d1d] to-[#531d1d] fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="home" smooth={true} className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(true)}>
            <FiMenu size={24} />
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center text-white">
          <li>
            <Link
              to="capaian"
              smooth={true}
              offset={-70}
              className="flex items-center space-x-1 hover:bg-yellow-500 hover:rounded-lg px-1.5"
            >
              Capaian
            </Link>
          </li>
          <li>
            <Link
              to="mentor"
              smooth={true}
              offset={-70}
              className="flex items-center space-x-1 hover:bg-yellow-500 hover:rounded-lg px-1.5"
            >
              Mentor
            </Link>
          </li>
          <li>
            <Link
              to="modul"
              smooth={true}
              offset={-70}
              className="flex items-center space-x-1 hover:bg-yellow-500 hover:rounded-lg px-1.5"
            >
              Modul
            </Link>
          </li>
          <li>
            <Link
              to="program"
              smooth={true}
              offset={-70}
              className="flex items-center space-x-1 hover:bg-yellow-500 hover:rounded-lg px-1.5"
            >
              Program
            </Link>
          </li>
          <li>
            <Link
              to="download"
              smooth={true}
              offset={-70}
              className="flex items-center hover:bg-yellow-500 hover:rounded-lg px-1.5"
            >
              Download
            </Link>
          </li>
          <li>
            <Link
              to="about"
              smooth={true}
              offset={-70}
              className="flex items-center hover:bg-yellow-500 hover:rounded-lg px-1.5"
            >
              About
            </Link>
          </li>

          {/* Tombol Login tetap menggunakan RouterLink */}
          <RouterLink
            to="/login"
            className="ml-4 bg-yellow-500 text-white font-semibold px-6 py-1 rounded-[20px] hover:bg-yellow-700 transition"
          >
            Login
          </RouterLink>
        </ul>
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
          <li>
            <Link
              to="capaian"
              smooth={true}
              offset={-70}
              onClick={() => setIsOpen(false)}
            >
              Modul
            </Link>
          </li>
          <li>
            <Link
              to="modul"
              smooth={true}
              offset={-70}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="mentor"
              smooth={true}
              offset={-70}
              onClick={() => setIsOpen(false)}
            >
              Mentor
            </Link>
          </li>

          <li>
            <Link
              to="program"
              smooth={true}
              offset={-70}
              onClick={() => setIsOpen(false)}
            >
              Program
            </Link>
          </li>
          <li>
            <Link
              to="about"
              smooth={true}
              offset={-70}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li>

          {/* Tombol Login di mobile menu tetap menggunakan RouterLink */}
          <RouterLink
            to="/login"
            className="ml-4 bg-yellow-600 text-white text-center font-semibold px-6 py-2 rounded-[20px] hover:bg-yellow-700 transition"
          >
            Masuk
          </RouterLink>
        </ul>
      </div>

      {/* Overlay background (optional) */}
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
