import React, { useState } from "react";
import { toast } from "react-toastify";
import Api from "../../../utils/Api.jsx";

const TambahTryoutModal = ({ onClose, onRefresh }) => {
  const [judul, setJudul] = useState("");
  const [jumlahSoal, setJumlahSoal] = useState("");
  const [durasi, setDurasi] = useState("");
  const [maxAttempt, setMaxAttempt] = useState("");
  const [accessStartAt, setAccessStartAt] = useState("");
  const [accessEndAt, setAccessEndAt] = useState("");
  const [accessStartTime, setAccessStartTime] = useState(""); // Waktu mulai
  const [accessEndTime, setAccessEndTime] = useState(""); // Waktu selesai
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !judul ||
      !jumlahSoal ||
      !durasi ||
      !maxAttempt ||
      !accessStartAt ||
      !accessEndAt ||
      !accessStartTime ||
      !accessEndTime
    ) {
      toast.warn("Semua field wajib diisi!");
      return;
    }

    if (accessEndAt < accessStartAt) {
      toast.warn("Tanggal selesai harus setelah tanggal mulai!");
      return;
    }

    setIsSubmitting(true);
    try {
      await Api.post("/tryout", {
        judul,
        jumlah_soal: Number(jumlahSoal),
        durasi: Number(durasi),
        max_attempt: Number(maxAttempt),
        access_start_date: accessStartAt, // YYYY-MM-DD
        access_end_date: accessEndAt, // YYYY-MM-DD
        access_start_time: accessStartTime, // HH:MM
        access_end_time: accessEndTime, // HH:MM
        visibility: "hold", // Atur visibility sesuai kebutuhan
      });

      toast.success("Tryout berhasil ditambahkan!");
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Gagal menambah tryout:", error);
      toast.error(error?.response?.data?.message || "Gagal menambah tryout!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-0 z-20 bg-white pb-3 mt-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">
          Tambah Tryout Baru
        </h2>

        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-3 py-2 mx-1">
          📅 Tryout akan <b>terbuka otomatis</b> sesuai rentang tanggal yang
          dipilih.
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Judul Tryout
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            placeholder="Contoh: Tryout UKAI Batch 1"
          />
        </div>

        {/* Jumlah Soal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jumlah Soal
          </label>
          <input
            type="number"
            min="1"
            value={jumlahSoal}
            onChange={(e) => setJumlahSoal(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            placeholder="Contoh: 10"
          />
        </div>

        {/* Durasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Durasi (menit)
          </label>
          <input
            type="number"
            min="1"
            value={durasi}
            onChange={(e) => setDurasi(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            placeholder="Contoh: 90"
          />
        </div>

        {/* Max Attempt */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maksimum Percobaan
          </label>
          <input
            type="number"
            min="1"
            value={maxAttempt}
            onChange={(e) => setMaxAttempt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            placeholder="Contoh: 3"
          />
        </div>

        {/* Tanggal Mulai */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={accessStartAt}
            onChange={(e) => setAccessStartAt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
        </div>

        {/* Waktu Mulai */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Waktu Mulai
          </label>
          <input
            type="time"
            value={accessStartTime}
            onChange={(e) => setAccessStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
        </div>

        {/* Tanggal Selesai */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Selesai
          </label>
          <input
            type="date"
            value={accessEndAt}
            onChange={(e) => setAccessEndAt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
        </div>

        {/* Waktu Selesai */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Waktu Selesai
          </label>
          <input
            type="time"
            value={accessEndTime}
            onChange={(e) => setAccessEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ===== FOOTER BUTTON ===== */}
      <div className="sticky bottom-0 bg-white pt-3 border-t border-gray-200 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "bg-yellow-400" : "bg-yellow-500 hover:bg-yellow-600"
          } text-white px-4 py-2 rounded-lg`}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default TambahTryoutModal;
