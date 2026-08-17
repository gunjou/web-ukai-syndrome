import React, { useState } from "react";
import { toast } from "react-toastify";
import Api from "../../../../utils/Api";

const RescheduleJadwalModal = ({
  setShowModal,
  fetchJadwal,
  selectedId,
  initialData,
  currentPage,
  searchTerm,
  filterKelas,
  limit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tanggal_reschedule: initialData?.tanggal_reschedule || "",
    waktu_mulai_reschedule: initialData?.waktu_mulai_reschedule || "",
    waktu_selesai_reschedule: initialData?.waktu_selesai_reschedule || "",
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.tanggal_reschedule) {
      newErrors.tanggal_reschedule = "Tanggal reschedule harus diisi";
    }
    if (!formData.waktu_mulai_reschedule) {
      newErrors.waktu_mulai_reschedule = "Waktu mulai reschedule harus diisi";
    }
    if (!formData.waktu_selesai_reschedule) {
      newErrors.waktu_selesai_reschedule =
        "Waktu selesai reschedule harus diisi";
    }

    // Validate waktu_mulai < waktu_selesai
    if (formData.waktu_mulai_reschedule && formData.waktu_selesai_reschedule) {
      if (
        formData.waktu_mulai_reschedule >= formData.waktu_selesai_reschedule
      ) {
        newErrors.waktu_selesai_reschedule =
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
        tanggal_reschedule: formData.tanggal_reschedule,
        waktu_mulai_reschedule: formData.waktu_mulai_reschedule,
        waktu_selesai_reschedule: formData.waktu_selesai_reschedule,
      };

      await Api.patch(`/jadwal/${selectedId}`, payload);
      toast.success("Jadwal berhasil dijadwalkan ulang");
      setShowModal(false);
      fetchJadwal(currentPage, searchTerm, filterKelas, limit);
    } catch (error) {
      console.error("Gagal reschedule jadwal:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal reschedule jadwal";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Reschedule Jadwal
      </h2>

      {/* Info Jadwal Original */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-gray-700">
          <span className="font-semibold">Kelas:</span>{" "}
          {initialData?.nama_kelas}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Mentor:</span>{" "}
          {initialData?.nama_mentor}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Tanggal Original:</span>{" "}
          {new Date(initialData?.tanggal).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Jam Original:</span>{" "}
          {initialData?.waktu_mulai?.substring(0, 5)} -{" "}
          {initialData?.waktu_selesai?.substring(0, 5)}
        </p>
      </div>

      {/* Tanggal Reschedule */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tanggal Reschedule <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="tanggal_reschedule"
          value={formData.tanggal_reschedule}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
            errors.tanggal_reschedule ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.tanggal_reschedule && (
          <p className="text-red-500 text-xs mt-1">
            {errors.tanggal_reschedule}
          </p>
        )}
      </div>

      {/* Waktu Mulai & Selesai Reschedule */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Waktu Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="waktu_mulai_reschedule"
            value={formData.waktu_mulai_reschedule}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
              errors.waktu_mulai_reschedule
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.waktu_mulai_reschedule && (
            <p className="text-red-500 text-xs mt-1">
              {errors.waktu_mulai_reschedule}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Waktu Selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="waktu_selesai_reschedule"
            value={formData.waktu_selesai_reschedule}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition ${
              errors.waktu_selesai_reschedule
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.waktu_selesai_reschedule && (
            <p className="text-red-500 text-xs mt-1">
              {errors.waktu_selesai_reschedule}
            </p>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-600">
        <p>
          <span className="font-semibold">Catatan:</span> Tanggal dan waktu baru
          akan menjadi jadwal efektif untuk pertemuan ini.
        </p>
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
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-semibold py-2 rounded-lg transition"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Reschedule"}
        </button>
      </div>
    </form>
  );
};

export default RescheduleJadwalModal;
