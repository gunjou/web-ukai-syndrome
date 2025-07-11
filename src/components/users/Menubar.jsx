import React from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api"; // sesuaikan jika path berbeda

const MenuBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-white text-white flex justify-between items-center p-4 sticky top-0 z-10">
      {/* Search Bar in the Center */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="search"
            className="w-full px-4 py-1 rounded-[20px] border border-gray-300 bg-transparent text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
            placeholder="Search"
            aria-label="Search"
          />
          <button
            className="absolute right-0 top-0 bottom-0 px-4 py-1.5 bg-gray-300 text-white rounded-r-[20px] hover:bg-gray-400 focus:outline-none"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="space-x-4">
        <button
          className="bg-blue-600 px-4 py-1 rounded-[20px] hover:bg-blue-500"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
