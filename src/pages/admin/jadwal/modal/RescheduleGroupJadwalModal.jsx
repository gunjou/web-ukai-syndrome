import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";
import GroupJadwalInfo from "./GroupJadwalInfo.jsx";

// ========================================================================
// MODAL - RESCHEDULE GROUP (v2)
// Diterapkan ke SEMUA jadwal kelas/kelompok dalam group yang sama
// ========================================================================

const toTime = (value) => (value ? String(value).substring(0, 5) : "");

const RescheduleGroupJadwalModal = ({ setShowModal, fetchJadwal, group }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tanggal_reschedule: group?.tanggal_reschedule || "",
    waktu_mulai_reschedule: toTime(group?.waktu_mulai_reschedule),
    waktu_selesai_reschedule: toTime(group?.waktu_selesai_reschedule),
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

    if (
      formData.waktu_mulai_reschedule &&
      formData.waktu_selesai_reschedule &&
      formData.waktu_mulai_reschedule >= formData.waktu_selesai_reschedule
    ) {
      newErrors.waktu_selesai_reschedule =
        "Waktu selesai harus lebih besar dari waktu mulai";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await Api.patch(
        `/jadwal/v2/group/${group.id_jadwal}/reschedule`,
        formData,
      );

      toast.success(
        response?.data?.message || "Jadwal berhasil dijadwalkan ulang",
      );

      setShowModal(false);
      fetchJadwal();
    } catch (error) {
      console.error("Gagal reschedule group jadwal:", error);
      toast.error(error.response?.data?.message || "Gagal reschedule jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="my-10 max-h-[90vh] w-[90%] max-w-md animate-fade-in-down overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Reschedule Jadwal
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Atur ulang tanggal dan waktu untuk semua jadwal di group ini
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors duration-200 hover:bg-yellow-500 hover:text-white"
              aria-label="Tutup modal"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <GroupJadwalInfo group={group} />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tanggal Reschedule <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_reschedule"
                value={formData.tanggal_reschedule}
                onChange={handleInputChange}
                className={inputClass("tanggal_reschedule")}
              />
              {errors.tanggal_reschedule && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.tanggal_reschedule}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="waktu_mulai_reschedule"
                  value={formData.waktu_mulai_reschedule}
                  onChange={handleInputChange}
                  className={inputClass("waktu_mulai_reschedule")}
                />
                {errors.waktu_mulai_reschedule && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.waktu_mulai_reschedule}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Waktu Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="waktu_selesai_reschedule"
                  value={formData.waktu_selesai_reschedule}
                  onChange={handleInputChange}
                  className={inputClass("waktu_selesai_reschedule")}
                />
                {errors.waktu_selesai_reschedule && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.waktu_selesai_reschedule}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-gray-600">
              <p>
                <span className="font-semibold">Catatan:</span> Reschedule
                akan diterapkan ke{" "}
                <span className="font-semibold">
                  {group?.count ?? group?.classes?.length ?? 0} jadwal
                </span>{" "}
                dalam group ini sekaligus.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold text-gray-800 transition hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-yellow-500 py-2 font-semibold text-white transition hover:bg-yellow-600 disabled:bg-yellow-300"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Reschedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleGroupJadwalModal;
