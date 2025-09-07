import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";

const EditPesertaForm = ({
  setShowModal,
  setEditMode,
  fetchUsers,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    nama: initialData.nama || "",
    email: initialData.email || "",
    password: "", // kosongkan jika tidak diubah
    no_hp: initialData.no_hp || "",
    id_kelas: initialData.id_paketkelas || null,
    id_batch: initialData.id_batch || null,
    nama_batch: initialData.nama_batch || "",
  });

  const [kelasOptions, setKelasOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data kelas
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await Api.get("/paket-kelas");
        const options = res.data.data
          .map((k) => ({
            value: k,
            label: k.nama_kelas,
          }))
          .sort((a, b) =>
            a.label.localeCompare(b.label, "id", { sensitivity: "base" })
          );
        setKelasOptions(options);
      } catch (err) {
        console.error("Gagal mengambil kelas:", err);
      }
    };
    fetchKelas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectKelas = (selectedOption) => {
    if (!selectedOption) {
      setFormData((prev) => ({
        ...prev,
        id_kelas: null,
        id_batch: null,
        nama_batch: "",
      }));
      return;
    }

    const kelas = selectedOption.value;
    setFormData((prev) => ({
      ...prev,
      id_kelas: kelas.id_paketkelas,
      id_batch: kelas.id_batch,
      nama_batch: kelas.nama_batch || "",
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await Api.put(`/peserta/${initialData.id_user}`, formData);
      alert(
        `Data peserta berhasil diperbarui!\nNama: ${formData.nama}\nEmail: ${formData.email}`
      );
      setShowModal(false);
      setEditMode(false);
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, data } = error.response.data;
        let alertText = message;
        if (data) {
          alertText += `\nNama: ${data.nama}\nEmail: ${data.email}`;
        }
        alert(alertText);
      } else {
        console.error("Gagal memperbarui peserta:", error);
        alert("Gagal memperbarui peserta.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-4 text-center">Edit Data Peserta</h2>
      <form className="space-y-4" onSubmit={handleUpdate}>
        {/* Nama (disable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Email (disable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
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

        {/* Kelas (dropdown searchable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Kelas</label>
          <Select
            options={kelasOptions}
            value={kelasOptions.find(
              (opt) => opt.value.id_paketkelas === formData.id_kelas
            )}
            onChange={handleSelectKelas}
            placeholder="Pilih kelas..."
            isSearchable
          />
        </div>

        {/* Batch (autofill, disable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Batch</label>
          <input
            type="text"
            value={formData.nama_batch || ""}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Password (kosongkan jika tidak diubah) */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Kosongkan jika tidak diubah"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Tombol Submit */}
        <div className="text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white ${
              isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </>
  );
};

export default EditPesertaForm;
