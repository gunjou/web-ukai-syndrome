import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/users/Sidebar";
import MenuBar from "./components/users/Menubar";
import Video from "./pages/users/Video";
import Materi from "./pages/users/Materi";
import TryOut from "./pages/users/TryOut";
import HasilTO from "./pages/users/HasilTO";
import Modul from "./pages/users/Modul";

const User = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useEffect(() => {
  //   // Proteksi aktif
  //   const handleContextMenu = (e) => e.preventDefault();
  //   document.addEventListener("contextmenu", handleContextMenu);

  //   const handleKeyDown = (e) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
  //       (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
  //       (e.ctrlKey && (e.key === "S" || e.key === "s")) ||
  //       (e.ctrlKey && (e.key === "C" || e.key === "c")) ||
  //       (e.ctrlKey && (e.key === "X" || e.key === "x"))
  //     ) {
  //       e.preventDefault();
  //     }
  //   };
  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar / MenuBar */}
      <MenuBar onToggleSidebar={setSidebarOpen} />

      {/* Sidebar + Konten */}
      <div className="flex pt-[65px]">
        <Sidebar
          isOpenExternal={sidebarOpen}
          onCloseExternal={setSidebarOpen}
        />

        <main className="flex-1 p-4 md:ml-64 transition-all duration-300">
          <Routes>
            <Route path="/tryout/*" element={<TryOut />} />
            <Route path="/hasil-to" element={<HasilTO />} />
            <Route path="/video/*" element={<Video />} />
            <Route path="/materi/*" element={<Materi />} />
            <Route path="/modul/*" element={<Modul />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default User;
