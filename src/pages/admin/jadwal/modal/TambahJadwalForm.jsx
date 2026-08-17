import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Api from "../../../../utils/Api";

const TambahJadwalForm = ({
  setShowModal,
  fetchJadwal,
  currentPage,
  searchTerm,
  filterKelas,
  limit,
}) => {
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_paketkelas: "",
    id_mentor: "",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
    type_pertemuan: "ONLINE",
  });

  const [errors, setErrors] = useState({});

  // Fetch Kelas Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [kelasRes, mentorRes] = await Promise.all([
          Api.get("/paket-kelas?limit=999"),
          Api.get("/jadwal/mentor-dropdown"),
        ]);

        setKelasOptions(kelasRes.data?.data || []);
        setMentorOptions(mentorRes.data?.data || []);
      } catch (error) {
        console.error("Gagal mengambil data dropdown:", error);
        toast.error("Gagal memuat data dropdown");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_paketkelas) {
      newErrors.id_paketkelas = "Kelas harus dipilih";
    }
    if (!formData.id_mentor) {
      newErrors.id_mentor = "Mentor harus dipilih";
    }
    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
    }
    if (!formData.waktu_mulai) {
      newErrors.waktu_mulai = "Waktu mulai harus diisi";
    }
    if (!formData.waktu_selesai) {
      newErrors.waktu_selesai = "Waktu selesai harus diisi";
    }

    // Validate waktu_mulai < waktu_selesai
    if (formData.waktu_mulai && formData.waktu_selesai) {
      if (formData.waktu_mulai >= formData.waktu_selesai) {
        newErrors.waktu_selesai =
          "Waktu selesai harus lebih besar dari waktu mulai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id_paketkelas: parseInt(formData.id_paketkelas),
        id_mentor: parseInt(formData.id_mentor),
        tanggal: formData.tanggal,
        waktu_mulai: formData.waktu_mulai,
        waktu_selesai: formData.waktu_selesai,
        type_pertemuan: formData.type_pertemuan,
      };

      await Api.post("/jadwal", payload);
      toast.success("Jadwal berhasil ditambahkan");
      setShowModal(false);
      fetchJadwal(currentPage, searchTerm, filterKelas, limit);
    } catch (error) {
      console.error("Gagal menambah jadwal:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menambah jadwal";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm mt-2">Memuat data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Tambah Jadwal Baru
      </h2>

      {/* Kelas Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kelas <span className="text-red-500">*</span>
        </label>
        <select
          name="id_paketkelas"
          value={formData.id_paketkelas}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
            errors.id_paketkelas ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">-- Pilih Kelas --</option>
          {kelasOptions.map((kelas) => (
            <option key={kelas.id_paketkelas} value={kelas.id_paketkelas}>
              {kelas.nama_kelas}
            </option>
          ))}
        </select>
        {errors.id_paketkelas && (
          <p className="text-red-500 text-xs mt-1">{errors.id_paketkelas}</p>
        )}
      </div>

      {/* Mentor Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mentor <span className="text-red-500">*</span>
        </label>
        <select
          name="id_mentor"
          value={formData.id_mentor}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
            errors.id_mentor ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">-- Pilih Mentor --</option>
          {mentorOptions.map((mentor) => (
            <option key={mentor.id_user} value={mentor.id_user}>
              {mentor.nama} ({mentor.nickname})
            </option>
          ))}
        </select>
        {errors.id_mentor && (
          <p className="text-red-500 text-xs mt-1">{errors.id_mentor}</p>
        )}
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
            errors.tanggal ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.tanggal && (
          <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>
        )}
      </div>

      {/* Waktu Mulai & Selesai */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Waktu Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="waktu_mulai"
            value={formData.waktu_mulai}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
              errors.waktu_mulai ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.waktu_mulai && (
            <p className="text-red-500 text-xs mt-1">{errors.waktu_mulai}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Waktu Selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="waktu_selesai"
            value={formData.waktu_selesai}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
              errors.waktu_selesai ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.waktu_selesai && (
            <p className="text-red-500 text-xs mt-1">{errors.waktu_selesai}</p>
          )}
        </div>
      </div>

      {/* Tipe Pertemuan */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipe Pertemuan <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type_pertemuan"
              value="ONLINE"
              checked={formData.type_pertemuan === "ONLINE"}
              onChange={handleInputChange}
              className="w-4 h-4 text-red-500"
            />
            <span className="text-sm text-gray-700">ONLINE</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type_pertemuan"
              value="OFFLINE"
              checked={formData.type_pertemuan === "OFFLINE"}
              onChange={handleInputChange}
              className="w-4 h-4 text-red-500"
            />
            <span className="text-sm text-gray-700">OFFLINE</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 rounded-lg transition"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default TambahJadwalForm;
