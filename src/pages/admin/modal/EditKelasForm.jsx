import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const EditKelasForm = ({
  setShowModal,
  fetchKelas,
  selectedId,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    nama_kelas: initialData?.nama_kelas || "",
    deskripsi: initialData?.deskripsi || "",
    id_batch: initialData?.id_batch || null,
    id_paket: initialData?.id_paket || null,
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [paketOptions, setPaketOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔄 Ambil data batch & paket dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchRes, paketRes] = await Promise.all([
          Api.get("/batch"),
          Api.get("/paket"),
        ]);

        setBatchOptions(
          (batchRes.data.data || []).map((b) => ({
            value: b.id_batch,
            label: b.nama_batch,
          }))
        );

        setPaketOptions(
          (paketRes.data.data || []).map((p) => ({
            value: p.id_paket,
            label: p.nama_paket,
          }))
        );
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };
    fetchData();
  }, []);

  // input biasa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // dropdown
  const handleSelectBatch = (selected) => {
    setFormData((prev) => ({
      ...prev,
      id_batch: selected ? selected.value : null,
    }));
  };

  const handleSelectPaket = (selected) => {
    setFormData((prev) => ({
      ...prev,
      id_paket: selected ? selected.value : null,
    }));
  };

  // submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Api.put(`/paket-kelas/${selectedId}`, formData);

      toast.success(`Kelas "${formData.nama_kelas}" berhasil diperbarui!`);

      if (typeof fetchKelas === "function") {
        await fetchKelas(); // ✅ refresh daftar kelas
      }

      setShowModal(false); // ✅ tutup modal
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Gagal memperbarui kelas.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-lg font-bold mb-4 text-center">Edit Kelas</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Nama Kelas */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama Kelas</label>
          <input
            type="text"
            name="nama_kelas"
            placeholder="Masukkan nama kelas"
            value={formData.nama_kelas}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            name="deskripsi"
            placeholder="Tuliskan deskripsi kelas..."
            value={formData.deskripsi}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            rows="3"
            required
          />
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-medium mb-1">Batch</label>
          <Select
            options={batchOptions}
            value={
              batchOptions.find((opt) => opt.value === formData.id_batch) ||
              null
            }
            onChange={handleSelectBatch}
            placeholder="Pilih batch..."
            isSearchable
          />
        </div>

        {/* Paket */}
        <div>
          <label className="block text-sm font-medium mb-1">Paket</label>
          <Select
            options={paketOptions}
            value={
              paketOptions.find((opt) => opt.value === formData.id_paket) ||
              null
            }
            onChange={handleSelectPaket}
            placeholder="Pilih paket..."
            isSearchable
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting && (
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
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditKelasForm;
