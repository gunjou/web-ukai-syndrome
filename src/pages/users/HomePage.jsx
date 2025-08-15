import React, { useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import Hero from "../../components/users/Hero";
import logo from "../../assets/logo.png";
import Navbar from "../../components/users/Navbar";
import Features from "../../components/users/Features";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a11d1d] to-[#531d1d] flex flex-col items-center relative">
      <Navbar />
      {/* Main Content */}
      <div className="w-full flex-1 justify-center">
        <Hero />
        <Features />
      </div>
    </div>
  );
};

export default HomePage;
