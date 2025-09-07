// EditMentorForm.jsx
import { useState, useEffect } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditMentorForm = ({
  showModal,
  initialData,
  fetchMentorData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    no_hp: "",
    id_paketkelas: "",
    id_paket: "",
    id_batch: "",
    nama_kelas: "",
    nama_paket: "",
    nama_batch: "",
  });

  const [kelasOptions, setKelasOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Isi form dengan data awal mentor saat modal dibuka
  useEffect(() => {
    if (initialData && showModal) {
      setFormData({
        nama: initialData.nama || "",
        email: initialData.email || "",
        password: "", // kosong default
        no_hp: initialData.no_hp || "",
        id_paketkelas: initialData.id_paketkelas || "",
        id_paket: initialData.id_paket || "",
        id_batch: initialData.id_batch || "",
        nama_kelas: initialData.nama_kelas || "",
        nama_paket: initialData.nama_paket || "",
        nama_batch: initialData.nama_batch || "",
      });
    }
  }, [initialData, showModal]);

  // 🔹 Fetch daftar kelas
  useEffect(() => {
    if (showModal) {
      Api.get("/paket-kelas")
        .then((res) => setKelasOptions(res.data.data))
        .catch((err) => console.error("Gagal fetch kelas:", err));
    }
  }, [showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Update mentor
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // buang password kalau kosong
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      console.log("Payload:", payload); // Debug: cek payload

      await Api.put(`/mentor/${initialData.id_user}`, payload);

      toast.success(
        `Data mentor berhasil diperbarui!\nNama: ${formData.nama}\nEmail: ${formData.email}`
      );

      onSuccess?.(); // trigger close modal + refresh
      fetchMentorData?.();
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, data } = error.response.data;
        let alertText = message;
        if (data) {
          alertText += `\nNama: ${data.nama}\nEmail: ${data.email}`;
        }
        toast.error(alertText);
      } else {
        console.error("Gagal memperbarui mentor:", error);
        toast.error("Gagal memperbarui mentor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-center">Edit Mentor</h2>

      <form className="space-y-4" onSubmit={handleUpdate}>
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Password opsional */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Password (opsional)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Kosongkan jika tidak ingin diubah"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* No HP */}
        <div>
          <label className="block text-sm font-medium mb-1">No HP</label>
          <input
            type="text"
            name="no_hp"
            value={formData.no_hp}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Kelas */}
        <div>
          <label className="block text-sm font-medium mb-1">Kelas</label>
          <Select
            options={kelasOptions.map((k) => ({
              value: k.id_paketkelas,
              id_paket: k.id_paket,
              id_batch: k.id_batch,
              label: k.nama_kelas,
              paket: k.nama_paket,
              batch: k.nama_batch,
            }))}
            value={
              formData.id_paketkelas
                ? {
                    value: formData.id_paketkelas,
                    id_paket: formData.id_paket,
                    id_batch: formData.id_batch,
                    label: formData.nama_kelas,
                    paket: formData.nama_paket,
                    batch: formData.nama_batch,
                  }
                : null
            }
            onChange={(selected) => {
              setFormData((prev) => ({
                ...prev,
                id_paketkelas: selected?.value || "",
                id_paket: selected?.id_paket || "",
                id_batch: selected?.id_batch || "",
                nama_kelas: selected?.label || "",
                nama_paket: selected?.paket || "",
                nama_batch: selected?.batch || "",
              }));
            }}
            placeholder="Pilih kelas..."
            isClearable
            isSearchable
          />
        </div>

        {/* Paket */}
        <div>
          <label className="block text-sm font-medium mb-1">Paket</label>
          <input
            type="text"
            value={formData.nama_paket}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500"
          />
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-medium mb-1">Batch</label>
          <input
            type="text"
            value={formData.nama_batch}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500"
          />
        </div>

        {/* Tombol submit */}
        <div className="text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMentorForm;
