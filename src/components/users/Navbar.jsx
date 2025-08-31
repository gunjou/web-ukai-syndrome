import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // ✅ ganti Link → NavLink
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo_syndrome_kuning.png";
import Api from "../../utils/Api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPaket, setHasPaket] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    localStorage.removeItem("paketTerpilih");
    navigate("/");
  };

  const handleKelasSaya = async () => {
    try {
      const res = await Api.get("/auth/me");
      const user = res.data.data;

      if (!user || user.nama_kelas === null) {
        alert("Belum ada paket terdaftar. Silakan beli paket terlebih dahulu.");
      } else {
        navigate("/dashboard/materi");
      }
    } catch (err) {
      console.error("Gagal cek kelas saya:", err);
      alert("Terjadi kesalahan. Coba lagi.");
    }
  };

  return (
    <nav className="bg-gradient-to-l from-[#a11d1d] to-[#531d1d] fixed top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
        </NavLink>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center text-white">
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center space-x-1 hover:text-yellow-600 ${
                  isActive ? "text-yellow-400 font-semibold" : ""
                }`
              }
            >
              Home
            </NavLink>
          </li>

          {hasPaket && (
            <li>
              <NavLink
                to="/pembayaran"
                className={({ isActive }) =>
                  `hover:text-yellow-600 ${
                    isActive ? "text-yellow-400 font-semibold" : ""
                  }`
                }
              >
                Pembayaran
              </NavLink>
            </li>
          )}

          <li>
            <button onClick={handleKelasSaya} className="hover:text-yellow-600">
              Kelas Saya
            </button>
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
          <NavLink
            to="/home"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `hover:text-yellow-600 ${
                isActive ? "text-yellow-600 font-bold" : ""
              }`
            }
          >
            Home
          </NavLink>

          {hasPaket && (
            <NavLink
              to="/pembayaran"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `hover:text-yellow-600 ${
                  isActive ? "text-yellow-600 font-bold" : ""
                }`
              }
            >
              Pembayaran
            </NavLink>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              handleKelasSaya();
            }}
            className="text-left hover:text-yellow-600"
          >
            Kelas Saya
          </button>

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
