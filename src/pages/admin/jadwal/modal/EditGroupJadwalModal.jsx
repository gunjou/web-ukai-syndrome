import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";
import GroupJadwalInfo from "./GroupJadwalInfo.jsx";

// ========================================================================
// MODAL - EDIT GROUP (v2)
// Mentor, tanggal, jam, topik & catatan diterapkan ke SEMUA jadwal dalam
// group. Kelas/kelompok & tipe pertemuan tiap jadwal tidak diubah.
// ========================================================================

const toTime = (value) => (value ? String(value).substring(0, 5) : "");

const EditGroupJadwalModal = ({ setShowModal, fetchJadwal, group }) => {
  const [mentorOptions, setMentorOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_mentor: group?.id_mentor || "",
    tanggal: group?.tanggal || "",
    waktu_mulai: toTime(group?.waktu_mulai),
    waktu_selesai: toTime(group?.waktu_selesai),
    topik: group?.topik || "",
    catatan: group?.catatan || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const response = await Api.get("/jadwal/mentor-dropdown");
        setMentorOptions(response.data?.data || []);
      } catch (error) {
        console.error("Gagal mengambil data mentor:", error);
        toast.error("Gagal memuat data mentor");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentor();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_mentor) newErrors.id_mentor = "Mentor harus dipilih";
    if (!formData.tanggal) newErrors.tanggal = "Tanggal harus diisi";
    if (!formData.waktu_mulai) newErrors.waktu_mulai = "Waktu mulai harus diisi";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await Api.put(`/jadwal/v2/group/${group.id_jadwal}`, {
        ...formData,
        id_mentor: parseInt(formData.id_mentor, 10),
      });

      toast.success(response?.data?.message || "Jadwal berhasil diperbarui");

      setShowModal(false);
      fetchJadwal();
    } catch (error) {
      console.error("Gagal mengubah group jadwal:", error);
      toast.error(error.response?.data?.message || "Gagal mengubah jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const ErrorText = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="my-10 max-h-[90vh] w-[90%] max-w-lg animate-fade-in-down overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Edit Jadwal</h2>
              <p className="mt-1 text-sm text-gray-500">
                Perubahan diterapkan ke semua jadwal di group ini
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
                Mentor <span className="text-red-500">*</span>
              </label>
              <select
                name="id_mentor"
                value={formData.id_mentor}
                onChange={handleInputChange}
                disabled={isLoading}
                className={inputClass("id_mentor")}
              >
                <option value="">
                  {isLoading ? "Memuat mentor..." : "Pilih mentor"}
                </option>
                {mentorOptions.map((mentor) => (
                  <option key={mentor.id_user} value={mentor.id_user}>
                    {mentor.nama}
                    {mentor.nickname ? ` (${mentor.nickname})` : ""}
                  </option>
                ))}
              </select>
              <ErrorText field="id_mentor" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                className={inputClass("tanggal")}
              />
              <ErrorText field="tanggal" />
            </div>

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
                  className={inputClass("waktu_mulai")}
                />
                <ErrorText field="waktu_mulai" />
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
                  className={inputClass("waktu_selesai")}
                />
                <ErrorText field="waktu_selesai" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Topik
              </label>
              <input
                type="text"
                name="topik"
                value={formData.topik}
                onChange={handleInputChange}
                placeholder="Topik pertemuan"
                className={inputClass("topik")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Catatan
              </label>
              <textarea
                name="catatan"
                rows={3}
                value={formData.catatan}
                onChange={handleInputChange}
                placeholder="Catatan pertemuan"
                className={inputClass("catatan")}
              />
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-gray-600">
              <p>
                <span className="font-semibold">Catatan:</span> Perubahan akan
                diterapkan ke{" "}
                <span className="font-semibold">
                  {group?.count ?? group?.classes?.length ?? 0} jadwal
                </span>{" "}
                sekaligus. Untuk mengubah 1 kelas/kelompok saja, gunakan aksi di
                daftar kelas.
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
                disabled={isSubmitting || isLoading}
                className="flex-1 rounded-lg bg-yellow-500 py-2 font-semibold text-white transition hover:bg-yellow-600 disabled:bg-yellow-300"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGroupJadwalModal;
