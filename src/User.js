import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // Pastikan Sidebar sudah ada
import Navbar from "./components/Menubar"; // Pastikan Navbar sudah ada
import Home from "./pages/Home";

const User = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <Routes>
            <Route path="/home" element={<Home />} />

            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default User;
