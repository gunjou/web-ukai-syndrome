import { useState } from "react";
import AsyncSelect from "react-select/async";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const TambahPrivateForm = ({ setShowModal, fetchPrivateData }) => {
  const [formData, setFormData] = useState({
    id_mentor: null,
    id_peserta: null,
    nama_mentorship: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔍 Fungsi untuk mencari user (Mentor/Peserta) secara dinamis
  const loadOptions = async (inputValue, role) => {
    if (!inputValue) return []; // Jangan panggil API jika input kosong
    try {
      const response = await Api.get(
        `/kelas-private/user-selection?role=${role}&search=${inputValue}`,
      );
      const options = (response.data.data || []).map((user) => ({
        value: user.id_user,
        label: user.nama,
      }));
      return options;
    } catch (err) {
      console.error(`Gagal mengambil data ${role}:`, err);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_mentor || !formData.id_peserta) {
      toast.warn("Mentor dan Peserta wajib dipilih!");
      return;
    }

    setIsSubmitting(true);
    try {
      await Api.post("/kelas-private", formData);

      toast.success("Kelas Private berhasil ditambahkan!");

      if (typeof fetchPrivateData === "function") {
        await fetchPrivateData();
      }
      setShowModal(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-lg font-bold mb-4 text-center">
        Tambah Kelas Private Baru
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Nama Mentorship */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Nama Kelas Private (Opsional)
          </label>
          <input
            type="text"
            name="nama_mentorship"
            placeholder="Contoh: Private Nama Peserta"
            value={formData.nama_mentorship}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        {/* Dropdown Mentor (Async) */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Pilih Mentor
          </label>
          <AsyncSelect
            cacheOptions
            loadOptions={(val) => loadOptions(val, "mentor")}
            defaultOptions={false} // Jangan tampilkan data sebelum diketik
            placeholder="Ketik nama mentor..."
            onChange={(selected) =>
              setFormData((prev) => ({ ...prev, id_mentor: selected?.value }))
            }
            noOptionsMessage={({ inputValue }) =>
              !inputValue
                ? "Ketik untuk mencari mentor"
                : "Mentor tidak ditemukan"
            }
          />
        </div>

        {/* Dropdown Peserta (Async) */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Pilih Peserta
          </label>
          <AsyncSelect
            cacheOptions
            loadOptions={(val) => loadOptions(val, "peserta")}
            defaultOptions={false} // Jangan tampilkan data sebelum diketik
            placeholder="Ketik nama peserta..."
            onChange={(selected) =>
              setFormData((prev) => ({ ...prev, id_peserta: selected?.value }))
            }
            noOptionsMessage={({ inputValue }) =>
              !inputValue
                ? "Ketik untuk mencari peserta"
                : "Peserta tidak ditemukan"
            }
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2 transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-700 hover:bg-red-800 shadow-md"
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : null}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahPrivateForm;
