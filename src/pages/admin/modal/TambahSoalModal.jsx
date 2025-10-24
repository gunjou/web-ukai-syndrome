import React, { useState } from "react";
import { FiX, FiSave } from "react-icons/fi";
import Api from "../../../utils/Api";

const TambahSoalModal = ({ idTryout, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nomor_urut: "",
    pertanyaan: "",
    pilihan_a: "",
    pilihan_b: "",
    pilihan_c: "",
    pilihan_d: "",
    pilihan_e: "",
    jawaban_benar: "A",
    pembahasan: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { id_tryout: idTryout, ...formData };
      await Api.post("/soal-tryout", payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Gagal menambahkan soal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-3 bg-gray-50 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            Tambah Soal Manual
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 transition"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Nomor urut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Urut
              </label>
              <input
                type="number"
                name="nomor_urut"
                value={formData.nomor_urut}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-red-400 outline-none"
              />
            </div>

            {/* Pertanyaan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pertanyaan
              </label>
              <textarea
                name="pertanyaan"
                value={formData.pertanyaan}
                onChange={handleChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-red-400 outline-none resize-none"
              />
            </div>

            {/* Pilihan A-E */}
            {["a", "b", "c", "d", "e"].map((opt) => (
              <div key={opt}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilihan {opt.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={`pilihan_${opt}`}
                  value={formData[`pilihan_${opt}`]}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-red-400 outline-none"
                />
              </div>
            ))}

            {/* Jawaban Benar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jawaban Benar
              </label>
              <select
                name="jawaban_benar"
                value={formData.jawaban_benar}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-red-400 outline-none"
              >
                {["A", "B", "C", "D", "E"].map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Pembahasan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pembahasan (Opsional)
              </label>
              <textarea
                name="pembahasan"
                value={formData.pembahasan}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-red-400 outline-none resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3 flex justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 text-sm transition"
          >
            <FiX size={14} /> Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm transition disabled:opacity-60"
          >
            <FiSave size={14} />
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahSoalModal;
