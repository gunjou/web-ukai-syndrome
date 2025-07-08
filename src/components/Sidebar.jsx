import { FaHome, FaChartBar, FaCog } from "react-icons/fa";
import homepage_img from "../assets/logo.png";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white h-screen shadow-md hidden md:block z-20">
      <div className="p-6 text-2xl font-bold text-blue-600">
        {" "}
        <a href="/dashboard">
          <img
            src={homepage_img}
            alt="Homepage Logo"
            className="h-10 cursor-pointer"
          />
        </a>
      </div>
      <nav className="mt-8">
        <ul className="space-y-4 px-4 text-gray-700">
          <li className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer">
            <FaHome /> <span>Beranda</span>
          </li>
          <li className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer">
            <FaChartBar /> <span>Statistik</span>
          </li>
          <li className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer">
            <FaCog /> <span>Pengaturan</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
