// src/User.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/users/Sidebar";
import MenuBar from "./components/users/Menubar";
import Video from "./pages/users/Video";
import Materi from "./pages/users/Materi";
import TryOut from "./pages/users/TryOut";
import HasilTO from "./pages/users/HasilTO";
import Modul from "./pages/users/Modul";

const User = () => {
  useEffect(() => {
    // Proteksi aktif
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        (e.ctrlKey && (e.key === "S" || e.key === "s")) ||
        (e.ctrlKey && (e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "X" || e.key === "x"))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        <MenuBar />
        <div className="p-6">
          <Routes>
            <Route path="/tryout/*" element={<TryOut />} />
            <Route path="/hasil-to" element={<HasilTO />} />

            {/* Route induk untuk video dengan nested routing */}
            <Route path="/video/*" element={<Video />} />
            <Route path="/materi/*" element={<Materi />} />
            <Route path="/modul/*" element={<Modul />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default User;
