// src/pages/users/MateriPrivate.jsx
import React, { useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import MateriPrivateListContent from "./MateriPrivateListContent";

const MateriPrivate = () => {
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const isVideo = location.pathname.includes("video-private");
  const basePath = isVideo
    ? "/dashboard/video-private"
    : "/dashboard/materi-private";
  const title = isVideo ? "Video Private Explorer" : "Materi Private Explorer";

  const handleBack = () => {
    if (backStack.length > 0) {
      const last = backStack[backStack.length - 1];
      setBackStack((prev) => prev.slice(0, -1));
      setForwardStack((prev) => [location.pathname, ...prev]);
      navigate(last);
    }
  };

  const handleForward = () => {
    if (forwardStack.length > 0) {
      const next = forwardStack[0];
      setForwardStack((prev) => prev.slice(1));
      setBackStack((prev) => [...prev, location.pathname]);
      navigate(next);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 w-full min-h-[80vh]">
      <div className="w-full bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[20px] shadow-sm">
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {title}
          </h1>

          {/* Tombol Navigasi */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={backStack.length === 0}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition ${
                backStack.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-md"
              }`}
            >
              <HiArrowLeft className="text-lg" /> Back
            </button>

            <button
              onClick={handleForward}
              disabled={forwardStack.length === 0}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition ${
                forwardStack.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-md"
              }`}
            >
              Forward <HiArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Path Bar */}
        <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-6 flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
          <span className="font-bold mr-2 uppercase tracking-widest text-gray-400">
            Path:
          </span>
          <span className="text-blue-600 font-semibold uppercase">Private</span>
          <span className="mx-2">/</span>
          <span className="capitalize">{isVideo ? "Videos" : "Documents"}</span>
        </div>

        {/* Render Content */}
        <Routes>
          <Route
            path="/"
            element={
              <MateriPrivateListContent tipe={isVideo ? "video" : "document"} />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default MateriPrivate;
