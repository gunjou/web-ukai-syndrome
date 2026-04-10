import { useState } from "react";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const EditPrivateForm = ({ setShowModal, fetchPrivateData, initialData }) => {
  // initialData dikirim dari halaman utama saat tombol edit diklik
  const [namaMentorship, setNamaMentorship] = useState(
    initialData?.nama_mentorship || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaMentorship.trim()) {
      toast.warn("Nama kelas private tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Endpoint: /kelas-private/{id}
      await Api.put(`/kelas-private/${initialData.id_mentorship}`, {
        nama_mentorship: namaMentorship,
      });

      toast.success("Kelas Private berhasil diperbarui!");

      if (typeof fetchPrivateData === "function") {
        await fetchPrivateData(); // Refresh tabel utama
      }
      setShowModal(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal memperbarui data";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-lg font-bold mb-4 text-center">Edit Kelas Private</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Nama Mentorship / Kelas Private */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Nama Kelas Private
          </label>
          <input
            type="text"
            value={namaMentorship}
            onChange={(e) => setNamaMentorship(e.target.value)}
            placeholder="Masukkan nama kelas private baru"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-red-500 focus:ring-0 outline-none transition-all"
            required
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">
            * Perubahan ini hanya akan mengubah nama tampilan kelas private.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition shadow-md ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : null}
            {isSubmitting ? "Menyimpan..." : "Update Data"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPrivateForm;
