import { useState, useEffect } from "react";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const EditModulForm = ({ modul, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    visibility: "hold",
  });

  const [loading, setLoading] = useState(false);

  // Isi formData dengan data lama
  useEffect(() => {
    if (modul) {
      setFormData({
        judul: modul.judul || "",
        deskripsi: modul.deskripsi || "",
        visibility: modul.visibility || "hold",
      });
    }
  }, [modul]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log(formData);
    try {
      await Api.put(`/modul/${modul.id_modul}`, formData);
      toast.success(`Modul "${formData.judul}" berhasil diperbarui!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Gagal edit modul:", err);
      toast.error("Gagal memperbarui modul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Edit Modul</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Judul Modul
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            required
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visibility
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className={`mt-1 block w-full border font-semibold px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${
                formData.visibility === "hold"
                  ? "text-yellow-600"
                  : formData.visibility === "open"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
          >
            <option value="hold">Hold</option>
            <option value="open">Open</option>
            <option value="close">Close</option>
          </select>
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
            className={`px-4 py-1 rounded-xl flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
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

export default EditModulForm;
