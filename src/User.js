// src/User.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Menubar";
import Home from "./pages/users/Home";
import Video from "./pages/users/Video";
import Obat from "./pages/users/Obat";

const User = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <Routes>
            <Route path="/home" element={<Home />} />
            {/* Route induk untuk video dengan nested routing */}
            <Route path="/video/*" element={<Video />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default User;
