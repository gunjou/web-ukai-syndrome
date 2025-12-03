import { useState } from "react";
import { NavLink } from "react-router-dom";
import homepage_img from "../../assets/logo-1.svg";
import icon_file from "../../assets/icon_file.png";
import icon_folder from "../../assets/icon_folder.png";
import icon_pesan from "../../assets/icon_pesan.png";
import icon_video from "../../assets/icon_video.png";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const MenuItems = () => (
    <nav>
      <ul className="space-y-2 px-4">
        <li>
          <NavLink
            to="/mentor-dashboard/materi"
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`
            }
          >
            <img src={icon_folder} alt="Materi" className="h-auto w-7" />
            <span>Materi</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mentor-dashboard/video"
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`
            }
          >
            <img src={icon_video} alt="Video" className="h-auto w-7" />
            <span>Video</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mentor-dashboard/tryout"
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`
            }
          >
            <img src={icon_file} alt="TryOut" className="h-auto w-7" />
            <span>TryOut</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mentor-dashboard/hasil-to"
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
              ${
                isActive
                  ? "bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`
            }
          >
            <img src={icon_pesan} alt="Hasil TryOut" className="h-auto w-7" />
            <span>Hasil TryOut</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );

  return (
    <>
      {/* MOBILE BUTTON */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          <svg
            className="w-6 h-6 text-gray-800"
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
            className="fixed inset-0 bg-black bg-opacity-40 z-30"
            onClick={() => setOpen(false)}
          />

          <aside className="fixed left-0 top-0 w-64 bg-white h-full shadow-md z-40 md:hidden transition-transform">
            <div className="p-6 pl-4 flex justify-between items-center">
              <a href="/mentor-home">
                <img
                  src={homepage_img}
                  className="h-12 cursor-pointer"
                  alt="logo"
                />
              </a>
              <button onClick={() => setOpen(false)}>
                <svg
                  className="w-6 h-6"
                  stroke="currentColor"
                  fill="none"
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
            <MenuItems />
          </aside>
        </>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-white min-h-screen shadow-md hidden md:block fixed top-0 z-20">
        <div className="p-6 pl-4">
          <a href="/mentor-home">
            <img
              src={homepage_img}
              className="h-12 cursor-pointer"
              alt="logo"
            />
          </a>
        </div>
        <MenuItems />
      </aside>
    </>
  );
};

export default Sidebar;
