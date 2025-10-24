import React, { useState } from "react";
import Api from "../../../utils/Api";
import { FiUploadCloud, FiX } from "react-icons/fi";

const UploadSoalModal = ({ idTryout, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!idTryout) {
      return alert(
        "Data tryout tidak ditemukan. Pastikan Anda membuka dari tryout yang valid."
      );
    }

    if (!file) return alert("Pilih file terlebih dahulu!");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await Api.post(
        `/soal-tryout/upload-soal?id_tryout=${idTryout}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Upload soal berhasil!");
      onClose?.();
      onSuccess?.();
    } catch (err) {
      console.error("Upload gagal:", err);
      alert("Upload gagal, periksa format file Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] md:w-[450px] p-6 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Upload Soal Tryout
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 transition"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* File Picker */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer text-gray-600 hover:text-blue-600 transition flex flex-col items-center"
          >
            <FiUploadCloud size={40} className="mb-2" />
            <span>
              {file ? file.name : "Klik untuk pilih file .xlsx atau .csv"}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            {loading ? "Mengunggah..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSoalModal;
