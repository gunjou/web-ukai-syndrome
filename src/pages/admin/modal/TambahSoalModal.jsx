import React, { useState } from "react";
import { FiX, FiSave, FiImage } from "react-icons/fi";
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

  const [gambar, setGambar] = useState(null); // <-- FILE IMAGE
  const [loading, setLoading] = useState(false);

  // Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Upload file (frontend hanya simpan, backend yang handle)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setGambar(file);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();

      form.append("id_tryout", idTryout);
      form.append("nomor_urut", formData.nomor_urut);
      form.append("pertanyaan", formData.pertanyaan);
      form.append("pilihan_a", formData.pilihan_a);
      form.append("pilihan_b", formData.pilihan_b);
      form.append("pilihan_c", formData.pilihan_c);
      form.append("pilihan_d", formData.pilihan_d);
      form.append("pilihan_e", formData.pilihan_e);
      form.append("jawaban_benar", formData.jawaban_benar);
      form.append("pembahasan", formData.pembahasan);

      if (gambar) form.append("gambar", gambar); // <-- INI FILE GAMBAR

      await Api.post("/soal-tryout", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nomor Urut */}
            <div>
              <label className="block text-sm font-medium">Nomor Urut</label>
              <input
                type="number"
                name="nomor_urut"
                value={formData.nomor_urut}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-1.5"
              />
            </div>

            {/* Pertanyaan */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">Pertanyaan</label>

                <label className="text-blue-600 text-sm flex items-center gap-2 cursor-pointer hover:underline">
                  <FiImage />
                  Upload Gambar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>

              <textarea
                name="pertanyaan"
                value={formData.pertanyaan}
                onChange={handleChange}
                rows={3}
                required
                className="w-full border rounded-md px-3 py-1.5 resize-none"
              />

              {gambar && (
                <p className="text-xs text-green-600 mt-1">
                  Gambar dipilih: {gambar.name}
                </p>
              )}
            </div>

            {/* Pilihan Jawaban A–E */}
            {["a", "b", "c", "d", "e"].map((opt) => (
              <div key={opt}>
                <label className="block text-sm font-medium">
                  Pilihan {opt.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={`pilihan_${opt}`}
                  value={formData[`pilihan_${opt}`]}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-1.5"
                />
              </div>
            ))}

            {/* Jawaban Benar */}
            <div>
              <label className="block text-sm font-medium">Jawaban Benar</label>
              <select
                name="jawaban_benar"
                value={formData.jawaban_benar}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-1.5"
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
              <label className="text-sm font-medium">Pembahasan</label>
              <textarea
                name="pembahasan"
                value={formData.pembahasan}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-md px-3 py-1.5 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border rounded-md text-gray-600 hover:bg-gray-100"
          >
            <FiX size={14} /> Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
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
