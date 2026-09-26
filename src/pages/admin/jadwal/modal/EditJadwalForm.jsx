import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";

// ========================================================================
// COMPONENT
// ========================================================================

const EditJadwalForm = ({
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
  // STATE - OPTIONS & LOADING
  // ========================================================================

  const [kelasOptions, setKelasOptions] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================================================
  // STATE - FORM
  // ========================================================================

  const [formData, setFormData] = useState({
    id_paketkelas: "",
    id_mentor: "",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
    type_pertemuan: "ONLINE",
    topik: "",
    catatan: "",
  });

  const [errors, setErrors] = useState({});

  // ========================================================================
  // FETCH OPTIONS & INITIAL DATA
  // ========================================================================

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const requests = [
          Api.get("/paket-kelas?limit=999"),
          Api.get("/jadwal/mentor-dropdown"),
          Api.get(`/jadwal/${selectedId}`),
        ];

        const [kelasRes, mentorRes, jadwalRes] = await Promise.all(requests);

        setKelasOptions(kelasRes.data?.data || []);
        setMentorOptions(mentorRes.data?.data || []);

        const jadwalDetail = jadwalRes.data?.data || jadwalRes.data;
        const data = jadwalDetail || initialData;

        if (data) {
          setFormData({
            id_paketkelas: data.id_paketkelas || "",
            id_mentor: data.id_mentor || "",
            tanggal: data.tanggal || "",
            waktu_mulai: data.waktu_mulai || "",
            waktu_selesai: data.waktu_selesai || "",
            type_pertemuan: data.type_pertemuan || "ONLINE",
            topik: data.topik || "",
            catatan: data.catatan || "",
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data dropdown:", error);
        toast.error("Gagal memuat data dropdown");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [initialData, selectedId]);

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

    if (
      formData.waktu_mulai &&
      formData.waktu_selesai &&
      formData.waktu_mulai >= formData.waktu_selesai
    ) {
      newErrors.waktu_selesai =
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
        id_paketkelas: parseInt(formData.id_paketkelas, 10),
        id_mentor: parseInt(formData.id_mentor, 10),
        tanggal: formData.tanggal,
        waktu_mulai: formData.waktu_mulai,
        waktu_selesai: formData.waktu_selesai,
        type_pertemuan: formData.type_pertemuan,
        topik: formData.topik,
        catatan: formData.catatan,
      };

      await Api.put(`/jadwal/${selectedId}`, payload);

      toast.success("Jadwal berhasil diperbarui");

      setShowModal(false);

      fetchJadwal(currentPage, searchTerm, filterKelas, limit);
    } catch (error) {
      console.error("Gagal mengubah jadwal:", error);

      const errorMessage =
        error.response?.data?.message || "Gagal mengubah jadwal";

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
              <h2 className="text-xl font-bold text-gray-800">Edit Jadwal</h2>

              <p className="mt-1 text-sm text-gray-500">
                Perbarui informasi jadwal yang dipilih
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
          {/* LOADING                                                            */}
          {/* ================================================================== */}

          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

              <p className="mt-3 text-sm font-medium text-gray-500">
                Memuat data...
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Menyiapkan data jadwal, kelas, dan mentor
              </p>
            </div>
          ) : (
            <>
              {/* ================================================================ */}
              {/* FORM                                                              */}
              {/* ================================================================ */}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kelas */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Kelas <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="id_paketkelas"
                    value={formData.id_paketkelas}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                      errors.id_paketkelas
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Pilih Kelas --</option>

                    {kelasOptions.map((kelas) => (
                      <option
                        key={kelas.id_paketkelas}
                        value={kelas.id_paketkelas}
                      >
                        {kelas.nama_kelas}
                      </option>
                    ))}
                  </select>

                  {errors.id_paketkelas && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.id_paketkelas}
                    </p>
                  )}
                </div>

                {/* Mentor */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mentor <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="id_mentor"
                    value={formData.id_mentor}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
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
                    <p className="mt-1 text-xs text-red-500">
                      {errors.id_mentor}
                    </p>
                  )}
                </div>

                {/* Tanggal */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tanggal <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                      errors.tanggal ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  {errors.tanggal && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.tanggal}
                    </p>
                  )}
                </div>

                {/* Waktu Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Waktu Mulai <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="time"
                      name="waktu_mulai"
                      value={formData.waktu_mulai}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                        errors.waktu_mulai
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />

                    {errors.waktu_mulai && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.waktu_mulai}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Waktu Selesai <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
                        errors.waktu_selesai
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />

                    {errors.waktu_selesai && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.waktu_selesai}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tipe Pertemuan */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tipe Pertemuan <span className="text-red-500">*</span>
                  </label>

                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type_pertemuan"
                        value="ONLINE"
                        checked={formData.type_pertemuan === "ONLINE"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-red-500"
                      />

                      <span className="text-sm text-gray-700">ONLINE</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type_pertemuan"
                        value="OFFLINE"
                        checked={formData.type_pertemuan === "OFFLINE"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-red-500"
                      />

                      <span className="text-sm text-gray-700">OFFLINE</span>
                    </label>
                  </div>
                </div>

                {/* Topik */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Topik
                  </label>

                  <input
                    type="text"
                    name="topik"
                    value={formData.topik}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500"
                    placeholder="Masukkan topik jadwal"
                  />
                </div>

                {/* Catatan */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Catatan
                  </label>

                  <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500"
                    placeholder="Masukkan catatan jadwal"
                  />
                </div>

                {/* Action */}
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
                    className="flex-1 rounded-lg bg-red-500 py-2 font-semibold text-white transition hover:bg-red-600 disabled:bg-red-300"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditJadwalForm;
