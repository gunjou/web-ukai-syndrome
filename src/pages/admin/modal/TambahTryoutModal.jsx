import React, { useState } from "react";
import { toast } from "react-toastify";
import Api from "../../../utils/Api.jsx";

const TambahTryoutModal = ({ onClose, onRefresh }) => {
  const [judul, setJudul] = useState("");
  const [jumlahSoal, setJumlahSoal] = useState("");
  const [durasi, setDurasi] = useState("");
  const [maxAttempt, setMaxAttempt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul || !jumlahSoal || !durasi || !maxAttempt) {
      toast.warn("Semua field wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      await Api.post("/tryout", {
        judul,
        jumlah_soal: parseInt(jumlahSoal),
        durasi: parseInt(durasi),
        max_attempt: parseInt(maxAttempt),
      });

      toast.success("Tryout berhasil ditambahkan!");
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Gagal menambah tryout:", error);
      toast.error("Gagal menambah tryout!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">
        Tambah Tryout Baru
      </h2>

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
          placeholder="Contoh: 50"
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

      {/* Tombol */}
      <div className="flex justify-end gap-2 pt-2">
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
