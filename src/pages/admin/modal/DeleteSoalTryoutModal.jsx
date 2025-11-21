import React from "react";
import { FiX, FiTrash2 } from "react-icons/fi";

const DeleteTryoutModal = ({ onClose, onConfirm, text }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6 relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
            <FiTrash2 size={28} />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-semibold text-center text-gray-800">
          Hapus Soal?
        </h2>
        <p className="text-gray-600 text-center mt-2">
          {text ||
            "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."}
        </p>

        {/* Tombol */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTryoutModal;
