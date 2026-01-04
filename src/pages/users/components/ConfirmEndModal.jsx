import React from "react";
import {
  FiAlertCircle,
  FiXCircle,
  FiHelpCircle,
  FiMail,
  FiAlertTriangle,
} from "react-icons/fi";

const ConfirmEndModal = ({
  onCancel,
  onConfirm,
  raguCount = 0,
  unanswered = 0,
  failedCount = 0,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-2xl text-center space-y-6 relative">
        {/* ICON UTAMA */}
        {failedCount > 0 ? (
          <FiXCircle className="text-red-600 text-6xl mx-auto animate-pulse" />
        ) : (
          <FiAlertCircle className="text-yellow-500 text-6xl mx-auto animate-bounce" />
        )}

        {/* JUDUL */}
        <h2 className="text-3xl font-bold text-gray-800">
          {failedCount > 0 ? "Perhatian Serius!" : "Perhatian!"}
        </h2>

        {/* DETAIL INFO */}
        <div className="space-y-3 text-lg text-gray-700 text-left">
          {unanswered > 0 && (
            <div className="flex items-center gap-3">
              <FiMail className="text-red-600 text-xl" />
              <p>
                Masih ada{" "}
                <span className="font-bold text-red-600">{unanswered}</span>{" "}
                soal <b>belum dijawab</b>.
              </p>
            </div>
          )}

          {raguCount > 0 && (
            <div className="flex items-center gap-3">
              <FiHelpCircle className="text-yellow-600 text-xl" />
              <p>
                Masih ada{" "}
                <span className="font-bold text-yellow-600">{raguCount}</span>{" "}
                soal <b>ditandai ragu-ragu</b>.
              </p>
            </div>
          )}

          {failedCount > 0 && (
            <div className="flex items-center gap-3 text-red-600 font-semibold">
              <FiXCircle className="text-xl" />
              <p>
                Terdapat <span className="font-bold">{failedCount}</span>{" "}
                jawaban yang <b>belum tersimpan ke server</b>.
              </p>
            </div>
          )}

          {unanswered === 0 && raguCount === 0 && failedCount === 0 && (
            <p className="text-gray-600 text-center">
              Semua soal telah dijawab. Apakah Anda yakin ingin mengakhiri
              tryout?
            </p>
          )}
        </div>

        {/* WARNING TAMBAHAN */}
        {failedCount > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <FiAlertTriangle className="text-lg mt-0.5" />
            <p>
              <b>Disarankan</b> untuk memperbaiki jawaban yang gagal tersimpan
              sebelum mengakhiri tryout.
            </p>
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={onCancel}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Kembali
          </button>

          <button
            onClick={onConfirm}
            className={`text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all shadow-lg ${
              failedCount > 0
                ? "bg-red-700 hover:bg-red-800"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Tetap Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndModal;
