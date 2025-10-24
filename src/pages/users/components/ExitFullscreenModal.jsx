import React, { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

const ExitFullscreenModal = ({ onContinue, onEnd, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 menit

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout(); // otomatis akhiri tryout
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeout]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-3xl text-center space-y-6 relative">
        <FiAlertTriangle className="text-red-500 text-6xl mx-auto animate-bounce" />
        <h2 className="text-3xl font-bold text-gray-800">
          Anda keluar dari fullscreen!
        </h2>
        <p className="text-gray-600 text-lg">
          Pilih <span className="font-semibold">Lanjutkan</span> untuk kembali
          fullscreen atau <span className="font-semibold">Akhiri Tryout</span>.
        </p>
        <p className="text-red-500 font-bold text-xl">
          Otomatis akhiri tryout dalam: {formatTime(timeLeft)}
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Lanjutkan
          </button>
          <button
            onClick={onEnd}
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Akhiri Tryout
          </button>
        </div>
        <div className="absolute top-4 right-4 text-gray-400 text-sm">
          {/* Bisa ditambahkan ikon info atau close kecil jika mau */}
        </div>
      </div>
    </div>
  );
};

export default ExitFullscreenModal;
