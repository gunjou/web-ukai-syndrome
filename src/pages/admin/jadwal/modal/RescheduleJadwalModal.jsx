import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";

// ========================================================================
// COMPONENT
// ========================================================================

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
  // ========================================================================
  // STATE - FORM
  // ========================================================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tanggal_reschedule: initialData?.tanggal_reschedule || "",
    waktu_mulai_reschedule: initialData?.waktu_mulai_reschedule || "",
    waktu_selesai_reschedule: initialData?.waktu_selesai_reschedule || "",
  });

  const [errors, setErrors] = useState({});

  // ========================================================================
  // FORM - INPUT HANDLER
  // ========================================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ========================================================================
  // FORM - VALIDATION
  // ========================================================================

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

  // ========================================================================
  // FORM - SUBMIT
  // ========================================================================

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

  // ========================================================================
  // MODAL
  // ========================================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="my-10 max-h-[90vh] w-[90%] max-w-md animate-fade-in-down overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ================================================================== */}
        {/* MODAL HEADER                                                       */}
        {/* ================================================================== */}

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Reschedule Jadwal
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Atur ulang tanggal dan waktu pertemuan
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

          {/* ================================================================== */}
          {/* FORM                                                               */}
          {/* ================================================================== */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ================================================================ */}
            {/* INFO JADWAL ORIGINAL                                             */}
            {/* ================================================================ */}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
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
                {initialData?.tanggal
                  ? new Date(initialData.tanggal).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "-"}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">Jam Original:</span>{" "}
                {initialData?.waktu_mulai?.substring(0, 5) || "-"} -{" "}
                {initialData?.waktu_selesai?.substring(0, 5) || "-"}
              </p>
            </div>

            {/* ================================================================ */}
            {/* TANGGAL RESCHEDULE                                                */}
            {/* ================================================================ */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tanggal Reschedule <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="tanggal_reschedule"
                value={formData.tanggal_reschedule}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                  errors.tanggal_reschedule
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.tanggal_reschedule && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.tanggal_reschedule}
                </p>
              )}
            </div>

            {/* ================================================================ */}
            {/* WAKTU MULAI & SELESAI                                            */}
            {/* ================================================================ */}

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
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                    errors.waktu_mulai_reschedule
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                    errors.waktu_selesai_reschedule
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {errors.waktu_selesai_reschedule && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.waktu_selesai_reschedule}
                  </p>
                )}
              </div>
            </div>

            {/* ================================================================ */}
            {/* INFO ALERT                                                        */}
            {/* ================================================================ */}

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-gray-600">
              <p>
                <span className="font-semibold">Catatan:</span> Tanggal dan
                waktu baru akan menjadi jadwal efektif untuk pertemuan ini.
              </p>
            </div>

            {/* ================================================================ */}
            {/* ACTION                                                            */}
            {/* ================================================================ */}

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

export default RescheduleJadwalModal;
