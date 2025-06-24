import { FaHome, FaChartBar, FaCog } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white h-screen shadow-md hidden md:block">
      <div className="p-6 text-2xl font-bold text-red-600">SyndromeUkai</div>
      <nav className="mt-4">
        <ul className="space-y-4 px-4 text-gray-700">
          <li className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer">
            <FaHome /> <span>Beranda</span>
          </li>
          <li className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer">
            <FaChartBar /> <span>Menu</span>
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
