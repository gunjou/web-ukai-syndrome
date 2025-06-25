import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-50 fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
        </Link>

        {/*Mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(true)}>
            <FiMenu size={24} />
          </button>
        </div>

        {/* Desktop*/}
        <ul className="hidden md:flex space-x-6 items-center text-gray-700">
          <li>
            <Link to="/about" className="hover:text-blue-600">
              About
            </Link>
          </li>
          <li>
            <Link to="/features" className="hover:text-blue-600">
              Program
            </Link>
          </li>
          <li>
            <Link to="/mentor" className="hover:text-blue-600">
              Mentor
            </Link>
          </li>
          <li>
            <Link to="/capaian" className="hover:text-blue-600">
              Capaian
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </li>
          <Link
            to="/login"
            className="ml-4 bg-blue-600 text-white font-semibold px-6 py-2 rounded-[20px] hover:bg-blue-700 transition"
          >
            Masuk
          </Link>
        </ul>
      </div>

      {/* mobile */}
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
            <Link to="/about" onClick={() => setIsOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/program" onClick={() => setIsOpen(false)}>
              Program
            </Link>
          </li>
          <li>
            <Link to="/mentor" onClick={() => setIsOpen(false)}>
              Mentor
            </Link>
          </li>
          <li>
            <Link to="/capaian" onClick={() => setIsOpen(false)}>
              Capaian
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </li>
          <Link
            to="/login"
            className="ml-4 bg-blue-600 text-white text-center font-semibold px-6 py-2 rounded-[20px] hover:bg-blue-700 transition"
          >
            Masuk
          </Link>
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
