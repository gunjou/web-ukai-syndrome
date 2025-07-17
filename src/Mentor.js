// src/User.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/mentor/Sidebar";
import MenuBar from "./components/mentor/Menubar";
import Video from "./pages/mentor/Video";
import Materi from "./pages/mentor/Materi";
import SoalTO from "./pages/mentor/SoalTO";
import HasilTO from "./pages/mentor/HasilTO";

const User = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        <MenuBar />
        <div className="p-6">
          <Routes>
            <Route path="/soal-to" element={<SoalTO />} />
            <Route path="/hasil-to" element={<HasilTO />} />

            {/* Route induk untuk video dengan nested routing */}
            <Route path="/video/*" element={<Video />} />
            <Route path="/materi/*" element={<Materi />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default User;
