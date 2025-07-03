import React from "react";
import homepage_img from "../assets/logo.png";
import { FaCaretDown } from "react-icons/fa";

const Header = () => {
  const navItems = [
    { name: "User", href: "#", dropdown: ["Profile", "Settings"] },
    { name: "Soal", href: "#", dropdown: ["Category 1", "Category 2"] },
    { name: "Materi", href: "#", dropdown: ["Upload"] },
    { name: "Video", href: "#", dropdown: [] },
    { name: "Paket", href: "#", dropdown: [] },
    { name: "Pendaftaran", href: "#", dropdown: [] },
    { name: "Laporan", href: "#", dropdown: [] },
  ];

  const userName = "John Doe"; // Replace with dynamic user name if available
  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase(); // Get initials from name

  return (
    <header className="bg-white py-4 px-8 shadow flex justify-between items-center rounded-b-[40px]">
      <img src={homepage_img} alt="Homepage Logo" className="h-10" />

      {/* Centered menu */}
      <nav className="flex-grow flex justify-center font-semibold space-x-6">
        {navItems.map((item) => (
          <div key={item.name} className="relative group">
            {/* Main menu item with arrow */}
            <a
              href={item.href}
              className="text-gray-700 hover:bg-gray-200 rounded-md p-2 flex items-center gap-2"
              aria-label={item.name}
            >
              {item.name}
              {item.dropdown.length > 0 && (
                <FaCaretDown className="text-gray-300 text-sm" />
              )}
            </a>

            {/* Dropdown menu */}
            {item.dropdown.length > 0 && (
              <div className="absolute left-0 hidden pt-2 space-y-2 bg-white shadow-lg rounded-lg group-hover:block w-40">
                {item.dropdown.map((subItem, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    {subItem}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Profile initials */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;
