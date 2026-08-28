// ImportHistoryModal.jsx

import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineClose, AiOutlineRollback } from "react-icons/ai";
import { BsEye, BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";
import Api from "../../../../utils/Api";

const ImportHistoryModal = ({ setShowModal, onRollbackSuccess }) => {
  const [history, setHistory] = useState([]);

  const [selectedImport, setSelectedImport] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRollbackLoading, setIsRollbackLoading] = useState(false);

  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const ROLLBACK_CONFIRM_TEXT = "ROLLBACK IMPORT";

  // ============================================================
  // FETCH HISTORY
  // ============================================================

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

  // ============================================================
  // FETCH DETAIL IMPORT
  // ============================================================

  const fetchImportDetail = async (importId) => {
    if (!importId) {
      toast.error("Import ID tidak ditemukan.");
      return;
    }

    try {
      setIsLoadingDetail(true);

      const response = await Api.get(`/jadwal/bulk/${importId}`);

      console.log("IMPORT DETAIL:", response.data);

      const result = response.data;

      if (result?.status !== "success") {
        throw new Error(result?.message || "Gagal mengambil detail import");
      }

      // Response API:
      // data: {
      //   import: {...},
      //   details: [...]
      // }

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

  // ============================================================
  // VIEW DETAIL
  // ============================================================

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

  // ============================================================
  // ROLLBACK
  // ============================================================

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

      // Hapus dari history
      setHistory((prev) =>
        prev.filter((item) => item.id_import !== selectedImport.id_import),
      );

      setSelectedImport(null);
      setSelectedDetail([]);

      if (onRollbackSuccess) {
        onRollbackSuccess();
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

  // ============================================================
  // FORMAT DATE TIME
  // ============================================================

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

  // ============================================================
  // FORMAT DATE
  // ============================================================

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

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (value) => {
    if (!value) return "-";

    return String(value).substring(0, 5);
  };

  // ============================================================
  // NORMALIZE DATE
  // ============================================================
  /*
   * Fungsi ini digunakan agar perbandingan tanggal tidak
   * memperhitungkan jam.
   *
   * Contoh:
   *
   * 2026-08-28 08:00
   * 2026-08-28 18:00
   *
   * dianggap sama-sama:
   *
   * 2026-08-28
   */

  const normalizeDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // ============================================================
  // GET TODAY
  // ============================================================

  const getToday = () => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  // ============================================================
  // CHECK DETAIL DATE
  // ============================================================
  /*
   * Rollback DISABLE apabila:
   *
   * tanggal detail <= tanggal sekarang
   *
   * Contoh hari ini 28 Agustus:
   *
   * Detail:
   * 27 Agustus -> DISABLE
   * 28 Agustus -> DISABLE
   * 29 Agustus -> ENABLE
   *
   * Jika ada SATU saja data yang tanggalnya <= hari ini,
   * maka seluruh import tidak boleh di-rollback.
   */

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

  const isRollbackDisabled = useMemo(() => {
    if (!Array.isArray(selectedDetail) || selectedDetail.length === 0) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDetail.some((detail) => {
      if (!detail?.tanggal) {
        return false;
      }

      const detailDate = new Date(`${detail.tanggal}T00:00:00`);

      return detailDate <= today;
    });
  }, [selectedDetail]);

  // ============================================================
  // RESET CONFIRMATION
  // ============================================================

  const closeRollbackConfirm = () => {
    if (isRollbackLoading) return;

    setShowRollbackConfirm(false);
    setConfirmText("");
  };

  // ============================================================
  // SUMMARY
  // ============================================================

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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-[60] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => {
        if (!showRollbackConfirm) {
          setShowModal(false);
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              History Import Jadwal
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Pilih import yang sudah di-commit untuk melihat data dan melakukan
              rollback.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="p-5 overflow-y-auto max-h-[calc(92vh-80px)]">
          {!selectedImport ? (
            <>
              {/* ============================================ */}
              {/* HISTORY TABLE */}
              {/* ============================================ */}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />

                  <p className="text-sm text-gray-500 mt-3">
                    Memuat history import...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <AiOutlineRollback size={28} className="text-gray-400" />
                  </div>

                  <p className="text-sm font-semibold text-gray-700">
                    Belum ada history import
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Belum terdapat jadwal yang di-import menggunakan fitur bulk
                    import.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl">
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
                          <td className="px-4 py-3 text-sm text-center">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-sm text-gray-800">
                              {item.file_name || "-"}
                            </div>

                            <div className="text-[11px] text-gray-400 mt-1">
                              ID: {item.id_import}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm text-center">
                            {item.total_rows ?? 0}
                          </td>

                          <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">
                            {item.valid_rows ?? 0}
                          </td>

                          <td className="px-4 py-3 text-sm text-center">
                            {formatDateTime(item.created_at)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                              COMMITTED
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(item)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition"
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
              {/* ============================================ */}
              {/* DETAIL HEADER */}
              {/* ============================================ */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImport(null);
                      setSelectedDetail([]);
                      setConfirmText("");
                      setShowRollbackConfirm(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold mb-2"
                  >
                    ← Kembali ke history
                  </button>

                  <h3 className="text-base font-bold text-gray-800">
                    Detail Import
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {selectedImport.file_name || "-"}
                  </p>
                </div>

                {/* ========================================== */}
                {/* ROLLBACK BUTTON */}
                {/* ========================================== */}

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRollbackDisabled) return;

                      setShowRollbackConfirm(true);
                    }}
                    disabled={isRollbackDisabled}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      isRollbackDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    <BsTrash3 size={16} />

                    {isRollbackDisabled
                      ? "Rollback Tidak Tersedia"
                      : "Rollback Import"}
                  </button>

                  {/* INFO DISABLE */}

                  {isRollbackDisabled && (
                    <div className="max-w-xs text-right">
                      <p className="text-[11px] text-red-500 leading-relaxed">
                        {rollbackRestriction.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ============================================ */}
              {/* SUMMARY */}
              {/* ============================================ */}

              {selectedSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <p className="text-xs text-gray-500">Total Row</p>

                    <p className="text-xl font-bold text-gray-800 mt-1">
                      {selectedSummary.total}
                    </p>
                  </div>

                  <div className="border rounded-xl p-4 bg-green-50">
                    <p className="text-xs text-green-600">Valid</p>

                    <p className="text-xl font-bold text-green-700 mt-1">
                      {selectedSummary.valid}
                    </p>
                  </div>

                  <div className="border rounded-xl p-4 bg-red-50">
                    <p className="text-xs text-red-600">Invalid</p>

                    <p className="text-xl font-bold text-red-700 mt-1">
                      {selectedSummary.invalid}
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================ */}
              {/* IMPORT INFO */}
              {/* ============================================ */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                <div className="border rounded-xl p-4">
                  <p className="text-xs text-gray-500">File</p>

                  <p className="text-sm font-semibold text-gray-800 mt-1 break-all">
                    {selectedImport.file_name || "-"}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-xs text-gray-500">Waktu Import</p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDateTime(selectedImport.created_at)}
                  </p>
                </div>
              </div>

              {/* ============================================ */}
              {/* DETAIL TABLE */}
              {/* ============================================ */}

              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

                  <p className="text-xs text-gray-500 mt-3">
                    Memuat detail import...
                  </p>
                </div>
              ) : selectedDetail.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-500">
                  Tidak ada detail import.
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl max-h-[45vh]">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 sticky top-0 z-10">
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
                          <td className="px-3 py-3 text-xs text-center">
                            {detail.row_number ?? index + 1}
                          </td>

                          <td className="px-4 py-3 text-sm font-semibold">
                            {detail.nama_kelas_raw || detail.nama_kelas || "-"}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {detail.mentor_raw || detail.nama_mentor || "-"}
                          </td>

                          <td className="px-4 py-3 text-sm text-center">
                            {formatDate(
                              detail.tanggal ||
                                detail.tanggal_efektif ||
                                detail.tanggal_jadwal,
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm text-center">
                            {formatTime(detail.waktu_mulai)} -{" "}
                            {formatTime(detail.waktu_selesai)}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {detail.topik_raw || detail.topik || "-"}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
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
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
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
        {/* ================================================== */}
        {/* WARNING */}
        {/* ================================================== */}

        {/* {selectedImport && (
          <div className="mt-5 p-4 mx-5 mb-5 rounded-xl bg-red-50 border border-red-200">
            <div className="flex gap-3">
              <div className="text-red-600 mt-0.5">
                <BsTrash3 size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Perhatian sebelum rollback
                </p>

                {isRollbackDisabled && (
                  <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      Rollback tidak dapat dilakukan karena terdapat jadwal pada
                      tanggal hari ini atau tanggal yang sudah terlewat.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )} */}

        {/* ================================================== */}
        {/* ROLLBACK CONFIRMATION */}
        {/* ================================================== */}

        {showRollbackConfirm && selectedImport && (
          <div
            className="absolute inset-0 z-20 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeRollbackConfirm}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ========================================== */}
              {/* CONFIRM HEADER */}
              {/* ========================================== */}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
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

              {/* ========================================== */}
              {/* WARNING BOX */}
              {/* ========================================== */}

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-red-700 leading-relaxed">
                  Anda akan menghapus seluruh jadwal yang berasal dari import:
                </p>

                <p className="text-sm font-bold text-red-800 mt-2 break-all">
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

              {/* ========================================== */}
              {/* CONFIRM INPUT */}
              {/* ========================================== */}

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ketik{" "}
                <span className="text-red-600 font-bold">
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              />

              {/* ========================================== */}
              {/* VALIDATION TEXT */}
              {/* ========================================== */}

              {confirmText.length > 0 &&
                confirmText !== ROLLBACK_CONFIRM_TEXT && (
                  <p className="text-xs text-red-500 mt-2">
                    Teks konfirmasi belum sesuai.
                  </p>
                )}

              {confirmText === ROLLBACK_CONFIRM_TEXT && (
                <p className="text-xs text-green-600 mt-2">
                  Konfirmasi benar. Anda dapat melanjutkan rollback.
                </p>
              )}

              {/* ========================================== */}
              {/* ACTION BUTTON */}
              {/* ========================================== */}

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={closeRollbackConfirm}
                  disabled={isRollbackLoading}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleRollback}
                  disabled={
                    isRollbackLoading || confirmText !== ROLLBACK_CONFIRM_TEXT
                  }
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRollbackLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
