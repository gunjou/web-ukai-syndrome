// src/components/mentor/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import homepage_img from "../../assets/logo-1.svg";
import icon_file from "../../assets/icon_file.png";
import icon_folder from "../../assets/icon_folder.png";
import icon_pesan from "../../assets/icon_pesan.png";
import icon_video from "../../assets/icon_video.png";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const MenuItems = ({ isMobile }) => (
    <nav>
      <ul className="space-y-2 px-4">
        <li>
          <NavLink
            to="/mentor-dashboard/materi"
            onClick={() => isMobile && setOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer dark:text-gray-100
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-100"
              }`
            }
          >
            <img src={icon_folder} alt="Materi" className="w-7" />
            <span>Materi</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mentor-dashboard/video"
            onClick={() => isMobile && setOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer dark:text-gray-100
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-100"
              }`
            }
          >
            <img src={icon_video} alt="Video" className="w-7" />
            <span>Video</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mentor-dashboard/tryout"
            onClick={() => isMobile && setOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer dark:text-gray-100
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-100"
              }`
            }
          >
            <img src={icon_file} alt="Tryout" className="w-7" />
            <span>Tryout</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mentor-dashboard/hasil-to"
            onClick={() => isMobile && setOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer dark:text-gray-100
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-100"
              }`
            }
          >
            <img src={icon_pesan} alt="Hasil Tryout" className="w-7" />
            <span>Hasil Tryout</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );

  return (
    <>
      {/* MOBILE HAMBURGER */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md focus:outline-none focus:ring"
        >
          <svg
            className="w-6 h-6 text-gray-800 dark:text-gray-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 z-30"
            onClick={() => setOpen(false)}
          />

          <aside className="fixed left-0 top-0 w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 h-full shadow-md z-40 md:hidden transition-transform">
            <div className="p-6 pl-4 flex justify-between items-center">
              <a href="/mentor-home">
                <img
                  src={homepage_img}
                  alt="Logo"
                  className="h-12 cursor-pointer"
                />
              </a>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <svg
                  className="w-6 h-6 text-gray-800 dark:text-gray-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-2">
              <MenuItems isMobile />
            </div>
          </aside>
        </>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-900 min-h-screen border-r dark:border-gray-700 shadow-md hidden md:block fixed top-0 z-20">
        <div className="pt-4 px-4">
          <a href="/mentor-home">
            <img
              src={homepage_img}
              alt="Logo"
              className="h-12 cursor-pointer"
            />
          </a>
        </div>
        <div className="pt-4">
          <MenuItems />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
