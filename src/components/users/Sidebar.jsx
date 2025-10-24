import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiX } from "react-icons/fi";
import homepage_img from "../../assets/logo-1.svg";
import icon_file from "../../assets/icon_file.png";
import icon_folder from "../../assets/icon_folder.png";
import icon_pesan from "../../assets/icon_pesan.png";
import icon_video from "../../assets/icon_video.png";

const Sidebar = ({ isOpenExternal, onCloseExternal }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronisasi state dari luar (dipicu oleh MenuBar)
  useEffect(() => {
    if (isOpenExternal !== undefined) setIsOpen(isOpenExternal);
  }, [isOpenExternal]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal(false);
  };

  const menuItems = [
    { to: "/dashboard/materi", icon: icon_folder, label: "Materi" },
    { to: "/dashboard/video", icon: icon_video, label: "Video" },
    { to: "/dashboard/tryout", icon: icon_file, label: "TryOut" },
    { to: "/dashboard/hasil-to", icon: icon_pesan, label: "Hasil TO" },
  ];

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <aside className="w-64 bg-white min-h-screen shadow-md hidden md:block fixed top-0 z-[2000]">
        <div className="p-6 pl-4">
          <a href="/home" className="flex justify-left">
            <img src={homepage_img} alt="Homepage Logo" className="h-12" />
          </a>
        </div>
        <nav>
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`
                  }
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="h-auto w-7"
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ===== Mobile Sidebar (Drawer) ===== */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[3000] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <img src={homepage_img} alt="Logo" className="h-10" />
          <button onClick={handleClose}>
            <FiX
              size={24}
              className="text-gray-700 hover:text-black transition"
            />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={handleClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 text-base font-semibold rounded-lg py-2 px-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`
                  }
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="h-auto w-6"
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ===== Overlay (blur + transparan) ===== */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 z-[2500]"
          onClick={handleClose}
        />
      )}
    </>
  );
};

export default Sidebar;
