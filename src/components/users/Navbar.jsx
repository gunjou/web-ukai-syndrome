import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { MdOutlineArrowDropDown } from "react-icons/md";
import logo from "../../assets/logo.png";
import Api from "../../utils/Api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
    <nav className="bg-custom-bg fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center text-gray-700">
          <li>
            <Link
              to="/home"
              className="flex items-center space-x-1 hover:text-blue-600"
            >
              Home
            </Link>
          </li>
          <li>
            <Link to="/pembayaran" className="hover:text-blue-600">
              Pembayaran
            </Link>
          </li>
          <li>
            <Link to="/dashboard/materi" className="hover:text-blue-600">
              Kelas Saya
            </Link>
          </li>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 bg-custom-biru text-white font-semibold px-6 py-1 rounded-[20px] hover:bg-blue-700 transition"
          >
            Logout
          </button>
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
          <Link to="/home" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/pembayaran" onClick={() => setIsOpen(false)}>
            Pembayaran
          </Link>
          <Link to="/dashboard/materi" onClick={() => setIsOpen(false)}>
            Kelas Saya
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="bg-blue-600 text-white text-center font-semibold px-6 py-2 rounded-[20px] hover:bg-blue-700 transition"
          >
            Logout
          </button>
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
