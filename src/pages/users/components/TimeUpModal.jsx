import React, { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

const TimeUpModal = ({ onConfirm }) => {
  const [autoEndCountdown, setAutoEndCountdown] = useState(10);

  // Hitung mundur otomatis 10 detik
  useEffect(() => {
    if (autoEndCountdown <= 0) {
      onConfirm(); // otomatis akhiri tryout
      return;
    }

    const timer = setTimeout(() => {
      setAutoEndCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoEndCountdown, onConfirm]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg text-center space-y-6 relative">
        <FiClock className="text-red-500 text-7xl mx-auto animate-pulse" />

        <h2 className="text-3xl font-bold text-gray-800">Waktu Habis!</h2>
        <p className="text-gray-600 text-lg">
          Waktu pengerjaan tryout Anda telah berakhir. Klik tombol di bawah
          untuk mengakhiri tryout.
        </p>

        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Akhiri Tryout Sekarang
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          Tryout akan diakhiri otomatis dalam{" "}
          <span className="font-semibold text-red-500">{autoEndCountdown}</span>{" "}
          detik.
        </p>
      </div>
    </div>
  );
};

export default TimeUpModal;
