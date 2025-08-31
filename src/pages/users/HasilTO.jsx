// src/pages/users/HasilTO.js
import React from "react";
import { useNavigate } from "react-router-dom";
import imgDev from "../../assets/dokter.png"; // sesuaikan path gambarnya

const HasilTO = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white px-6">
      <img
        src={imgDev}
        alt="Sedang Dalam Pengembangan"
        className="w-64 h-64 mb-4 object-contain"
      />

      <h1 className="text-xl font-bold text-red-800 mb-2">
        Sedang Dalam Pengembangan
      </h1>
      <p className="text-sm text-gray-600 text-center leading-6">
        Fitur Hasil Try Out akan segera hadir di update berikutnya
      </p>
    </div>
  );
};

export default HasilTO;
