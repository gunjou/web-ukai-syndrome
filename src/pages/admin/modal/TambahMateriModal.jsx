// TambahMateriForm.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const TambahMateriForm = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    id_modul: "",
    tipe_materi: "document",
    judul: "", // ✅ judul materi tetap ada
    url_file: "",
    visibility: "hold", // default visibility materi
  });

  const [loading, setLoading] = useState(false);
  const [modulOptions, setModulOptions] = useState([]);

  // Fetch modul aktif
  useEffect(() => {
    const fetchModul = async () => {
      try {
        const res = await Api.get("/modul");
        setModulOptions(res.data.data);
      } catch (err) {
        console.error("Gagal fetch modul:", err);
        toast.error("Gagal mengambil data modul");
      }
    };
    fetchModul();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await Api.post("/materi", formData);
      toast.success(`Materi "${formData.judul}" berhasil ditambahkan!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Gagal tambah materi:", err);
      toast.error("Gagal menambahkan materi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Tambah Materi</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Modul (searchable dropdown) */}
        <div>
          <label className="block text-sm font-medium mb-1">Modul</label>
          <Select
            options={modulOptions.map((m) => ({
              value: m.id_modul,
              label: m.judul,
              deskripsi: m.deskripsi,
            }))}
            value={
              formData.id_modul
                ? modulOptions
                    .map((m) => ({
                      value: m.id_modul,
                      label: m.judul,
                      deskripsi: m.deskripsi,
                    }))
                    .find((opt) => opt.value === formData.id_modul)
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                id_modul: selected?.value || "",
              }))
            }
            placeholder="Pilih modul..."
            isClearable
            isSearchable
          />
        </div>

        {/* Judul Materi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Judul Materi
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            required
            placeholder="Masukkan judul materi"
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tipe Materi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipe Materi
          </label>
          <select
            name="tipe_materi"
            value={formData.tipe_materi}
            onChange={handleChange}
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="document">Document</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* URL File */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL / File Path
          </label>
          <input
            type="text"
            name="url_file"
            value={formData.url_file}
            onChange={handleChange}
            required
            placeholder="https://example.com/file.pdf"
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Visibility Materi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visibility Materi
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

export default TambahMateriForm;
