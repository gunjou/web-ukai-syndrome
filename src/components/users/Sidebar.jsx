import { NavLink } from "react-router-dom";
import homepage_img from "../../assets/ukai-logo.svg";
import icon_file from "../../assets/icon_file.svg";
import icon_folder from "../../assets/icon_folder.svg";
import icon_pesan from "../../assets/icon_pesan.svg";
import icon_video from "../../assets/icon_video.svg";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white min-h-screen shadow-md hidden md:block fixed top-0 z-20">
      <div className="p-6 pl-4 text-2xl font-bold text-blue-600">
        <a className="flex justify-left" href="/home">
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
            <NavLink
              to="/dashboard/materi"
              className={({ isActive }) =>
                `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
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
              to="/dashboard/video"
              className={({ isActive }) =>
                `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
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
              to="/dashboard/soal-to"
              className={({ isActive }) =>
                `flex items-center space-x-3 text-lg font-semibold rounded-lg py-2 px-2 cursor-pointer
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
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
              to="/dashboard/hasil-to"
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
              <span>Hasil TO</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
