import React, { useState } from "react";
import { FiX, FiSave } from "react-icons/fi";
import Api from "../../../utils/Api.jsx";

const EditSoalModal = ({ data, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    pertanyaan: data.pertanyaan,
    pilihan_a: data.pilihan_a,
    pilihan_b: data.pilihan_b,
    pilihan_c: data.pilihan_c,
    pilihan_d: data.pilihan_d,
    pilihan_e: data.pilihan_e,
    jawaban_benar: data.jawaban_benar,
    pembahasan: data.pembahasan || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Api.put(`/soal-tryout/${data.id_soaltryout}/edit`, form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Gagal update soal:", err);
      alert("Gagal mengupdate soal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b bg-blue-600 text-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Edit Soal</h2>
          <button onClick={onClose} className="hover:text-red-300 transition">
            <FiX size={24} />
          </button>
        </div>

        {/* Isi Form */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-5">
            {/* Pertanyaan */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pertanyaan
              </label>
              <textarea
                name="pertanyaan"
                value={form.pertanyaan}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                required
              />
            </div>

            {/* Pilihan A–E */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["a", "b", "c", "d", "e"].map((huruf) => (
                <div key={huruf}>
                  <label className="text-sm font-medium text-gray-700">
                    Pilihan {huruf.toUpperCase()}
                  </label>
                  <input
                    type="text"
                    name={`pilihan_${huruf}`}
                    value={form[`pilihan_${huruf}`]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                    required
                  />
                </div>
              ))}
            </div>

            {/* Jawaban Benar */}
            <div className="max-w-xs">
              <label className="text-sm font-medium text-gray-700">
                Jawaban Benar
              </label>
              <select
                name="jawaban_benar"
                value={form.jawaban_benar}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                required
              >
                {["A", "B", "C", "D", "E"].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Pembahasan */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pembahasan (Opsional)
              </label>
              <textarea
                name="pembahasan"
                value={form.pembahasan}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-8 py-4 flex justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition text-sm"
          >
            <FiX className="inline mr-1" /> Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <FiSave size={16} />
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSoalModal;
