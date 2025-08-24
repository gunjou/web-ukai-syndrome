import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo_syndrome_kuning.png";
import Api from "../../utils/Api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPaket, setHasPaket] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // cek apakah ada paket terpilih di localStorage
    const paket = localStorage.getItem("paketTerpilih");
    if (paket) {
      setHasPaket(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await Api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("paketTerpilih"); // hapus paket juga saat logout
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-l from-[#a11d1d] to-[#531d1d] fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center text-white">
          <li>
            <Link
              to="/home"
              className="flex items-center space-x-1 hover:text-yellow-600"
            >
              Home
            </Link>
          </li>

          {hasPaket && ( // hanya tampil kalau ada paket terpilih
            <li>
              <Link to="/pembayaran" className="hover:text-yellow-600">
                Pembayaran
              </Link>
            </li>
          )}

          <li>
            <Link to="/dashboard/materi" className="hover:text-yellow-600">
              Kelas Saya
            </Link>
          </li>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 bg-yellow-500 text-white font-semibold px-6 py-1 rounded-[20px] hover:bg-yellow-700 transition"
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
        <ul className="flex flex-col space-y-4 px-6 text-gray-800">
          <Link to="/home" onClick={() => setIsOpen(false)}>
            Home
          </Link>

          {hasPaket && (
            <Link to="/pembayaran" onClick={() => setIsOpen(false)}>
              Pembayaran
            </Link>
          )}

          <Link to="/dashboard/materi" onClick={() => setIsOpen(false)}>
            Kelas Saya
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="bg-yellow-500 text-white text-center font-semibold px-6 py-2 rounded-[20px] hover:bg-yellow-700 transition"
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
