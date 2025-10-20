// src/User.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/mentor/Sidebar";
import MenuBar from "./components/mentor/Menubar";
import Video from "./pages/mentor/Video";
import Materi from "./pages/mentor/Materi";
import Tryout from "./pages/mentor/TryOut";
import HasilTO from "./pages/mentor/HasilTO";
import { KelasProvider } from "./components/mentor/KelasContext";

const User = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        <KelasProvider>
          <MenuBar />
          <div className="p-6">
            <Routes>
              <Route path="/tryout" element={<Tryout />} />
              <Route path="/hasil-to" element={<HasilTO />} />

              {/* Route induk untuk video dengan nested routing */}
              <Route path="/video/*" element={<Video />} />
              <Route path="/materi/*" element={<Materi />} />
            </Routes>
          </div>
        </KelasProvider>
      </div>
    </div>
  );
};

export default User;
