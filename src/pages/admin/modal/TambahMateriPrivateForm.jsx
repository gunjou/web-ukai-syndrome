import { useState } from "react";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const TambahMateriPrivateForm = ({ idMentorship, setShowForm, onRefresh }) => {
  const [formData, setFormData] = useState({
    tipe_materi: "document",
    judul: "",
    url_file: "",
    visibility: "hold",
    is_downloadable: 0,
    viewer_only: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_downloadable" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // POST /kelas-private/{id_mentorship}/materi
      await Api.post(`/kelas-private/${idMentorship}/materi`, formData);

      toast.success("Materi private berhasil ditambahkan!");
      onRefresh(); // Refresh list materi
      setShowForm(false); // Sembunyikan form tambah
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 animate-fadeIn">
      <h3 className="text-sm font-bold mb-4 text-gray-700 uppercase tracking-wider">
        Tambah Materi Baru
      </h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Judul */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Judul Materi
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            placeholder="Masukkan judul materi"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {/* URL File */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            URL File (GDrive/YouTube)
          </label>
          <input
            type="url"
            name="url_file"
            value={formData.url_file}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Tipe Materi */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Tipe Materi
          </label>
          <select
            name="tipe_materi"
            value={formData.tipe_materi}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="document">Document (PDF)</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Status (Visibility)
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="hold">Hold</option>
            <option value="open">Open</option>
          </select>
        </div>

        {/* Downloadable */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Bisa Didownload?
          </label>
          <select
            name="is_downloadable"
            value={formData.is_downloadable}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value={0}>Tidak Boleh</option>
            <option value={1}>Boleh</option>
          </select>
        </div>

        {/* Tombol Aksi */}
        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg text-xs font-bold transition shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahMateriPrivateForm;
