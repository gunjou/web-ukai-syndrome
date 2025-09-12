import { useState, useEffect } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";

const TambahMentorForm = ({ showModal, fetchMentorData, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "123456",
    no_hp: "",
    id_paketkelas: "",
    id_paket: "",
    id_batch: "",
    nama_kelas: "",
    nama_paket: "",
    nama_batch: "",
  });

  const [kelasOptions, setKelasOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Tambahkan state untuk menampilkan status berhasil/gagal
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 🔹 Fetch daftar kelas dari API saat modal muncul
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

  // 🔹 Submit mentor
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await Api.post("/mentor", formData);

      if (res.status === 201) {
        const { status, data } = res.data;

        // 🔹 Notif sukses
        setSuccessMessage(
          `${status}\nNama: ${data.nama}\nEmail: ${data.email}`
        );
        setErrorMessage(null);

        // 🔹 Reset form
        setFormData({
          nama: "",
          email: "",
          password: "123456",
          no_hp: "",
          id_paketkelas: "",
          id_paket: "",
          id_batch: "",
          nama_kelas: "",
          nama_paket: "",
          nama_batch: "",
        });

        // 🔹 Trigger parent untuk fetch + tutup modal
        onSuccess?.();

        // Auto-hide setelah 3 detik
        setTimeout(() => setSuccessMessage(null), 3000);

        fetchMentorData?.();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, data } = error.response.data;

        // 🔹 Notif error
        setErrorMessage({ message, data });
      } else {
        setErrorMessage({ message: "Gagal menambahkan mentor." });
      }
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="relative">
      {/* Notifikasi Sukses */}
      {successMessage && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-32 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 w-full max-w-md text-center whitespace-pre-line">
          {successMessage}
        </div>
      )}

      {/* Notifikasi Error */}
      {errorMessage && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-32 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 w-full max-w-md">
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

      <h2 className="text-lg font-bold mb-4 text-center">Tambah Mentor Baru</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            placeholder="Nama Mentor"
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
            placeholder="Email Mentor"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Password (default, disabled) */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500"
          />
          <small className="text-gray-500">Password default 123456</small>
        </div>

        {/* No HP */}
        <div>
          <label className="block text-sm font-medium mb-1">No HP</label>
          <input
            type="text"
            name="no_hp"
            value={formData.no_hp}
            onChange={handleChange}
            placeholder="Nomor HP (opsional)"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Kelas (searchable dropdown) */}
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

        {/* Paket (auto dari kelas, disabled) */}
        <div>
          <label className="block text-sm font-medium mb-1">Paket</label>
          <input
            type="text"
            value={formData.nama_paket}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500"
          />
        </div>

        {/* Batch (auto dari kelas, disabled) */}
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
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-1 rounded-xl flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading && (
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
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahMentorForm;
