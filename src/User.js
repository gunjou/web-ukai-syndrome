// src/User.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/users/Sidebar";
import MenuBar from "./components/users/Menubar";
import Video from "./pages/users/Video";
import Materi from "./pages/users/Materi";
import TryOut from "./pages/users/TryOut";
import HasilTO from "./pages/users/HasilTO";
import Modul from "./pages/users/Modul";

const User = () => {
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
