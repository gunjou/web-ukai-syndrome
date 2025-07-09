import React, { useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import icon_folder from "../../assets/icon_folder.svg";

const Video = () => {
  const menuItems = [
    "Senku",
    "CPOB",
    "Ilmu Resep",
    "Obat",
    "Suntik",
    "Infeksi",
    "Covid-19",
    "Demam",
  ];

  const [path, setPath] = useState([]); // path array, ex: ["Karyawan", "Detail"]
  const [forwardStack, setForwardStack] = useState([]);

  const currentFolder = path[path.length - 1] || null;

  const handleOpenFolder = (folderName) => {
    setPath((prev) => [...prev, folderName]);
    setForwardStack([]);
  };

  const handleBack = () => {
    if (path.length > 0) {
      const newPath = path.slice(0, -1);
      setForwardStack((prev) => [path[path.length - 1], ...prev]);
      setPath(newPath);
    }
  };

  const handleForward = () => {
    if (forwardStack.length > 0) {
      const next = forwardStack[0];
      setForwardStack((prev) => prev.slice(1));
      setPath((prev) => [...prev, next]);
    }
  };

  const handleClickBreadcrumb = (index) => {
    setPath((prev) => prev.slice(0, index + 1));
    setForwardStack([]);
  };

  return (
    <div className="bg-white w-full h-auto p-4">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Video Explorer</h1>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={path.length === 0}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] transition ${
                path.length === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <HiArrowLeft className="text-lg" />
              Back
            </button>
            <button
              onClick={handleForward}
              disabled={forwardStack.length === 0}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] transition ${
                forwardStack.length === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Forward
              <HiArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Breadcrumb Path */}
        <div className="text-sm text-gray-700 mb-6 flex items-center flex-wrap">
          <span className="font-semibold mr-2">Path:</span>
          <button
            onClick={() => {
              setPath([]);
              setForwardStack([]);
            }}
            className="text-blue-600 hover:underline mr-1"
          >
            Video
          </button>
          {path.map((folder, index) => (
            <span key={index} className="flex items-center">
              <span className="mx-1">/</span>
              <button
                onClick={() => handleClickBreadcrumb(index)}
                className="text-blue-600 hover:underline"
              >
                {folder}
              </button>
            </span>
          ))}
        </div>

        {/* Folder Menu */}
        <div className="flex flex-wrap gap-6 p-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="relative bg-white w-[180px] h-[140px] shadow hover:shadow-lg transition border border-gray-200 rounded-lg cursor-pointer flex items-center justify-center flex-col pt-10"
              onClick={() => handleOpenFolder(item)}
            >
              {/* Floating Icon */}
              <img
                src={icon_folder}
                alt="Folder Icon"
                className="w-auto h-[6rem] absolute -top-5 left-1/2 transform -translate-x-1/2"
              />

              {/* Menu Item Text */}
              <div className="mt-2 text-center px-2">
                <span className="text-gray-700 font-medium text-base">
                  {item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Video;
