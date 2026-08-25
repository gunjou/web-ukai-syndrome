import React, { useEffect, useState } from "react";
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
  // ========================================================================
  // MODE
  // ========================================================================

  const [mode, setMode] = useState("manual");

  // ========================================================================
  // MANUAL FORM
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
  // BULK IMPORT
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
  // MANUAL FORM
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

    // Backend menjadikan topik dan catatan optional.
    // Jadi frontend juga tidak perlu mewajibkan keduanya.

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
  // BULK - RESET
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
  // BULK - FILE SELECT
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

    // Setiap kali file baru dipilih,
    // hasil validation sebelumnya harus dibuang.
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
  // BULK - VALIDATE
  // ========================================================================

  const handleBulkValidate = async () => {
    if (!bulkFile) {
      toast.error("Silakan pilih file terlebih dahulu");
      return;
    }

    setIsBulkValidating(true);

    // Bersihkan hasil sebelumnya
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

      /*
       * Pada response 422 kita tetap ingin menampilkan
       * error per row di halaman, bukan hanya toast.
       */
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
  // BULK - COMMIT
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
  // BULK - DOWNLOAD TEMPLATE
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
  // BULK - FORMAT ERROR
  // ========================================================================

  const getErrorCount = () => {
    return bulkErrors.reduce(
      (total, rowError) => total + (rowError.errors?.length || 0),
      0,
    );
  };

  // ========================================================================
  // LOADING
  // ========================================================================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-gray-500 text-sm mt-2">Memuat data...</p>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Tambah Jadwal</h2>

        <p className="text-sm text-gray-500 mt-1">
          Pilih cara menambahkan jadwal
        </p>
      </div>

      {/* ================================================================ */}
      {/* MODE MENU                                                        */}
      {/* ================================================================ */}

      <div className="grid grid-cols-2 gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => {
            setMode("manual");
          }}
          className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
            mode === "manual"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tambah Manual
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("bulk");
          }}
          className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
            mode === "bulk"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Import Bulk
        </button>
      </div>

      {/* ================================================================== */}
      {/* MODE MANUAL                                                        */}
      {/* ================================================================== */}

      {mode === "manual" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kelas */}

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
              <p className="text-red-500 text-xs mt-1">
                {errors.id_paketkelas}
              </p>
            )}
          </div>

          {/* Mentor */}

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

          {/* Waktu */}

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
                <p className="text-red-500 text-xs mt-1">
                  {errors.waktu_mulai}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.waktu_selesai}
                </p>
              )}
            </div>
          </div>

          {/* Type */}

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

          {/* Topik */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topik
            </label>

            <input
              type="text"
              name="topik"
              value={formData.topik}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="Masukkan topik jadwal"
            />
          </div>

          {/* Catatan */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan
            </label>

            <textarea
              name="catatan"
              value={formData.catatan}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition resize-none"
              placeholder="Masukkan catatan jadwal"
            />
          </div>

          {/* Button */}

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
      )}

      {/* ================================================================== */}
      {/* MODE BULK                                                          */}
      {/* ================================================================== */}

      {mode === "bulk" && (
        <div className="space-y-4">
          {/* Informasi */}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800">
              Import Jadwal Bulk
            </p>

            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Upload file CSV atau XLSX sesuai template. Sistem akan memvalidasi
              seluruh data terlebih dahulu. Jika ada satu data yang salah, tidak
              ada jadwal yang akan dimasukkan.
            </p>
          </div>

          {/* Download template */}

          <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Belum memiliki template?
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Download template Excel untuk format import.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:text-gray-400 whitespace-nowrap"
            >
              {isDownloadingTemplate ? "Mengunduh..." : "Download Template"}
            </button>
          </div>

          {/* File upload */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              File Jadwal <span className="text-red-500">*</span>
            </label>

            <div className="border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-5 transition">
              <input
                id="bulk-jadwal-file"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleBulkFileChange}
                className="hidden"
              />

              <label
                htmlFor="bulk-jadwal-file"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-3xl mb-2">📄</div>

                <p className="text-sm font-semibold text-gray-700">
                  {bulkFile ? bulkFile.name : "Pilih file CSV atau XLSX"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Klik untuk memilih file
                </p>
              </label>
            </div>

            {bulkFile && (
              <div className="flex items-center justify-between mt-2 bg-gray-50 border rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 truncate">
                    {bulkFile.name}
                  </p>

                  <p className="text-[11px] text-gray-400">
                    {(bulkFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetBulkState}
                  className="text-xs text-red-500 hover:text-red-600 ml-3"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          {/* Validate button */}

          <button
            type="button"
            onClick={handleBulkValidate}
            disabled={!bulkFile || isBulkValidating || isBulkCommitting}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {isBulkValidating ? "Memvalidasi File..." : "Validasi File"}
          </button>

          {/* ============================================================ */}
          {/* SUMMARY                                                        */}
          {/* ============================================================ */}

          {(bulkStatus || bulkSummary.total_rows > 0) && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Total</p>

                <p className="text-lg font-bold text-gray-800">
                  {bulkSummary.total_rows}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-xs text-green-600">Valid</p>

                <p className="text-lg font-bold text-green-700">
                  {bulkSummary.valid_rows}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-xs text-red-600">Invalid</p>

                <p className="text-lg font-bold text-red-700">
                  {bulkSummary.invalid_rows}
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ERROR LIST                                                     */}
          {/* ============================================================ */}

          {bulkErrors.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Data Tidak Valid
                    </p>

                    <p className="text-xs text-red-600 mt-0.5">
                      Ditemukan {getErrorCount()} error pada {bulkErrors.length}{" "}
                      row.
                    </p>
                  </div>

                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    {bulkErrors.length} Row
                  </span>
                </div>

                <p className="text-xs text-red-600 mt-2">
                  Perbaiki semua error pada file lalu upload ulang. Tidak ada
                  data yang akan masuk sebelum seluruh row valid.
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {bulkErrors.map((rowError, index) => (
                  <div
                    key={`${rowError.row}-${index}`}
                    className="px-4 py-3 border-b last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                        Row {rowError.row}
                      </span>

                      <div className="space-y-1 min-w-0">
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

          {/* ============================================================ */}
          {/* SUCCESS / PREVIEW                                              */}
          {/* ============================================================ */}

          {bulkStatus === "VALID" &&
            bulkImportId &&
            bulkErrors.length === 0 && (
              <div className="border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                  <p className="text-sm font-bold text-green-700">
                    File Siap Di-import
                  </p>

                  <p className="text-xs text-green-600 mt-1">
                    Seluruh {bulkSummary.valid_rows} row telah lolos validasi.
                  </p>
                </div>

                {/* Preview */}

                {bulkPreview.length > 0 && (
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>

                          <th className="px-3 py-2 text-left">Kelas</th>

                          <th className="px-3 py-2 text-left">Mentor</th>

                          <th className="px-3 py-2 text-left">Tanggal</th>

                          <th className="px-3 py-2 text-left">Waktu</th>

                          <th className="px-3 py-2 text-left">Tipe</th>
                        </tr>
                      </thead>

                      <tbody>
                        {bulkPreview.map((item, index) => (
                          <tr key={`${item.row}-${index}`} className="border-t">
                            <td className="px-3 py-2">{item.row}</td>

                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.nama_kelas}
                            </td>

                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.mentor}
                            </td>

                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.tanggal}
                            </td>

                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.waktu_mulai}
                              {" - "}
                              {item.waktu_selesai}
                            </td>

                            <td className="px-3 py-2">{item.type_pertemuan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {bulkSummary.total_rows > bulkPreview.length && (
                  <p className="px-4 py-2 text-xs text-gray-500 border-t">
                    Menampilkan maksimal {bulkPreview.length} row sebagai
                    preview. Seluruh {bulkSummary.total_rows} row tetap telah
                    divalidasi oleh server.
                  </p>
                )}
              </div>
            )}

          {/* ============================================================ */}
          {/* ACTION BULK                                                    */}
          {/* ============================================================ */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={isBulkValidating || isBulkCommitting}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition"
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
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2 rounded-lg transition"
            >
              {isBulkCommitting ? "Meng-import..." : "Import Jadwal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahJadwalForm;
