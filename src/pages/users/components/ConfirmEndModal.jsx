import React from "react";
import { FiAlertCircle } from "react-icons/fi";

const ConfirmEndModal = ({ onCancel, onConfirm, raguCount = 0 }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-2xl text-center space-y-6 relative">
        {/* Ikon animasi */}
        <FiAlertCircle className="text-yellow-500 text-6xl mx-auto animate-bounce" />

        <h2 className="text-3xl font-bold text-gray-800">
          {raguCount > 0
            ? `Masih ada ${raguCount} soal yang ditandai ragu-ragu!`
            : "Konfirmasi Selesai Tryout"}
        </h2>
        <p className="text-gray-600 text-lg">
          {raguCount > 0
            ? "Apakah Anda tetap ingin mengirim jawaban dan mengakhiri tryout?"
            : "Apakah Anda yakin ingin mengirim jawaban dan mengakhiri tryout?"}
        </p>

        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={onCancel}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Akhiri Tryout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndModal;
