import React from "react";

const DoubtWarningModal = ({ onConfirm, onCancel }) => (
  <div className="absolute inset-0 bg-black bg-opacity-60 z-[1000000] flex items-center justify-center">
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
      <div className="text-lg font-semibold mb-4 text-yellow-600">
        Masih ada jawaban yang ditandai ragu-ragu!
      </div>
      <div className="mb-6 text-gray-700">
        Apakah Anda yakin ingin menyelesaikan ujian?
      </div>
      <div className="flex gap-4 justify-center">
        <button
          className="px-4 py-2 rounded bg-green-600 text-white font-semibold"
          onClick={onConfirm}
        >
          Ya, Selesaikan
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-semibold"
          onClick={onCancel}
        >
          Kembali ke Ujian
        </button>
      </div>
    </div>
  </div>
);

export default DoubtWarningModal;
