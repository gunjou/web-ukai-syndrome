import React from "react";
import { FiClock } from "react-icons/fi";

const TimeUpModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 text-center animate-fadeIn">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <FiClock className="text-red-500 text-3xl" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Waktu Habis!
        </h2>
        <p className="text-gray-600 mb-6">
          Waktu pengerjaan tryout telah berakhir. Jawabanmu akan disimpan
          otomatis.
        </p>

        <button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Akhiri Tryout
        </button>
      </div>
    </div>
  );
};

export default TimeUpModal;
