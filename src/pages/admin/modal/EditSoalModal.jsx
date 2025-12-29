import React, { useState } from "react";
import { FiX, FiSave, FiImage } from "react-icons/fi";
import Api from "../../../utils/Api";
import apiUpload from "../../../utils/ApiUpload";

/* ===================== HELPERS ===================== */
const extractImageUrl = (html = "") => {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

const removeImgTag = (text = "") => text.replace(/<img[^>]*>/g, "").trim();

const uploadImage = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const res = await apiUpload.post("/upload/image", form);
  return res.data.url;
};
/* ================================================== */

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

  /* ===== GAMBAR PERTANYAAN ===== */
  const existingSoalImg = extractImageUrl(data.pertanyaan);
  const [gambarSoal, setGambarSoal] = useState(null);
  const [loadingSoal, setLoadingSoal] = useState(false);

  /* ===== GAMBAR PEMBAHASAN ===== */
  const existingPembahasanImg = extractImageUrl(data.pembahasan);
  const [gambarPembahasan, setGambarPembahasan] = useState(null);
  const [loadingPembahasan, setLoadingPembahasan] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* === Upload gambar pertanyaan === */
  const handleUploadSoal = async () => {
    if (!gambarSoal) return;
    setLoadingSoal(true);

    const url = await uploadImage(gambarSoal);
    setForm((prev) => ({
      ...prev,
      pertanyaan:
        removeImgTag(prev.pertanyaan) +
        `\n<img src="${url}" alt="gambar soal" />\n`,
    }));

    setGambarSoal(null);
    setLoadingSoal(false);
  };

  const resetSoalImage = () => {
    setGambarSoal(null);
    setForm((prev) => ({
      ...prev,
      pertanyaan: removeImgTag(prev.pertanyaan),
    }));
  };

  /* === Upload gambar pembahasan === */
  const handleUploadPembahasan = async () => {
    if (!gambarPembahasan) return;
    setLoadingPembahasan(true);

    const url = await uploadImage(gambarPembahasan);
    setForm((prev) => ({
      ...prev,
      pembahasan:
        removeImgTag(prev.pembahasan) +
        `\n<img src="${url}" alt="gambar pembahasan" />\n`,
    }));

    setGambarPembahasan(null);
    setLoadingPembahasan(false);
  };

  const resetPembahasanImage = () => {
    setGambarPembahasan(null);
    setForm((prev) => ({
      ...prev,
      pembahasan: removeImgTag(prev.pembahasan),
    }));
  };

  /* === SUBMIT === */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await Api.put(`/soal-tryout/${data.id_soaltryout}/edit`, form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal update soal");
    } finally {
      setLoading(false);
    }
  };
  /* ============================================== */

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-3 bg-blue-600 text-white flex justify-between">
          <h2 className="font-semibold text-lg">Edit Soal</h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
          <form className="space-y-6">
            {/* ================= PERTANYAAN ================= */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Pertanyaan</label>
                <label className="text-blue-600 text-sm flex items-center gap-1 cursor-pointer">
                  <FiImage /> Pilih Gambar
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setGambarSoal(e.target.files[0])}
                  />
                </label>
              </div>

              <textarea
                name="pertanyaan"
                value={form.pertanyaan}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded p-2"
              />

              {existingSoalImg && !gambarSoal && (
                <div className="mt-2">
                  <img
                    src={existingSoalImg}
                    className="max-h-40 border rounded"
                  />
                  <button
                    type="button"
                    onClick={resetSoalImage}
                    className="mt-2 text-xs bg-gray-200 px-3 py-1 rounded"
                  >
                    Reset Gambar
                  </button>
                </div>
              )}

              {gambarSoal && (
                <div className="mt-2 space-y-2">
                  <img
                    src={URL.createObjectURL(gambarSoal)}
                    className="max-h-40 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUploadSoal}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      {loadingSoal ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      type="button"
                      onClick={resetSoalImage}
                      className="text-xs bg-gray-200 px-3 py-1 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ================= PILIHAN A–E ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["a", "b", "c", "d", "e"].map((opt) => (
                <div key={opt}>
                  <label className="text-sm font-medium">
                    Pilihan {opt.toUpperCase()}
                  </label>
                  <input
                    type="text"
                    name={`pilihan_${opt}`}
                    value={form[`pilihan_${opt}`]}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </div>
              ))}
            </div>

            {/* ================= JAWABAN ================= */}
            <div className="max-w-xs">
              <label className="text-sm font-medium">Jawaban Benar</label>
              <select
                name="jawaban_benar"
                value={form.jawaban_benar}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                {["A", "B", "C", "D", "E"].map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= PEMBAHASAN ================= */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Pembahasan</label>
                <label className="text-blue-600 text-sm flex items-center gap-1 cursor-pointer">
                  <FiImage /> Pilih Gambar
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setGambarPembahasan(e.target.files[0])}
                  />
                </label>
              </div>

              <textarea
                name="pembahasan"
                value={form.pembahasan}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded p-2"
              />

              {existingPembahasanImg && !gambarPembahasan && (
                <div className="mt-2">
                  <img
                    src={existingPembahasanImg}
                    className="max-h-40 border rounded"
                  />
                  <button
                    type="button"
                    onClick={resetPembahasanImage}
                    className="mt-2 text-xs bg-gray-200 px-3 py-1 rounded"
                  >
                    Reset Gambar
                  </button>
                </div>
              )}

              {gambarPembahasan && (
                <div className="mt-2 space-y-2">
                  <img
                    src={URL.createObjectURL(gambarPembahasan)}
                    className="max-h-40 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUploadPembahasan}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      {loadingPembahasan ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      type="button"
                      onClick={resetPembahasanImage}
                      className="text-xs bg-gray-200 px-3 py-1 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="border-t bg-white px-6 py-4 flex justify-end gap-3 sticky bottom-0">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="
      inline-flex items-center gap-2
      px-5 py-2.5
      rounded-lg border border-gray-300
      text-gray-700 text-sm font-medium
      hover:bg-gray-100 hover:border-gray-400
      active:scale-[0.98]
      transition
    "
          >
            <FiX size={16} />
            Batal
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
      inline-flex items-center gap-2
      px-6 py-2.5
      rounded-lg
      bg-blue-600 text-white text-sm font-semibold
      hover:bg-blue-700
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
      disabled:opacity-60 disabled:cursor-not-allowed
      active:scale-[0.98]
      transition
    "
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <FiSave size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSoalModal;
