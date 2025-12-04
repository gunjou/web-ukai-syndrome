import React from "react";
import { FiAlertCircle } from "react-icons/fi";

const ConfirmEndModal = ({
  onCancel,
  onConfirm,
  raguCount = 0,
  unanswered = 0,
}) => {
  const getMessage = () => {
    if (unanswered > 0 && raguCount > 0)
      return `Masih ada ${unanswered} soal belum dijawab dan ${raguCount} soal ditandai ragu-ragu!`;

    if (unanswered > 0) return `Masih ada ${unanswered} soal belum dijawab!`;

    if (raguCount > 0)
      return `Masih ada ${raguCount} soal yang ditandai ragu-ragu!`;

    return "Apakah Anda yakin ingin mengakhiri tryout?";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-2xl text-center space-y-6 relative">
        <FiAlertCircle className="text-yellow-500 text-6xl mx-auto animate-bounce" />

        <h2 className="text-3xl font-bold text-gray-800">Perhatian!</h2>

        <p className="text-gray-600 text-lg">{getMessage()}</p>

        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={onCancel}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Kembali
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Tetap Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndModal;
