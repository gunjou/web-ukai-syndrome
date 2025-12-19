import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ResultModal = ({ open, nilai, idHasilTryout, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[90%] max-w-md animate-[fadeIn_.3s]">
        <div className="flex flex-col items-center text-center">
          <FiCheckCircle className="text-green-600 text-5xl mb-3" />

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tryout Selesai!
          </h2>

          <p className="text-gray-600 mb-4">
            Terima kasih sudah menyelesaikan tryout ini.
          </p>

          <div className="bg-gray-100 rounded-lg p-4 w-full text-center border mb-6">
            <p className="text-gray-700">Nilai kamu:</p>
            <p className="text-4xl font-bold text-red-500">{nilai}</p>
          </div>

          {/* Container tombol dengan flex */}
          <div className="flex gap-4 w-full">
            <button
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-semibold"
              onClick={onClose}
            >
              Kembali
            </button>

            <button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold"
              onClick={() => {
                onClose();
                navigate(`/dashboard/hasil-to?id=${idHasilTryout}`);
              }}
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
