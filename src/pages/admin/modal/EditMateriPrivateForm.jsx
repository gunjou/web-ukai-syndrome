import { useState } from "react";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const EditMateriPrivateForm = ({ materi, setEditMode, onRefresh }) => {
  const [formData, setFormData] = useState({
    judul: materi.judul || "",
    tipe_materi: materi.tipe_materi || "document",
    url_file: materi.url_file || "",
    visibility: materi.visibility || "hold",
    is_downloadable: materi.is_downloadable ?? 0,
    viewer_only: materi.viewer_only ?? true,
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
      await Api.put(
        `/kelas-private/materi/${materi.id_materi_private}`,
        formData,
      );
      toast.success("Materi berhasil diperbarui!");
      onRefresh();
      setEditMode(null); // Tutup form edit
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 animate-fadeIn">
      <h3 className="text-sm font-bold mb-4 text-blue-800 uppercase tracking-wider">
        Edit Materi Private
      </h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Judul Materi
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            URL File
          </label>
          <input
            type="url"
            name="url_file"
            value={formData.url_file}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Tipe
          </label>
          <select
            name="tipe_materi"
            value={formData.tipe_materi}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="document">Document</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
            Status
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
        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setEditMode(null)}
            className="px-4 py-2 text-xs font-bold text-gray-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold transition shadow-md"
          >
            {isSubmitting ? "Menyimpan..." : "Update Materi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMateriPrivateForm;
