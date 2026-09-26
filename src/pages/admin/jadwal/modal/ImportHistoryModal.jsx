import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineClose, AiOutlineRollback } from "react-icons/ai";
import { BsEye, BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";

// ========================================================================
// COMPONENT
// ========================================================================

const ImportHistoryModal = ({
  setShowModal,
  fetchJadwal,
  currentPage,
  searchTerm,
  filterKelas,
  limit,
}) => {
  // ========================================================================
  // STATE - HISTORY & DETAIL
  // ========================================================================

  const [history, setHistory] = useState([]);
  const [selectedImport, setSelectedImport] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState([]);

  // ========================================================================
  // STATE - LOADING
  // ========================================================================

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRollbackLoading, setIsRollbackLoading] = useState(false);

  // ========================================================================
  // STATE - ROLLBACK CONFIRMATION
  // ========================================================================

  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const ROLLBACK_CONFIRM_TEXT = "ROLLBACK IMPORT";

  // ========================================================================
  // FETCH HISTORY
  // ========================================================================

  const fetchHistory = async () => {
    setIsLoading(true);

    try {
      const response = await Api.get("/jadwal/bulk/history?status=COMMITTED");

      const result = response.data;

      setHistory(result?.data || []);
    } catch (error) {
      console.error("Gagal mengambil history import:", error);

      toast.error(
        error?.response?.data?.message || "Gagal mengambil history import.",
      );

      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ========================================================================
  // FETCH DETAIL IMPORT
  // ========================================================================

  const fetchImportDetail = async (importId) => {
    if (!importId) {
      toast.error("Import ID tidak ditemukan.");
      return;
    }

    try {
      setIsLoadingDetail(true);

      const response = await Api.get(`/jadwal/bulk/${importId}`);

      const result = response.data;

      if (result?.status !== "success") {
        throw new Error(result?.message || "Gagal mengambil detail import");
      }

      const importData = result?.data?.import || null;

      const details = Array.isArray(result?.data?.details)
        ? result.data.details
        : [];

      setSelectedImport(importData);
      setSelectedDetail(details);
    } catch (error) {
      console.error("Gagal mengambil detail import:", error);

      setSelectedImport(null);
      setSelectedDetail([]);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal mengambil detail import",
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ========================================================================
  // VIEW DETAIL
  // ========================================================================

  const handleViewDetail = (item) => {
    const importId = item?.id_import;

    if (!importId) {
      toast.error("Import ID tidak ditemukan.");
      return;
    }

    setSelectedImport(item);
    setSelectedDetail([]);

    fetchImportDetail(importId);
  };

  // ========================================================================
  // ROLLBACK
  // ========================================================================

  const handleRollback = async () => {
    if (confirmText !== ROLLBACK_CONFIRM_TEXT) {
      toast.error(`Ketik "${ROLLBACK_CONFIRM_TEXT}" untuk melanjutkan.`);
      return;
    }

    if (!selectedImport?.id_import) {
      toast.error("Import ID tidak ditemukan.");
      return;
    }

    setIsRollbackLoading(true);

    try {
      const response = await Api.delete(
        `/jadwal/bulk/${selectedImport.id_import}/rollback`,
      );

      const result = response.data;

      toast.success(result?.message || "Import jadwal berhasil di-rollback.");

      setShowRollbackConfirm(false);
      setConfirmText("");

      setHistory((prev) =>
        prev.filter((item) => item.id_import !== selectedImport.id_import),
      );

      setSelectedImport(null);
      setSelectedDetail([]);

      // Refresh daftar jadwal setelah rollback berhasil.
      if (fetchJadwal) {
        fetchJadwal(currentPage, searchTerm, filterKelas, limit);
      }
    } catch (error) {
      console.error("Gagal melakukan rollback:", error);

      toast.error(
        error?.response?.data?.message || "Gagal melakukan rollback import.",
      );
    } finally {
      setIsRollbackLoading(false);
    }
  };

  // ========================================================================
  // FORMAT DATE TIME
  // ========================================================================

  const formatDateTime = (value) => {
    if (!value) return "-";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  // ========================================================================
  // FORMAT DATE
  // ========================================================================

  const formatDate = (value) => {
    if (!value) return "-";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  // ========================================================================
  // FORMAT TIME
  // ========================================================================

  const formatTime = (value) => {
    if (!value) return "-";

    return String(value).substring(0, 5);
  };

  // ========================================================================
  // NORMALIZE DATE
  // ========================================================================

  const normalizeDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // ========================================================================
  // GET TODAY
  // ========================================================================

  const getToday = () => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  // ========================================================================
  // ROLLBACK RESTRICTION
  // ========================================================================

  const rollbackRestriction = useMemo(() => {
    if (!selectedDetail || selectedDetail.length === 0) {
      return {
        disabled: false,
        reason: "",
        restrictedDetail: null,
      };
    }

    const today = getToday();

    const restrictedDetail = selectedDetail.find((detail) => {
      const detailDate = normalizeDate(
        detail?.tanggal || detail?.tanggal_efektif || detail?.tanggal_jadwal,
      );

      if (!detailDate) {
        return false;
      }

      return detailDate <= today;
    });

    if (restrictedDetail) {
      return {
        disabled: true,
        reason:
          "Rollback tidak dapat dilakukan karena terdapat jadwal yang tanggalnya sudah hari ini atau sudah lewat.",
        restrictedDetail,
      };
    }

    return {
      disabled: false,
      reason: "",
      restrictedDetail: null,
    };
  }, [selectedDetail]);

  const isRollbackDisabled = rollbackRestriction.disabled;

  // ========================================================================
  // RESET CONFIRMATION
  // ========================================================================

  const closeRollbackConfirm = () => {
    if (isRollbackLoading) return;

    setShowRollbackConfirm(false);
    setConfirmText("");
  };

  // ========================================================================
  // SUMMARY
  // ========================================================================

  const selectedSummary = useMemo(() => {
    if (!selectedImport) {
      return null;
    }

    return {
      total: selectedImport.total_rows ?? selectedDetail.length ?? 0,

      valid:
        selectedImport.valid_rows ??
        selectedDetail.filter((item) => item.status === "VALID").length,

      invalid:
        selectedImport.invalid_rows ??
        selectedDetail.filter((item) => item.status === "INVALID").length,
    };
  }, [selectedImport, selectedDetail]);

  // ========================================================================
  // MODAL
  // ========================================================================

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!showRollbackConfirm) {
          setShowModal(false);
        }
      }}
    >
      <div
        className="my-10 max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ================================================================== */}
        {/* MODAL HEADER                                                       */}
        {/* ================================================================== */}

        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              History Import Jadwal
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Pilih import yang sudah di-commit untuk melihat data dan melakukan
              rollback.
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
        {/* MODAL CONTENT                                                      */}
        {/* ================================================================== */}

        <div className="max-h-[calc(92vh-80px)] overflow-y-auto p-5">
          {!selectedImport ? (
            <>
              {/* ============================================================ */}
              {/* HISTORY TABLE                                                */}
              {/* ============================================================ */}

              {isLoading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    Memuat history import...
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Menyiapkan data history import
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <AiOutlineRollback size={28} className="text-gray-400" />
                  </div>

                  <p className="text-sm font-semibold text-gray-700">
                    Belum ada history import
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Belum terdapat jadwal yang di-import menggunakan fitur bulk
                    import.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-xs uppercase text-gray-600">
                        <th className="px-4 py-3 text-center">No</th>
                        <th className="px-4 py-3 text-left">File</th>
                        <th className="px-4 py-3 text-center">Total</th>
                        <th className="px-4 py-3 text-center">Valid</th>
                        <th className="px-4 py-3 text-center">
                          Tanggal Import
                        </th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((item, index) => (
                        <tr
                          key={item.id_import}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-center text-sm">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-800">
                              {item.file_name || "-"}
                            </div>

                            <div className="mt-1 text-[11px] text-gray-400">
                              ID: {item.id_import}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center text-sm">
                            {item.total_rows ?? 0}
                          </td>

                          <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                            {item.valid_rows ?? 0}
                          </td>

                          <td className="px-4 py-3 text-center text-sm">
                            {formatDateTime(item.created_at)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              COMMITTED
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(item)}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                            >
                              <BsEye size={15} />
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ============================================================ */}
              {/* DETAIL HEADER                                                 */}
              {/* ============================================================ */}

              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImport(null);
                      setSelectedDetail([]);
                      setConfirmText("");
                      setShowRollbackConfirm(false);
                    }}
                    className="mb-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    ← Kembali ke history
                  </button>

                  <h3 className="text-base font-bold text-gray-800">
                    Detail Import
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedImport.file_name || "-"}
                  </p>
                </div>

                {/* ========================================================== */}
                {/* ROLLBACK ACTION                                             */}
                {/* ========================================================== */}

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRollbackDisabled) return;

                      setShowRollbackConfirm(true);
                    }}
                    disabled={isRollbackDisabled}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isRollbackDisabled
                        ? "cursor-not-allowed bg-gray-300 text-gray-500"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    <BsTrash3 size={16} />

                    {isRollbackDisabled
                      ? "Rollback Tidak Tersedia"
                      : "Rollback Import"}
                  </button>

                  {isRollbackDisabled && (
                    <div className="max-w-xs text-right">
                      <p className="text-[11px] leading-relaxed text-red-500">
                        {rollbackRestriction.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ============================================================ */}
              {/* SUMMARY                                                       */}
              {/* ============================================================ */}

              {selectedSummary && (
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Total Row</p>

                    <p className="mt-1 text-xl font-bold text-gray-800">
                      {selectedSummary.total}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-green-50 p-4">
                    <p className="text-xs text-green-600">Valid</p>

                    <p className="mt-1 text-xl font-bold text-green-700">
                      {selectedSummary.valid}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-red-50 p-4">
                    <p className="text-xs text-red-600">Invalid</p>

                    <p className="mt-1 text-xl font-bold text-red-700">
                      {selectedSummary.invalid}
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* IMPORT INFO                                                   */}
              {/* ============================================================ */}

              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-gray-500">File</p>

                  <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                    {selectedImport.file_name || "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs text-gray-500">Waktu Import</p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDateTime(selectedImport.created_at)}
                  </p>
                </div>
              </div>

              {/* ============================================================ */}
              {/* DETAIL TABLE                                                  */}
              {/* ============================================================ */}

              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

                  <p className="mt-3 text-xs text-gray-500">
                    Memuat detail import...
                  </p>
                </div>
              ) : selectedDetail.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  Tidak ada detail import.
                </div>
              ) : (
                <div className="max-h-[45vh] overflow-x-auto rounded-xl border">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10 bg-gray-100">
                      <tr className="text-xs uppercase text-gray-600">
                        <th className="px-3 py-3 text-center">Row</th>
                        <th className="px-4 py-3 text-left">Kelas</th>
                        <th className="px-4 py-3 text-left">Mentor</th>
                        <th className="px-4 py-3 text-center">Tanggal</th>
                        <th className="px-4 py-3 text-center">Jam</th>
                        <th className="px-4 py-3 text-left">Topik</th>
                        <th className="px-4 py-3 text-center">Tipe</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedDetail.map((detail, index) => (
                        <tr
                          key={detail.id_detail || index}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-3 py-3 text-center text-xs">
                            {detail.row_number ?? index + 1}
                          </td>

                          <td className="px-4 py-3 text-sm font-semibold">
                            {detail.nama_kelas_raw || detail.nama_kelas || "-"}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {detail.mentor_raw || detail.nama_mentor || "-"}
                          </td>

                          <td className="px-4 py-3 text-center text-sm">
                            {formatDate(
                              detail.tanggal ||
                                detail.tanggal_efektif ||
                                detail.tanggal_jadwal,
                            )}
                          </td>

                          <td className="px-4 py-3 text-center text-sm">
                            {formatTime(detail.waktu_mulai)} -{" "}
                            {formatTime(detail.waktu_selesai)}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {detail.topik_raw || detail.topik || "-"}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                detail.type_pertemuan === "ONLINE"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {detail.type_pertemuan ||
                                detail.type_pertemuan_raw ||
                                "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                              {detail.status || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* ================================================================== */}
        {/* ROLLBACK CONFIRMATION                                              */}
        {/* ================================================================== */}

        {showRollbackConfirm && selectedImport && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
            onClick={closeRollbackConfirm}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* ============================================================ */}
              {/* CONFIRM HEADER                                                */}
              {/* ============================================================ */}

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                  <BsTrash3 size={20} className="text-red-600" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Konfirmasi Rollback
                  </h3>

                  <p className="text-xs text-gray-500">
                    Tindakan ini tidak dapat dilakukan sembarangan.
                  </p>
                </div>
              </div>

              {/* ============================================================ */}
              {/* WARNING BOX                                                   */}
              {/* ============================================================ */}

              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs leading-relaxed text-red-700">
                  Anda akan menghapus seluruh jadwal yang berasal dari import:
                </p>

                <p className="mt-2 break-all text-sm font-bold text-red-800">
                  {selectedImport.file_name || "-"}
                </p>

                <div className="mt-2 space-y-1">
                  <p className="text-xs text-red-600">
                    Import ID: <strong>{selectedImport.id_import}</strong>
                  </p>

                  <p className="text-xs text-red-600">
                    Total data:{" "}
                    <strong>{selectedImport.total_rows ?? 0}</strong> jadwal
                  </p>
                </div>
              </div>

              {/* ============================================================ */}
              {/* CONFIRM INPUT                                                 */}
              {/* ============================================================ */}

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Ketik{" "}
                <span className="font-bold text-red-600">
                  {ROLLBACK_CONFIRM_TEXT}
                </span>{" "}
                untuk melanjutkan
              </label>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isRollbackLoading}
                placeholder={ROLLBACK_CONFIRM_TEXT}
                autoFocus
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
              />

              {/* ============================================================ */}
              {/* VALIDATION TEXT                                               */}
              {/* ============================================================ */}

              {confirmText.length > 0 &&
                confirmText !== ROLLBACK_CONFIRM_TEXT && (
                  <p className="mt-2 text-xs text-red-500">
                    Teks konfirmasi belum sesuai.
                  </p>
                )}

              {confirmText === ROLLBACK_CONFIRM_TEXT && (
                <p className="mt-2 text-xs text-green-600">
                  Konfirmasi benar. Anda dapat melanjutkan rollback.
                </p>
              )}

              {/* ============================================================ */}
              {/* CONFIRM ACTION                                                 */}
              {/* ============================================================ */}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRollbackConfirm}
                  disabled={isRollbackLoading}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleRollback}
                  disabled={
                    isRollbackLoading || confirmText !== ROLLBACK_CONFIRM_TEXT
                  }
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isRollbackLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <BsTrash3 size={15} />
                      Ya, Rollback
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportHistoryModal;
