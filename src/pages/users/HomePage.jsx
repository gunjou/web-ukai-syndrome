// HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/users/Navbar";
import Hero from "../../components/users/Hero";
import Features from "../../components/users/Features";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a11d1d] to-[#531d1d] flex flex-col items-center relative">
      <Navbar />
      <div className="w-full flex-1 justify-center">
        <Hero />
        <Features />
      </div>
    </div>
  );
};

export default HomePage;
