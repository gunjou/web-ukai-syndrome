import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Api, { CDN_ASSET_URL } from "../../utils/Api";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("paketTerpilih");
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-l from-[#a11d1d] to-[#531d1d] fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center space-x-2">
          <img
            src={`${CDN_ASSET_URL}/logo_syndrome_kuning.png`}
            alt="Logo"
            className="h-8 sm:h-10 w-auto"
          />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLogout}
            className="ml-4 bg-yellow-500 text-white font-semibold px-6 py-1 rounded-[20px] hover:bg-yellow-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={handleLogout}
            className="ml-4 bg-yellow-500 text-white font-semibold px-4 py-1 rounded-[20px] hover:bg-yellow-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
