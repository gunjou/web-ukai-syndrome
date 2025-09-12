import { useState } from "react";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const TambahBatchForm = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    nama_batch: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validasi form sederhana
  const validateForm = () => {
    return (
      formData.nama_batch.trim() !== "" &&
      formData.tanggal_mulai.trim() !== "" &&
      formData.tanggal_selesai.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Semua field wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      await Api.post("/batch", formData);
      toast.success("Batch berhasil ditambahkan!");
      if (onRefresh) onRefresh(); // refetch data
      onClose(); // tutup modal
    } catch (error) {
      console.error("Gagal menambahkan batch:", error);
      toast.error("Gagal menambahkan batch. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold mb-4">Tambah Batch Baru</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Batch */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama Batch
          </label>
          <input
            type="text"
            name="nama_batch"
            value={formData.nama_batch}
            onChange={handleChange}
            required
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tanggal Mulai */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Mulai
          </label>
          <input
            type="date"
            name="tanggal_mulai"
            value={formData.tanggal_mulai}
            onChange={handleChange}
            required
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tanggal Selesai */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Selesai
          </label>
          <input
            type="date"
            name="tanggal_selesai"
            value={formData.tanggal_selesai}
            onChange={handleChange}
            required
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahBatchForm;
