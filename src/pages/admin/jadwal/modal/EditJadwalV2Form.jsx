import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";

// ========================================================================
// MODAL - EDIT 1 JADWAL (v2)
// Bisa ganti tipe pertemuan & target:
// - ONLINE  -> Kelas atau Kelas Private
// - OFFLINE -> Kelompok atau Kelas Private
//   (Kelas tetap muncul untuk jadwal OFFLINE lama yang memakai kelas)
// Endpoint: GET/PUT /jadwal/v2/:id
// ========================================================================

const TARGET_LABEL = {
  KELAS: "Kelas",
  KELOMPOK: "Kelompok",
  PRIVATE: "Kelas Private",
};

const toTime = (value) => (value ? String(value).substring(0, 5) : "");

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const getTargetKindFromData = (data) => {
  if (data?.id_mentorship) return "PRIVATE";
  if (data?.id_kelompok) return "KELOMPOK";
  return "KELAS";
};

const EditJadwalV2Form = ({
  setShowModal,
  fetchJadwal,
  selectedId,
  initialData,
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [kelasOptions, setKelasOptions] = useState([]);
  const [kelompokOptions, setKelompokOptions] = useState([]);
  const [privateOptions, setPrivateOptions] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target awal, dipakai agar opsi "Kelas" tetap ada untuk OFFLINE lama
  const [originalKind, setOriginalKind] = useState(
    getTargetKindFromData(initialData),
  );

  const [formData, setFormData] = useState({
    type_pertemuan: initialData?.type_pertemuan || "ONLINE",
    target_kind: getTargetKindFromData(initialData),
    target_id: "",
    id_mentor: initialData?.id_mentor || "",
    tanggal: initialData?.tanggal || "",
    waktu_mulai: toTime(initialData?.waktu_mulai),
    waktu_selesai: toTime(initialData?.waktu_selesai),
    topik: initialData?.topik || "",
    catatan: initialData?.catatan || "",
  });

  const [errors, setErrors] = useState({});

  // ========================================================================
  // FETCH OPTIONS & DETAIL JADWAL
  // ========================================================================

  useEffect(() => {
    const fetchAll = async () => {
      const [kelasRes, kelompokRes, privateRes, jadwalRes] =
        await Promise.allSettled([
          Api.get("/paket-kelas?limit=999"),
          Api.get("/kelompok/all"),
          Api.get("/jadwal/v2/private-dropdown"),
          Api.get(`/jadwal/v2/${selectedId}`),
        ]);

      if (kelasRes.status === "fulfilled") {
        setKelasOptions(extractRows(kelasRes.value?.data));
      }

      if (kelompokRes.status === "fulfilled") {
        setKelompokOptions(extractRows(kelompokRes.value?.data));
      }

      if (privateRes.status === "fulfilled") {
        setPrivateOptions(extractRows(privateRes.value?.data));
      }

      const data =
        jadwalRes.status === "fulfilled"
          ? jadwalRes.value?.data?.data || initialData
          : initialData;

      if (jadwalRes.status === "rejected") {
        toast.error("Gagal memuat detail jadwal terbaru.");
      }

      if (data) {
        const kind = getTargetKindFromData(data);

        setOriginalKind(kind);
        setFormData({
          type_pertemuan: data.type_pertemuan || "ONLINE",
          target_kind: kind,
          target_id: String(
            (kind === "PRIVATE"
              ? data.id_mentorship
              : kind === "KELOMPOK"
                ? data.id_kelompok
                : data.id_paketkelas) || "",
          ),
          id_mentor: data.id_mentor || "",
          tanggal: data.tanggal || "",
          waktu_mulai: toTime(data.waktu_mulai),
          waktu_selesai: toTime(data.waktu_selesai),
          topik: data.topik || "",
          catatan: data.catatan || "",
        });
      }

      setIsLoading(false);
    };

    fetchAll();
  }, [initialData, selectedId]);

  // ========================================================================
  // OPSI TARGET SESUAI TIPE PERTEMUAN
  // ========================================================================

  const targetKinds = useMemo(() => {
    if (formData.type_pertemuan === "ONLINE") return ["KELAS", "PRIVATE"];

    const kinds = ["KELOMPOK", "PRIVATE"];
    if (originalKind === "KELAS") kinds.splice(1, 0, "KELAS");
    return kinds;
  }, [formData.type_pertemuan, originalKind]);

  const targetOptions = useMemo(() => {
    if (formData.target_kind === "KELOMPOK") {
      return kelompokOptions.map((item) => ({
        value: String(item.id_kelompok),
        label: `${item.nama_kelompok}${item.nama_batch ? ` (${item.nama_batch})` : ""}`,
      }));
    }

    if (formData.target_kind === "PRIVATE") {
      return privateOptions.map((item) => ({
        value: String(item.id_mentorship),
        label: `${item.nama_mentorship || "Kelas Private"} - ${item.nama_peserta || "-"} (Mentor: ${item.nickname_mentor || item.nama_mentor || "-"})`,
        id_mentor: item.id_mentor,
      }));
    }

    return kelasOptions.map((item) => ({
      value: String(item.id_paketkelas),
      label: item.nama_kelas,
    }));
  }, [formData.target_kind, kelasOptions, kelompokOptions, privateOptions]);

  // ========================================================================
  // MENTOR: untuk Kelas hanya mentor yang terdaftar di kelas tsb
  // ========================================================================

  const mentorKelasId =
    formData.target_kind === "KELAS" ? formData.target_id : "";

  useEffect(() => {
    const fetchMentor = async () => {
      setIsMentorLoading(true);

      try {
        const response = await Api.get("/jadwal/mentor-dropdown", {
          params: mentorKelasId ? { id_paketkelas: mentorKelasId } : {},
        });
        setMentorOptions(response.data?.data || []);
      } catch (error) {
        console.error("Gagal mengambil data mentor:", error);
        setMentorOptions([]);
      } finally {
        setIsMentorLoading(false);
      }
    };

    fetchMentor();
  }, [mentorKelasId]);

  // ========================================================================
  // HANDLER
  // ========================================================================

  const clearError = (...fields) => {
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((field) => delete next[field]);
      return next;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;

    setFormData((prev) => {
      const allowed =
        type === "ONLINE"
          ? ["KELAS", "PRIVATE"]
          : originalKind === "KELAS"
            ? ["KELOMPOK", "KELAS", "PRIVATE"]
            : ["KELOMPOK", "PRIVATE"];
      const keepTarget = allowed.includes(prev.target_kind);

      return {
        ...prev,
        type_pertemuan: type,
        target_kind: keepTarget ? prev.target_kind : allowed[0],
        target_id: keepTarget ? prev.target_id : "",
      };
    });
    clearError("type_pertemuan", "target_id");
  };

  const handleTargetKindChange = (kind) => {
    setFormData((prev) =>
      prev.target_kind === kind
        ? prev
        : { ...prev, target_kind: kind, target_id: "" },
    );
    clearError("target_id");
  };

  const handleTargetChange = (e) => {
    const value = e.target.value;
    const option = targetOptions.find((item) => item.value === value);

    setFormData((prev) => ({
      ...prev,
      target_id: value,
      // Kelas private: mentor otomatis mengikuti mentor kelas private
      id_mentor:
        prev.target_kind === "PRIVATE" && option?.id_mentor
          ? option.id_mentor
          : prev.id_mentor,
    }));
    clearError("target_id", "id_mentor");
  };

  // ========================================================================
  // VALIDATION & SUBMIT
  // ========================================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.target_id) {
      newErrors.target_id = `${TARGET_LABEL[formData.target_kind]} harus dipilih`;
    }
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

    const targetId = parseInt(formData.target_id, 10);

    try {
      await Api.put(`/jadwal/v2/${selectedId}`, {
        id_paketkelas: formData.target_kind === "KELAS" ? targetId : null,
        id_kelompok: formData.target_kind === "KELOMPOK" ? targetId : null,
        id_mentorship: formData.target_kind === "PRIVATE" ? targetId : null,
        id_mentor: parseInt(formData.id_mentor, 10),
        type_pertemuan: formData.type_pertemuan,
        tanggal: formData.tanggal,
        waktu_mulai: formData.waktu_mulai,
        waktu_selesai: formData.waktu_selesai,
        topik: formData.topik,
        catatan: formData.catatan,
      });

      toast.success("Jadwal berhasil diperbarui");

      setShowModal(false);
      fetchJadwal();
    } catch (error) {
      console.error("Gagal mengubah jadwal:", error);
      toast.error(error.response?.data?.message || "Gagal mengubah jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const renderError = (field) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    ) : null;

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

          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
              <p className="mt-3 text-sm font-medium text-gray-500">
                Memuat data...
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Menyiapkan data jadwal, kelas, kelompok, dan kelas private
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TIPE PERTEMUAN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tipe Pertemuan <span className="text-red-500">*</span>
                </label>
                <select
                  name="type_pertemuan"
                  value={formData.type_pertemuan}
                  onChange={handleTypeChange}
                  className={inputClass("type_pertemuan")}
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              {/* JENIS TARGET */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Jadwal Untuk <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {targetKinds.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => handleTargetKindChange(kind)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        formData.target_kind === kind
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {TARGET_LABEL[kind]}
                    </button>
                  ))}
                </div>
              </div>

              {/* TARGET */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {TARGET_LABEL[formData.target_kind]}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.target_id}
                  onChange={handleTargetChange}
                  className={inputClass("target_id")}
                >
                  <option value="">
                    {targetOptions.length
                      ? `Pilih ${TARGET_LABEL[formData.target_kind].toLowerCase()}`
                      : `Belum ada data ${TARGET_LABEL[formData.target_kind].toLowerCase()}`}
                  </option>
                  {targetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {renderError("target_id")}
              </div>

              {/* MENTOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mentor <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_mentor"
                  value={formData.id_mentor}
                  onChange={handleInputChange}
                  disabled={isMentorLoading}
                  className={inputClass("id_mentor")}
                >
                  <option value="">
                    {isMentorLoading ? "Memuat mentor..." : "Pilih mentor"}
                  </option>
                  {mentorOptions.map((mentor) => (
                    <option key={mentor.id_user} value={mentor.id_user}>
                      {mentor.nama}
                      {mentor.nickname ? ` (${mentor.nickname})` : ""}
                    </option>
                  ))}
                </select>
                {formData.target_kind === "KELAS" && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Hanya mentor yang terdaftar di kelas ini.
                  </p>
                )}
                {renderError("id_mentor")}
              </div>

              {/* TANGGAL */}
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
                {renderError("tanggal")}
              </div>

              {/* WAKTU */}
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
                  {renderError("waktu_mulai")}
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
                  {renderError("waktu_selesai")}
                </div>
              </div>

              {/* TOPIK */}
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

              {/* CATATAN */}
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
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditJadwalV2Form;
