import { NavLink } from "react-router-dom";
import homepage_img from "../../assets/logo-1.svg";
import icon_file from "../../assets/icon_file.png";
import icon_folder from "../../assets/icon_folder.png";
import icon_pesan from "../../assets/icon_pesan.png";
import icon_video from "../../assets/icon_video.png";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white min-h-screen shadow-md hidden md:block fixed top-0 z-20">
      <div className="p-6 pl-4 text-2xl font-bold text-blue-600">
        <a className="flex justify-left" href="/mentor-home">
          <img
            src={homepage_img}
            alt="Homepage Logo"
            className="h-12 cursor-pointer"
          />
        </a>
      </div>
      <nav className="">
        <ul className="space-y-2 px-4">
          <li>
            {/* <NavLink
              to="/dashboard/modul"
              className={({ isActive }) =>
                `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-200 text-gray-700"
                }`
              }
            >
              <img src={icon_folder} alt="Modul" className="h-auto w-7" />
              <span>Modul</span>
            </NavLink> */}
          </li>
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
              <img src={icon_file} alt="Soal TO" className="h-auto w-7" />
              <span>Soal TO</span>
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
              <img src={icon_pesan} alt="Hasil TO" className="h-auto w-7" />
              <span>Hasil TO</span>
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/mentor-dashboard/settings"
              className={({ isActive }) =>
                `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-200 text-gray-700"
                }`
              }
            >
              <img src={icon_pesan} alt="Hasil TO" className="h-auto w-7" />
              <span>Settings</span>
            </NavLink>
          </li> */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
