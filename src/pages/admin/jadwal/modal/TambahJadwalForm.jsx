import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import Api from "../../../../utils/Api";

// ========================================================================
// COMPONENT
// ========================================================================

const TambahJadwalForm = ({
  setShowModal,
  fetchJadwal,
  currentPage,
  searchTerm,
  filterKelas,
  limit,
}) => {
  // ========================================================================
  // MODE
  // ========================================================================

  const [mode, setMode] = useState("manual");

  // ========================================================================
  // MANUAL FORM - STATE
  // ========================================================================

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
    topik: "",
    catatan: "",
  });

  const [errors, setErrors] = useState({});

  // ========================================================================
  // BULK IMPORT - STATE
  // ========================================================================

  const [bulkFile, setBulkFile] = useState(null);
  const [bulkImportId, setBulkImportId] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);

  const [bulkSummary, setBulkSummary] = useState({
    total_rows: 0,
    valid_rows: 0,
    invalid_rows: 0,
  });

  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkPreview, setBulkPreview] = useState([]);

  const [isBulkValidating, setIsBulkValidating] = useState(false);
  const [isBulkCommitting, setIsBulkCommitting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // ========================================================================
  // FETCH OPTIONS - MANUAL
  // ========================================================================

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

  // ========================================================================
  // MANUAL FORM - HANDLER
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
  // MANUAL FORM - VALIDATION
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
  // MANUAL FORM - SUBMIT
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
        topik: formData.topik.trim() || null,
        catatan: formData.catatan.trim() || null,
      };

      await Api.post("/jadwal", payload);

      toast.success("Jadwal berhasil ditambahkan");

      setShowModal(false);

      fetchJadwal(currentPage, searchTerm, filterKelas, limit);
    } catch (error) {
      console.error("Gagal menambah jadwal:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Gagal menambah jadwal";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // BULK IMPORT - RESET
  // ========================================================================

  const resetBulkState = () => {
    setBulkFile(null);
    setBulkImportId(null);
    setBulkStatus(null);

    setBulkSummary({
      total_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
    });

    setBulkErrors([]);
    setBulkPreview([]);
  };

  // ========================================================================
  // BULK IMPORT - FILE SELECT
  // ========================================================================

  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      resetBulkState();
      return;
    }

    const fileName = file.name.toLowerCase();

    const isValidExtension =
      fileName.endsWith(".xlsx") || fileName.endsWith(".csv");

    if (!isValidExtension) {
      toast.error("File harus berformat CSV atau XLSX");

      e.target.value = "";
      resetBulkState();

      return;
    }

    setBulkFile(file);

    setBulkImportId(null);
    setBulkStatus(null);

    setBulkSummary({
      total_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
    });

    setBulkErrors([]);
    setBulkPreview([]);
  };

  // ========================================================================
  // BULK IMPORT - VALIDATE
  // ========================================================================

  const handleBulkValidate = async () => {
    if (!bulkFile) {
      toast.error("Silakan pilih file terlebih dahulu");
      return;
    }

    setIsBulkValidating(true);

    setBulkImportId(null);
    setBulkStatus(null);
    setBulkErrors([]);
    setBulkPreview([]);

    setBulkSummary({
      total_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
    });

    try {
      const formDataUpload = new FormData();

      formDataUpload.append("file", bulkFile);

      const response = await Api.post("/jadwal/bulk/validate", formDataUpload);

      const result = response.data;
      const data = result?.data || {};

      setBulkImportId(data.import_id || null);
      setBulkStatus("VALID");

      setBulkSummary({
        total_rows: data.total_rows || 0,
        valid_rows: data.valid_rows || 0,
        invalid_rows: data.invalid_rows || 0,
      });

      setBulkErrors(data.errors || []);
      setBulkPreview(data.preview || []);

      toast.success(result?.message || "File valid dan siap di-import");
    } catch (error) {
      console.error("Gagal melakukan validasi bulk jadwal:", error);

      const responseData = error.response?.data;
      const data = responseData?.data || {};
      const errorsFromBackend = data.errors || [];

      setBulkImportId(data.import_id || null);

      setBulkSummary({
        total_rows: data.total_rows || 0,
        valid_rows: data.valid_rows || 0,
        invalid_rows: data.invalid_rows || 0,
      });

      setBulkErrors(errorsFromBackend);
      setBulkStatus("INVALID");

      if (errorsFromBackend.length > 0) {
        setBulkPreview([]);
      }

      const errorMessage =
        responseData?.message || "File memiliki data yang tidak valid";

      toast.error(errorMessage);
    } finally {
      setIsBulkValidating(false);
    }
  };

  // ========================================================================
  // BULK IMPORT - COMMIT
  // ========================================================================

  const handleBulkCommit = async () => {
    if (!bulkImportId) {
      toast.error("Import belum tervalidasi");
      return;
    }

    if (bulkStatus !== "VALID") {
      toast.error("File belum valid dan tidak dapat di-import");
      return;
    }

    setIsBulkCommitting(true);

    try {
      const response = await Api.post(`/jadwal/bulk/${bulkImportId}/commit`);

      const result = response.data;

      toast.success(result?.message || "Bulk jadwal berhasil di-import");

      setShowModal(false);

      fetchJadwal(currentPage, searchTerm, filterKelas, limit);
    } catch (error) {
      console.error("Gagal melakukan commit bulk jadwal:", error);

      const responseData = error.response?.data;

      const errorMessage =
        responseData?.message || "Gagal melakukan import jadwal";

      toast.error(errorMessage);
    } finally {
      setIsBulkCommitting(false);
    }
  };

  // ========================================================================
  // BULK IMPORT - DOWNLOAD TEMPLATE
  // ========================================================================

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);

    try {
      const response = await Api.get("/jadwal/bulk/template", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "template_import_jadwal.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal download template:", error);

      toast.error("Gagal mengunduh template jadwal");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // ========================================================================
  // BULK IMPORT - ERROR FORMAT
  // ========================================================================

  const getErrorCount = () => {
    return bulkErrors.reduce(
      (total, rowError) => total + (rowError.errors?.length || 0),
      0,
    );
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
              <h2 className="text-xl font-bold text-gray-800">Tambah Jadwal</h2>

              <p className="mt-1 text-sm text-gray-500">
                Pilih cara menambahkan jadwal
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
                Menyiapkan data kelas dan mentor
              </p>
            </div>
          ) : (
            <>
              {/* ================================================================== */}
              {/* MODE MENU                                                          */}
              {/* ================================================================== */}

              <div className="border-b pb-3">
                <div className="flex w-full rounded-xl bg-gray-300 p-1 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      mode === "manual"
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    Tambah Manual
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("bulk")}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      mode === "bulk"
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    Import Bulk
                  </button>
                </div>
              </div>

              {/* ================================================================== */}
              {/* MODE MANUAL                                                        */}
              {/* ================================================================== */}

              {mode === "manual" && (
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

                  {/* Waktu */}

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
              )}

              {/* ================================================================== */}
              {/* MODE BULK                                                          */}
              {/* ================================================================== */}

              {mode === "bulk" && (
                <div className="space-y-4">
                  {/* Informasi */}

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-800">
                      Import Jadwal Bulk
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-blue-700">
                      Upload file CSV atau XLSX sesuai template. Sistem akan
                      memvalidasi seluruh data terlebih dahulu. Jika ada satu
                      data yang salah, tidak ada jadwal yang akan dimasukkan.
                    </p>
                  </div>

                  {/* Download Template */}

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Belum memiliki template?
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Download template Excel untuk format import.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      disabled={isDownloadingTemplate}
                      className="whitespace-nowrap text-sm font-semibold text-red-500 hover:text-red-600 disabled:text-gray-400"
                    >
                      {isDownloadingTemplate
                        ? "Mengunduh..."
                        : "Download Template"}
                    </button>
                  </div>

                  {/* File Upload */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      File Jadwal <span className="text-red-500">*</span>
                    </label>

                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 transition hover:border-red-400">
                      <input
                        id="bulk-jadwal-file"
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleBulkFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="bulk-jadwal-file"
                        className="flex cursor-pointer flex-col items-center justify-center"
                      >
                        <div className="mb-2 text-3xl">📄</div>

                        <p className="text-sm font-semibold text-gray-700">
                          {bulkFile
                            ? bulkFile.name
                            : "Pilih file CSV atau XLSX"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Klik untuk memilih file
                        </p>
                      </label>
                    </div>

                    {bulkFile && (
                      <div className="mt-2 flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs text-gray-700">
                            {bulkFile.name}
                          </p>

                          <p className="text-[11px] text-gray-400">
                            {(bulkFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={resetBulkState}
                          className="ml-3 text-xs text-red-500 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Validate */}

                  <button
                    type="button"
                    onClick={handleBulkValidate}
                    disabled={!bulkFile || isBulkValidating || isBulkCommitting}
                    className="w-full rounded-lg bg-red-500 py-2.5 font-semibold text-white transition hover:bg-red-600 disabled:bg-red-300"
                  >
                    {isBulkValidating ? "Memvalidasi File..." : "Validasi File"}
                  </button>

                  {/* Summary */}

                  {(bulkStatus || bulkSummary.total_rows > 0) && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border bg-gray-50 p-3 text-center">
                        <p className="text-xs text-gray-500">Total</p>

                        <p className="text-lg font-bold text-gray-800">
                          {bulkSummary.total_rows}
                        </p>
                      </div>

                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                        <p className="text-xs text-green-600">Valid</p>

                        <p className="text-lg font-bold text-green-700">
                          {bulkSummary.valid_rows}
                        </p>
                      </div>

                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                        <p className="text-xs text-red-600">Invalid</p>

                        <p className="text-lg font-bold text-red-700">
                          {bulkSummary.invalid_rows}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error List */}

                  {bulkErrors.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-red-200">
                      <div className="border-b border-red-200 bg-red-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-red-700">
                              Data Tidak Valid
                            </p>

                            <p className="mt-0.5 text-xs text-red-600">
                              Ditemukan {getErrorCount()} error pada{" "}
                              {bulkErrors.length} row.
                            </p>
                          </div>

                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                            {bulkErrors.length} Row
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-red-600">
                          Perbaiki semua error pada file lalu upload ulang.
                          Tidak ada data yang akan masuk sebelum seluruh row
                          valid.
                        </p>
                      </div>

                      <div className="max-h-72 overflow-y-auto">
                        {bulkErrors.map((rowError, index) => (
                          <div
                            key={`${rowError.row}-${index}`}
                            className="border-b px-4 py-3 last:border-b-0"
                          >
                            <div className="flex items-start gap-2">
                              <span className="shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                                Row {rowError.row}
                              </span>

                              <div className="min-w-0 space-y-1">
                                {rowError.errors?.map((item, errorIndex) => (
                                  <div
                                    key={errorIndex}
                                    className="text-xs text-gray-700"
                                  >
                                    <span className="font-semibold text-gray-800">
                                      {item.field ? `${item.field}: ` : ""}
                                    </span>

                                    {item.message}

                                    {item.value !== undefined &&
                                      item.value !== null &&
                                      item.value !== "" && (
                                        <span className="text-gray-400">
                                          {" "}
                                          ({String(item.value)})
                                        </span>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success / Preview */}

                  {bulkStatus === "VALID" &&
                    bulkImportId &&
                    bulkErrors.length === 0 && (
                      <div className="overflow-hidden rounded-lg border border-green-200">
                        <div className="border-b border-green-200 bg-green-50 px-4 py-3">
                          <p className="text-sm font-bold text-green-700">
                            File Siap Di-import
                          </p>

                          <p className="mt-1 text-xs text-green-600">
                            Seluruh {bulkSummary.valid_rows} row telah lolos
                            validasi.
                          </p>
                        </div>

                        {/* Preview */}

                        {bulkPreview.length > 0 && (
                          <div className="max-h-72 overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left">Row</th>
                                  <th className="px-3 py-2 text-left">Kelas</th>
                                  <th className="px-3 py-2 text-left">
                                    Mentor
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Tanggal
                                  </th>
                                  <th className="px-3 py-2 text-left">Waktu</th>
                                  <th className="px-3 py-2 text-left">Tipe</th>
                                </tr>
                              </thead>

                              <tbody>
                                {bulkPreview.map((item, index) => (
                                  <tr
                                    key={`${item.row}-${index}`}
                                    className="border-t"
                                  >
                                    <td className="px-3 py-2">{item.row}</td>

                                    <td className="whitespace-nowrap px-3 py-2">
                                      {item.nama_kelas}
                                    </td>

                                    <td className="whitespace-nowrap px-3 py-2">
                                      {item.mentor}
                                    </td>

                                    <td className="whitespace-nowrap px-3 py-2">
                                      {item.tanggal}
                                    </td>

                                    <td className="whitespace-nowrap px-3 py-2">
                                      {item.waktu_mulai} - {item.waktu_selesai}
                                    </td>

                                    <td className="px-3 py-2">
                                      {item.type_pertemuan}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {bulkSummary.total_rows > bulkPreview.length && (
                          <p className="border-t px-4 py-2 text-xs text-gray-500">
                            Menampilkan maksimal {bulkPreview.length} row
                            sebagai preview. Seluruh {bulkSummary.total_rows}{" "}
                            row tetap telah divalidasi oleh server.
                          </p>
                        )}
                      </div>
                    )}

                  {/* Bulk Action */}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={isBulkValidating || isBulkCommitting}
                      className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold text-gray-800 transition hover:bg-gray-400 disabled:bg-gray-200"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkCommit}
                      disabled={
                        !bulkImportId ||
                        bulkStatus !== "VALID" ||
                        bulkErrors.length > 0 ||
                        isBulkValidating ||
                        isBulkCommitting
                      }
                      className="flex-1 rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-green-300"
                    >
                      {isBulkCommitting ? "Meng-import..." : "Import Jadwal"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TambahJadwalForm;
