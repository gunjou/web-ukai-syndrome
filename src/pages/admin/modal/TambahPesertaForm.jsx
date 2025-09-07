import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";

const TambahPesertaForm = ({ setShowModal, fetchUsers }) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "123456", // default
    no_hp: "",
    id_kelas: null,
    id_batch: null,
  });

  const [kelasOptions, setKelasOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tambahkan state untuk menampilkan status berhasil/gagal
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 🔄 Ambil data kelas dari API
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await Api.get("/paket-kelas");
        const options = res.data.data
          .map((k) => ({
            value: k, // seluruh objek kelas
            label: k.nama_kelas, // untuk dropdown
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

  // 🔄 Saat pilih kelas → otomatis isi batch
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

    const kelas = selectedOption.value; // objek asli
    setFormData((prev) => ({
      ...prev,
      id_kelas: kelas.id_paketkelas,
      id_batch: kelas.id_batch,
      nama_batch: kelas.nama_batch || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Api.post("/peserta", formData);

      // Tampilkan notifikasi sukses dengan nama & email
      setSuccessMessage(
        `Peserta berhasil ditambahkan!\nNama: ${formData.nama}\nEmail: ${formData.email}`
      );
      setErrorMessage(null);

      // Auto hide setelah 3 detik
      setTimeout(() => setSuccessMessage(null), 3000);

      setFormData({
        nama: "",
        email: "",
        password: "123456",
        no_hp: "",
        id_kelas: null,
        id_batch: null,
      });
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, data } = error.response.data;
        setErrorMessage({ message, data });
      } else {
        setErrorMessage({ message: "Gagal menambahkan peserta." });
      }
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Notifikasi Sukses */}
        {successMessage && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-10 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 w-full max-w-md text-center whitespace-pre-line">
            {successMessage}
          </div>
        )}

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 w-full max-w-md">
            <strong className="font-bold">{errorMessage.message}</strong>
            {errorMessage.data && (
              <div className="mt-1 text-sm">
                <div>Nama: {errorMessage.data.nama}</div>
                <div>Email: {errorMessage.data.email}</div>
              </div>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              className="absolute top-1 right-2 text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <h2 className="text-lg font-bold mb-4 text-center">
          Tambah Peserta Baru
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              name="nama"
              placeholder="Nama Peserta"
              value={formData.nama}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email Peserta"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Password (default & disabled) */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
            <p className="text-xs text-gray-500">Default: 123456</p>
          </div>

          {/* No HP */}
          <div>
            <label className="block text-sm font-medium mb-1">No HP</label>
            <input
              type="text"
              name="no_hp"
              placeholder="08xxxx"
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
              onChange={handleSelectKelas}
              placeholder="Pilih kelas..."
              isSearchable
            />
          </div>

          {/* Batch (autofill, disabled) */}
          <div>
            <label className="block text-sm font-medium mb-1">Batch</label>
            <input
              type="text"
              value={formData.nama_batch || ""}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Tombol submit */}
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
      </div>
    </>
  );
};

export default TambahPesertaForm;
