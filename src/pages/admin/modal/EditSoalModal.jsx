import React, { useState } from "react";
import { FiX, FiSave } from "react-icons/fi";
import Api from "../../../utils/Api.jsx";

const extractImageUrl = (html) => {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

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

  const [gambarPertanyaan, setGambarPertanyaan] = useState(null);
  const existingImage = extractImageUrl(data.pertanyaan);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload;

      if (gambarPertanyaan) {
        payload = new FormData();
        payload.append("pertanyaan", form.pertanyaan);
        payload.append("pilihan_a", form.pilihan_a);
        payload.append("pilihan_b", form.pilihan_b);
        payload.append("pilihan_c", form.pilihan_c);
        payload.append("pilihan_d", form.pilihan_d);
        payload.append("pilihan_e", form.pilihan_e);
        payload.append("jawaban_benar", form.jawaban_benar);
        payload.append("pembahasan", form.pembahasan);
        payload.append("gambar", gambarPertanyaan);
      } else {
        payload = form;
      }

      await Api.put(
        `/soal-tryout/${data.id_soaltryout}/edit`,
        payload,
        gambarPertanyaan
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {}
      );

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
        <div className="flex justify-between items-center px-8 py-4 border-b bg-blue-600 text-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Edit Soal</h2>
          <button onClick={onClose} className="hover:text-red-300 transition">
            <FiX size={24} />
          </button>
        </div>

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
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm bg-white"
                required
              />
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Gambar Pertanyaan
              </label>

              {existingImage && !gambarPertanyaan && (
                <img src={existingImage} className="w-40 mt-2 rounded border" />
              )}

              {gambarPertanyaan && (
                <img
                  src={URL.createObjectURL(gambarPertanyaan)}
                  className="w-40 mt-2 rounded border"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGambarPertanyaan(e.target.files[0])}
                className="mt-3"
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
                    className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm"
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
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm"
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
                Pembahasan
              </label>
              <textarea
                name="pembahasan"
                value={form.pembahasan}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 text-sm"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-8 py-4 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-400 rounded-md text-gray-700"
          >
            <FiX className="inline mr-1" /> Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
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
