import React, { useState } from "react";
import { FiX, FiSave, FiImage } from "react-icons/fi";
import Api from "../../../utils/Api";
import apiUpload from "../../../utils/ApiUpload";

const removeImgTag = (text) => text.replace(/<img[^>]*>/g, "").trim();

const uploadImage = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const res = await apiUpload.post("/upload/image", form);
  return res.data.url;
};

const UploadBox = ({
  file,
  preview,
  onUpload,
  onReset,
  uploading,
  uploaded,
}) => (
  <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-2">
    <img
      src={preview}
      alt="preview"
      className="max-h-48 rounded-md border mx-auto"
    />

    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-600 truncate flex-1">
        {file?.name}
      </span>

      {!uploaded ? (
        <button
          type="button"
          onClick={onUpload}
          disabled={uploading}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md
                     hover:bg-blue-700 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md
                     hover:bg-gray-300"
        >
          Reset
        </button>
      )}
    </div>
  </div>
);

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

  const [uploadingSoal, setUploadingSoal] = useState(false);
  const [uploadingPembahasan, setUploadingPembahasan] = useState(false);
  const [gambar, setGambar] = useState(null); // Gambar untuk pertanyaan
  const [gambarPembahasan, setGambarPembahasan] = useState(null); // Gambar untuk pembahasan
  const [gambarUrl, setGambarUrl] = useState("");
  const [gambarPembahasanUrl, setGambarPembahasanUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const handleResetGambar = () => {
    setGambar(null);
    setUploadingSoal(false);

    setFormData((prev) => ({
      ...prev,
      pertanyaan: removeImgTag(prev.pertanyaan),
    }));
  };

  const handleResetGambarPembahasan = () => {
    setGambarPembahasan(null);
    setUploadingPembahasan(false);

    setFormData((prev) => ({
      ...prev,
      pembahasan: removeImgTag(prev.pembahasan),
    }));
  };

  // Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Upload gambar untuk pertanyaan
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setGambar(file);
  };

  // Upload gambar untuk pembahasan
  const handlePembahasanImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setGambarPembahasan(file);
  };

  const handleUploadGambar = async () => {
    if (!gambar) return;

    try {
      setUploadingSoal(true);
      const url = await uploadImage(gambar);

      setFormData((prev) => ({
        ...prev,
        pertanyaan:
          prev.pertanyaan + `\n<img src="${url}" alt="gambar soal" />\n`,
      }));
    } finally {
      setUploadingSoal(false);
    }
  };

  const handleUploadGambarPembahasan = async () => {
    if (!gambarPembahasan) return;

    try {
      setUploadingPembahasan(true);
      const url = await uploadImage(gambarPembahasan);

      setFormData((prev) => ({
        ...prev,
        pembahasan:
          prev.pembahasan + `\n<img src="${url}" alt="gambar pembahasan" />\n`,
      }));
    } finally {
      setUploadingPembahasan(false);
    }
  };

  const disableSubmit =
    loading ||
    (gambar && !formData.pertanyaan.includes("<img")) ||
    (gambarPembahasan && !formData.pembahasan.includes("<img"));

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id_tryout: idTryout,
        nomor_urut: formData.nomor_urut,
        pertanyaan: formData.pertanyaan,
        pilihan_a: formData.pilihan_a,
        pilihan_b: formData.pilihan_b,
        pilihan_c: formData.pilihan_c,
        pilihan_d: formData.pilihan_d,
        pilihan_e: formData.pilihan_e,
        jawaban_benar: formData.jawaban_benar,
        pembahasan: formData.pembahasan,
      };

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
                <>
                  <p className="text-xs text-gray-500">
                    Klik Upload sebelum menyimpan soal
                  </p>

                  <UploadBox
                    file={gambar}
                    preview={URL.createObjectURL(gambar)}
                    onUpload={handleUploadGambar}
                    onReset={handleResetGambar}
                    uploading={uploadingSoal}
                    uploaded={formData.pertanyaan.includes("<img")}
                  />
                </>
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

              {/* Upload Gambar Pembahasan */}
              <div className="flex justify-between items-center mb-1">
                <label className="text-blue-600 text-sm flex items-center gap-2 cursor-pointer hover:underline">
                  <FiImage />
                  Upload Gambar Pembahasan
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePembahasanImageSelect}
                  />
                </label>
              </div>

              <textarea
                name="pembahasan"
                value={formData.pembahasan}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-md px-3 py-1.5 resize-none"
              />

              {gambarPembahasan && (
                <>
                  <p className="text-xs text-gray-500">
                    Klik Upload sebelum menyimpan soal
                  </p>

                  <UploadBox
                    file={gambarPembahasan}
                    preview={URL.createObjectURL(gambarPembahasan)}
                    onUpload={handleUploadGambarPembahasan}
                    onReset={handleResetGambarPembahasan}
                    uploading={uploadingPembahasan}
                    uploaded={formData.pembahasan.includes("<img")}
                  />
                </>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
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
            disabled={disableSubmit}
            className="
      inline-flex items-center gap-2
      px-6 py-2.5
      rounded-lg
      bg-red-600 text-white text-sm font-semibold
      hover:bg-red-700
      focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
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
                Simpan Soal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahSoalModal;
