import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { AiOutlineClose, AiOutlineDownload } from "react-icons/ai";
import { LuEye } from "react-icons/lu";
import { toast } from "react-toastify";

import Header from "../../components/admin/Header.jsx";
import Api from "../../utils/Api.jsx";
import {
  formatRupiah,
  downloadBlobResponse,
  getPesanErrorBlob,
  STATUS_SESI,
} from "../../utils/formatPayroll.js";

import DetailPayrollModal from "./modal/DetailPayrollModal.jsx";

const DaftarPayroll = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bulan, setBulan] = useState("");
  const [payrollData, setPayrollData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingSlipId, setDownloadingSlipId] = useState(null);
  const [error, setError] = useState("");

  // --- MODAL STATES ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Bulan kosong = pakai "bulan berjalan" versi server (meta.bulan)
  const bulanAktif = bulan || meta?.bulan || "";

  // 1. Fungsi Fetch Rekap Payroll
  const fetchPayrollData = useCallback(
    async (search = "", currentBulan = "") => {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();

        if (currentBulan) {
          params.append("bulan", currentBulan);
        }

        if (search && search.trim() !== "") {
          params.append("search", search.trim());
        }

        const response = await Api.get(`/payroll/mentor?${params.toString()}`);
        const result = response.data;

        setPayrollData(result.data || []);
        setMeta(result.meta || null);
      } catch (error) {
        console.error("Gagal mengambil data payroll mentor:", error);
        setError(
          error.response?.data?.message || "Gagal memuat data payroll mentor.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 2. Debounce Search & Bulan
  const debouncedFetch = useRef(
    debounce((nextSearch, nextBulan) => {
      fetchPayrollData(nextSearch, nextBulan);
    }, 500),
  ).current;

  // 3. Effect untuk memantau perubahan search dan bulan
  useEffect(() => {
    debouncedFetch(searchTerm, bulan);
    return () => debouncedFetch.cancel();
  }, [searchTerm, bulan, debouncedFetch]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleBulanChange = (e) => setBulan(e.target.value);

  // --- ACTIONS ---
  const handleOpenDetail = (item) => {
    setSelectedMentor(item);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedMentor(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      if (bulanAktif) {
        params.append("bulan", bulanAktif);
      }

      const response = await Api.get(
        `/payroll/mentor/export?${params.toString()}`,
        { responseType: "blob" },
      );

      downloadBlobResponse(response, `rekap_payroll_mentor_${bulanAktif}.xlsx`);

      toast.success("Rekap payroll berhasil diunduh.");
    } catch (error) {
      const msg = await getPesanErrorBlob(
        error,
        "Gagal mengunduh rekap payroll.",
      );
      toast.error(msg);
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSlip = async (item) => {
    setDownloadingSlipId(item.id_mentor);
    try {
      const params = new URLSearchParams();
      params.append("preview", "false");

      if (bulanAktif) {
        params.append("bulan", bulanAktif);
      }

      const response = await Api.get(
        `/payroll/mentor/${item.id_mentor}/slip?${params.toString()}`,
        { responseType: "blob" },
      );

      downloadBlobResponse(
        response,
        `slip_payroll_mentor_${item.id_mentor}_${bulanAktif}.pdf`,
      );

      toast.success(`Slip payroll ${item.nickname_mentor} berhasil diunduh.`);
    } catch (error) {
      const msg = await getPesanErrorBlob(
        error,
        "Gagal mengunduh slip payroll.",
      );
      toast.error(msg);
      console.error("Download slip error:", error);
    } finally {
      setDownloadingSlipId(null);
    }
  };

  const renderStatusChips = (item) => {
    const chips = STATUS_SESI.filter((status) => item[status.field] > 0);

    if (chips.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="flex flex-wrap justify-center gap-1">
        {chips.map((status) => (
          <span
            key={status.key}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${status.className}`}
          >
            {item[status.field]} {status.label}
          </span>
        ))}
      </div>
    );
  };

  const renderTableRows = () =>
    payrollData.map((item, index) => (
      <tr key={item.id_mentor} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {index + 1}
        </td>

        {/* Mentor + Nickname */}
        <td className="px-4 py-3 border">
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-gray-800 leading-tight">
              {item.nama_mentor}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">
              {item.nickname_mentor}
            </span>
          </div>
        </td>

        {/* Sesi + Kelas */}
        <td className="px-4 py-2 border text-center">
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-gray-800">
              {item.jumlah_sesi} Sesi
            </span>
            <span className="text-[10px] text-gray-500">
              {item.jumlah_kelas} Kelas
            </span>
          </div>
        </td>

        <td className="px-4 py-2 border">{renderStatusChips(item)}</td>

        <td className="px-4 py-2 text-xs sm:text-sm border text-center text-gray-600">
          {item.total_jam_jadwal_label}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border text-center font-semibold text-gray-800">
          {item.total_jam_dibayar_label}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border text-right font-bold text-green-700 whitespace-nowrap">
          {formatRupiah(item.honor)}
        </td>

        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[110px]">
          <div className="flex justify-center gap-2">
            <div className="relative group">
              <button
                onClick={() => handleOpenDetail(item)}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LuEye className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Lihat rincian
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => handleDownloadSlip(item)}
                disabled={downloadingSlipId === item.id_mentor}
                className="p-2 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-wait text-white"
              >
                {downloadingSlipId === item.id_mentor ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <AiOutlineDownload className="w-4 h-4" />
                )}
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Download slip
              </span>
            </div>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="user bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center py-4 px-8 gap-4">
          {/* Kolom kiri (Search) */}
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari nama atau nickname mentor..."
              className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>

          {/* Kolom tengah (Judul) */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-gray-800 tracking-tight">
              Payroll Mentor
            </h1>
            {meta?.nama_bulan && (
              <p className="text-xs font-semibold text-red-600">
                {meta.nama_bulan}
              </p>
            )}
          </div>

          {/* Kolom kanan (Filter Bulan + Export) */}
          <div className="flex justify-end items-center gap-2">
            <input
              type="month"
              value={bulanAktif}
              onChange={handleBulanChange}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
            <button
              onClick={handleExport}
              disabled={isExporting || payrollData.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md transition-transform hover:scale-105 disabled:hover:scale-100 whitespace-nowrap"
            >
              <AiOutlineDownload />
              {isExporting ? "Mengunduh..." : "Export XLSX"}
            </button>
          </div>
        </div>

        {/* --- KARTU RINGKASAN --- */}
        {meta && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-8 pb-4">
            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                Total Mentor
              </p>
              <p className="text-lg font-bold text-gray-800">{meta.total}</p>
            </div>
            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                Total Jam Dibayar
              </p>
              <p className="text-lg font-bold text-gray-800">
                {meta.total_jam_dibayar_label}
              </p>
            </div>
            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                Tarif per Jam
              </p>
              <p className="text-lg font-bold text-gray-800">
                {formatRupiah(meta.tarif_per_jam)}
              </p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase text-green-600 tracking-wider">
                Total Honor
              </p>
              <p className="text-lg font-bold text-green-700">
                {formatRupiah(meta.total_honor)}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">{error}</p>
        ) : (
          <div className="overflow-x-auto max-h-[58vh]">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                <tr className="text-xs uppercase text-gray-600 tracking-widest font-extrabold">
                  <th className="px-4 py-4 w-16">No</th>
                  <th className="px-4 py-4 text-left">Mentor</th>
                  <th className="px-4 py-4 text-center">Sesi</th>
                  <th className="px-4 py-4 text-center">Status Sesi</th>
                  <th className="px-4 py-4 text-center">Jam Jadwal</th>
                  <th className="px-4 py-4 text-center">Jam Dibayar</th>
                  <th className="px-4 py-4 text-right">Honor</th>
                  <th className="px-4 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.length > 0 ? (
                  renderTableRows()
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-20 text-gray-400 italic"
                    >
                      Belum ada sesi mentor pada bulan ini.
                    </td>
                  </tr>
                )}
              </tbody>
              {payrollData.length > 0 && meta && (
                <tfoot className="bg-gray-200 sticky bottom-0 border-t">
                  <tr className="text-xs sm:text-sm font-extrabold text-gray-700">
                    <td
                      colSpan="5"
                      className="px-4 py-3 text-right uppercase tracking-widest"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-center">
                      {meta.total_jam_dibayar_label}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 whitespace-nowrap">
                      {formatRupiah(meta.total_honor)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL PAYROLL MENTOR */}
      {showDetailModal && selectedMentor && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl p-8 relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseDetail}
              className="absolute top-2 right-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 z-[70]"
            >
              <AiOutlineClose size={24} />
            </button>

            <DetailPayrollModal
              idMentor={selectedMentor.id_mentor}
              bulanAwal={bulanAktif}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPayroll;
