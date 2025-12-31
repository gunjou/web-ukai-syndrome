// src/Mentor.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/mentor/Sidebar";
import MenuBar from "./components/mentor/Menubar";
import Video from "./pages/mentor/Video";
import Materi from "./pages/mentor/Materi";
import Tryout from "./pages/mentor/TryOut";
import HasilTO from "./pages/mentor/HasilTO";
import { KelasProvider } from "./components/mentor/KelasContext";

const Mentor = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <KelasProvider>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* Top Navbar */}
        <MenuBar onToggleSidebar={setSidebarOpen} />

        {/* Layout Container */}
        <div className="flex pt-[65px]">
          {/* Sidebar */}
          <Sidebar
            isOpenExternal={sidebarOpen}
            onCloseExternal={setSidebarOpen}
          />

          {/* Content */}
          <main className="flex-1 p-4 md:ml-64 transition-all duration-300">
            <Routes>
              <Route path="/tryout" element={<Tryout />} />
              <Route path="/hasil-to" element={<HasilTO />} />
              <Route path="/video/*" element={<Video />} />
              <Route path="/materi/*" element={<Materi />} />
            </Routes>
          </main>
        </div>
      </div>
    </KelasProvider>
  );
};

export default Mentor;
