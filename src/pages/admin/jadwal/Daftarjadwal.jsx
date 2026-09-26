import React, { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import {
  AiOutlineCalendar,
  AiOutlinePlus,
  AiOutlineSwap,
} from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { LuCalendarClock, LuPencil } from "react-icons/lu";
import { MdOutlineHistory } from "react-icons/md";
import { toast } from "react-toastify";

import Header from "../../../components/admin/Header.jsx";
import { ConfirmToast } from "../modal/ConfirmToast.jsx";
import Api from "../../../utils/Api.jsx";

import TambahJadwalForm from "./modal/TambahJadwalForm.jsx";
import EditJadwalForm from "./modal/EditJadwalForm.jsx";
import RescheduleJadwalModal from "./modal/RescheduleJadwalModal.jsx";
import ImportHistoryModal from "./modal/ImportHistoryModal.jsx";
import SwitchMentorModal from "./modal/SwitchMentorModal.jsx";

// ========================================================================
// CONSTANT
// ========================================================================

const INITIAL_PER_PAGE = 50;
const SEARCH_DEBOUNCE = 500;

// ========================================================================
// DATE HELPER
// ========================================================================

const getCurrentMonth = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

const getMonthDateRange = (monthValue) => {
  if (!monthValue) {
    return {
      startDate: "",
      endDate: "",
    };
  }

  const [year, month] = monthValue.split("-").map(Number);

  if (!year || !month) {
    return {
      startDate: "",
      endDate: "",
    };
  }

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const formatDate = (date) => {
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getDate()).padStart(2, "0");

    return `${dateYear}-${dateMonth}-${dateDay}`;
  };

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
};

// ========================================================================
// MAIN COMPONENT
// ========================================================================

const DaftarJadwal = () => {
  // ========================================================================
  // STATE - FILTER
  // ========================================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");

  const [periodMode, setPeriodMode] = useState("month");
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // ========================================================================
  // STATE - DATA
  // ========================================================================

  const [jadwalData, setJadwalData] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================================================
  // STATE - PAGINATION
  // ========================================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [perPage, setPerPage] = useState(INITIAL_PER_PAGE);

  // ========================================================================
  // STATE - MODAL
  // ========================================================================

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
  const [showSwitchMentorModal, setShowSwitchMentorModal] = useState(false);

  const [selectedSwitchJadwal, setSelectedSwitchJadwal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  // ========================================================================
  // ACTIVE DATE RANGE
  // ========================================================================

  const activeDateRange = useMemo(() => {
    if (periodMode === "month") {
      return getMonthDateRange(filterMonth);
    }

    return {
      startDate: filterStartDate,
      endDate: filterEndDate,
    };
  }, [periodMode, filterMonth, filterStartDate, filterEndDate]);

  // ========================================================================
  // FETCH JADWAL
  // ========================================================================

  const fetchJadwalData = useCallback(
    async (
      page = 1,
      search = "",
      kelasId = "",
      currentPerPage = INITIAL_PER_PAGE,
      startDate = "",
      endDate = "",
    ) => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", page);
        params.set("per_page", currentPerPage);

        const trimmedSearch = search.trim();

        if (trimmedSearch) {
          params.set("search", trimmedSearch);
        }

        if (kelasId) {
          params.set("id_paketkelas", kelasId);
        }

        if (startDate) {
          params.set("start_date", startDate);
        }

        if (endDate) {
          params.set("end_date", endDate);
        }

        const response = await Api.get(`/jadwal?${params.toString()}`);

        const result = response?.data;

        const data = Array.isArray(result?.data) ? result.data : [];

        const meta = result?.meta || {};

        // ================================================================
        // UPDATE DATA
        // ================================================================

        setJadwalData(data);

        // ================================================================
        // UPDATE PAGINATION
        // Backend menggunakan "total_pages"
        // ================================================================

        setCurrentPage(Number(meta.page) || page);
        setTotalData(Number(meta.total) || 0);
        setTotalPage(Math.max(Number(meta.total_pages) || 1, 1));
      } catch (error) {
        console.error("Gagal mengambil data jadwal:", error);

        setJadwalData([]);
        setTotalData(0);
        setTotalPage(1);

        setError("Gagal memuat data jadwal.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ========================================================================
  // FETCH KELAS
  // ========================================================================

  const fetchKelasOptions = useCallback(async () => {
    try {
      const response = await Api.get("/paket-kelas?limit=999");

      const result = response?.data;

      setKelasOptions(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    }
  }, []);

  // ========================================================================
  // DEBOUNCED FILTER FETCH
  // ========================================================================

  const debouncedFetch = useMemo(
    () =>
      debounce(
        (nextSearch, nextKelas, nextPerPage, nextStartDate, nextEndDate) => {
          fetchJadwalData(
            1,
            nextSearch,
            nextKelas,
            nextPerPage,
            nextStartDate,
            nextEndDate,
          );
        },
        SEARCH_DEBOUNCE,
      ),
    [fetchJadwalData],
  );

  // ========================================================================
  // INITIAL LOAD - KELAS
  // ========================================================================

  useEffect(() => {
    fetchKelasOptions();
  }, [fetchKelasOptions]);

  // ========================================================================
  // FILTER CHANGE
  // ========================================================================

  useEffect(() => {
    setCurrentPage(1);

    debouncedFetch(
      searchTerm,
      filterKelas,
      perPage,
      activeDateRange.startDate,
      activeDateRange.endDate,
    );

    return () => {
      debouncedFetch.cancel();
    };
  }, [
    searchTerm,
    filterKelas,
    filterMonth,
    perPage,
    activeDateRange.startDate,
    activeDateRange.endDate,
    debouncedFetch,
  ]);

  // ========================================================================
  // PAGINATION
  // ========================================================================

  const handlePageChange = (newPage) => {
    if (isLoading) return;

    if (newPage < 1 || newPage > totalPage) return;

    setCurrentPage(newPage);

    fetchJadwalData(
      newPage,
      searchTerm,
      filterKelas,
      perPage,
      activeDateRange.startDate,
      activeDateRange.endDate,
    );
  };

  // ========================================================================
  // REFRESH CURRENT PAGE
  // ========================================================================

  const handleRefreshFetch = useCallback(() => {
    fetchJadwalData(
      currentPage,
      searchTerm,
      filterKelas,
      perPage,
      activeDateRange.startDate,
      activeDateRange.endDate,
    );
  }, [
    fetchJadwalData,
    currentPage,
    searchTerm,
    filterKelas,
    perPage,
    activeDateRange.startDate,
    activeDateRange.endDate,
  ]);

  // ========================================================================
  // FILTER HANDLER
  // ========================================================================

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterKelasChange = (event) => {
    setFilterKelas(event.target.value);
  };

  const handlePeriodModeChange = (event) => {
    const mode = event.target.value;

    setPeriodMode(mode);

    if (mode === "month") {
      setFilterStartDate("");
      setFilterEndDate("");

      if (!filterMonth) {
        setFilterMonth(getCurrentMonth());
      }
    }

    if (mode === "range") {
      setFilterMonth("");
    }
  };

  const handleMonthChange = (event) => {
    setFilterMonth(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const startDate = event.target.value;

    setFilterStartDate(startDate);

    if (filterEndDate && startDate > filterEndDate) {
      setFilterEndDate("");
    }
  };

  const handleEndDateChange = (event) => {
    const endDate = event.target.value;

    if (filterStartDate && endDate < filterStartDate) {
      toast.warning("Tanggal akhir tidak boleh lebih kecil dari tanggal awal.");
      return;
    }

    setFilterEndDate(endDate);
  };

  // ========================================================================
  // RESET FILTER
  // ========================================================================

  const handleResetFilter = () => {
    setSearchTerm("");
    setFilterKelas("");
    setPeriodMode("month");
    setFilterMonth(getCurrentMonth());
    setFilterStartDate("");
    setFilterEndDate("");
    setCurrentPage(1);
  };

  // ========================================================================
  // ACTION HANDLER
  // ========================================================================

  const handleEditClick = (jadwal) => {
    setSelectedId(jadwal.id_jadwal);
    setSelectedData(jadwal);
    setShowEditModal(true);
  };

  const handleRescheduleClick = (jadwal) => {
    setSelectedId(jadwal.id_jadwal);
    setSelectedData(jadwal);
    setShowRescheduleModal(true);
  };

  const handleOpenSwitchMentor = (jadwal) => {
    setSelectedSwitchJadwal(jadwal);
    setShowSwitchMentorModal(true);
  };

  const handleImportHistoryClick = () => {
    setShowImportHistoryModal(true);
  };

  const handleTambahClick = () => {
    setShowTambahModal(true);
  };

  // ========================================================================
  // DELETE HANDLER
  // ========================================================================

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus jadwal ini?", async () => {
      try {
        await Api.delete(`/jadwal/${id}`);

        toast.success("Jadwal berhasil dihapus.");

        await fetchJadwalData(
          currentPage,
          searchTerm,
          filterKelas,
          perPage,
          activeDateRange.startDate,
          activeDateRange.endDate,
        );
      } catch (error) {
        console.error("Gagal menghapus jadwal:", error);

        toast.error("Gagal menghapus jadwal.");
      }
    });
  };

  // ========================================================================
  // BADGE - STATUS
  // ========================================================================

  const getStatusBadge = (status) => {
    if (status === 1) {
      return (
        <span className="whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
          Aktif
        </span>
      );
    }

    return (
      <span className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
        Nonaktif
      </span>
    );
  };

  // ========================================================================
  // BADGE - TIPE PERTEMUAN
  // ========================================================================

  const getTypePertemuanBadge = (type) => {
    if (type === "ONLINE") {
      return (
        <span className="whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
          ONLINE
        </span>
      );
    }

    return (
      <span className="whitespace-nowrap rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
        OFFLINE
      </span>
    );
  };

  // ========================================================================
  // FORMAT DATE
  // ========================================================================

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // ========================================================================
  // FORMAT TIME
  // ========================================================================

  const formatTime = (timeString) => {
    if (!timeString) return "-";

    return String(timeString).substring(0, 5);
  };

  // ========================================================================
  // PERIOD LABEL
  // ========================================================================

  const getPeriodLabel = () => {
    if (!filterMonth) {
      return "Semua periode";
    }

    const [year, month] = filterMonth.split("-").map(Number);

    if (!year || !month) {
      return "Periode bulan";
    }

    return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  // ========================================================================
  // TABLE ROWS
  // ========================================================================

  const renderTableRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan="10"
            className="px-4 py-10 text-center text-sm text-gray-500"
          >
            Memuat data jadwal...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan="10"
            className="px-4 py-10 text-center text-sm text-red-500"
          >
            {error}
          </td>
        </tr>
      );
    }

    if (jadwalData.length === 0) {
      return (
        <tr>
          <td
            colSpan="10"
            className="px-4 py-10 text-center text-sm text-gray-500"
          >
            Tidak ada data jadwal.
          </td>
        </tr>
      );
    }

    return jadwalData.map((jadwal, index) => {
      const nomor = (currentPage - 1) * perPage + index + 1;

      const tanggalEfektif = jadwal.tanggal_efektif || jadwal.tanggal;

      const waktuMulai = jadwal.waktu_mulai_efektif || jadwal.waktu_mulai;

      const waktuSelesai = jadwal.waktu_selesai_efektif || jadwal.waktu_selesai;

      return (
        <tr
          key={jadwal.id_jadwal}
          className="border-b text-sm transition-colors hover:bg-gray-50"
        >
          {/* ================================================================
              NOMOR
          ================================================================ */}
          <td className="whitespace-nowrap px-4 py-3 text-gray-600">{nomor}</td>

          {/* ================================================================
              NAMA KELAS
          ================================================================ */}
          <td className="px-4 py-3 font-semibold text-gray-800">
            {jadwal.nama_kelas || "-"}
          </td>

          {/* ================================================================
              MENTOR
          ================================================================ */}
          <td className="px-4 py-3 text-gray-700">
            {jadwal.nama_mentor || "-"}
          </td>

          {/* ================================================================
              TANGGAL
          ================================================================ */}
          <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
            {formatDate(tanggalEfektif)}
          </td>

          {/* ================================================================
              JAM
          ================================================================ */}
          <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
            {formatTime(waktuMulai)} - {formatTime(waktuSelesai)}
          </td>

          {/* ================================================================
              TIPE PERTEMUAN
          ================================================================ */}
          <td className="px-4 py-3 text-center">
            {getTypePertemuanBadge(jadwal.type_pertemuan)}
          </td>

          {/* ================================================================
              TOPIK
          ================================================================ */}
          <td className="max-w-xs px-4 py-3 text-gray-700">
            <div className="line-clamp-2">{jadwal.topik || "-"}</div>
          </td>

          {/* ================================================================
              CATATAN
          ================================================================ */}
          <td className="max-w-xs px-4 py-3 text-gray-600">
            <div className="line-clamp-2">{jadwal.catatan || "-"}</div>
          </td>

          {/* ================================================================
              STATUS
          ================================================================ */}
          <td className="px-4 py-3 text-center">
            {getStatusBadge(jadwal.status)}
          </td>

          {/* ================================================================
              AKSI
          ================================================================ */}
          <td className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              {/* EDIT */}
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => handleEditClick(jadwal)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
                  aria-label="Edit jadwal"
                >
                  <LuPencil className="h-4 w-4" />
                </button>

                <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                  Edit jadwal
                </span>
              </div>

              {/* SWITCH MENTOR */}
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => handleOpenSwitchMentor(jadwal)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white transition-colors hover:bg-yellow-600"
                  aria-label="Switch mentor"
                >
                  <AiOutlineSwap className="h-4 w-4" />
                </button>

                <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                  Switch mentor
                </span>
              </div>

              {/* RESCHEDULE */}
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => handleRescheduleClick(jadwal)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600"
                  aria-label="Reschedule jadwal"
                >
                  <LuCalendarClock className="h-4 w-4" />
                </button>

                <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                  Reschedule
                </span>
              </div>

              {/* DELETE */}
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => handleDelete(jadwal.id_jadwal)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                  aria-label="Hapus jadwal"
                >
                  <BsTrash3 className="h-4 w-4" />
                </button>

                <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                  Hapus jadwal
                </span>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="user relative min-h-screen bg-gradient-to-r from-[#a11d1d] to-[#531d1d] px-4">
      <Header />
      {/* ====================================================================
          HEADER
      ==================================================================== */}

      {/* ====================================================================
          MAIN CONTENT
      ==================================================================== */}

      <main className="px-4 py-3 md:px-5 md:py-4">
        <div className="rounded-xl bg-white shadow-sm">
          {/* ==================================================================
              HEADER
          ================================================================== */}

          <div className="border-b px-4 py-3 md:px-5">
            {/* ================================================================
                ROW 1 - TITLE & ACTION
            ================================================================ */}

            <div className="flex items-center justify-between gap-3">
              {/* TITLE */}
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-gray-800">
                  Daftar Jadwal
                </h1>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  Periode:{" "}
                  <span className="font-semibold text-gray-700">
                    {getPeriodLabel()}
                  </span>
                </p>
              </div>

              {/* ACTION */}
              <div className="flex shrink-0 items-center gap-1.5">
                {/* HISTORY IMPORT */}
                <button
                  type="button"
                  onClick={handleImportHistoryClick}
                  className="flex h-8 items-center justify-center gap-1 rounded-md bg-gray-500 px-2.5 text-xs font-medium text-white transition-colors hover:bg-gray-600"
                >
                  <MdOutlineHistory className="h-3.5 w-3.5" />
                  <span>History</span>
                </button>

                {/* TAMBAH JADWAL */}
                <button
                  type="button"
                  onClick={handleTambahClick}
                  className="flex h-8 items-center justify-center gap-1 rounded-md bg-yellow-500 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-yellow-600"
                >
                  <AiOutlinePlus className="h-3.5 w-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* ================================================================
                ROW 2 - FILTER
            ================================================================ */}

            <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
              {/* SEARCH */}
              <div className="relative w-48">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Cari kelas/mentor/topik..."
                  className="h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                />
              </div>

              {/* KELAS */}
              <div className="relative w-40">
                <select
                  value={filterKelas}
                  onChange={handleFilterKelasChange}
                  className="h-8 w-full appearance-none rounded-md border border-gray-300 bg-white px-2.5 pr-7 text-xs text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                >
                  <option value="">Semua Kelas</option>

                  {kelasOptions.map((kelas) => (
                    <option
                      key={kelas.id_paketkelas}
                      value={kelas.id_paketkelas}
                    >
                      {kelas.nama_kelas}
                    </option>
                  ))}
                </select>

                <svg
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* MODE PERIODE */}
              <div className="relative w-24">
                <select
                  value={periodMode}
                  onChange={handlePeriodModeChange}
                  className="h-8 w-full appearance-none rounded-md border border-gray-300 bg-white px-2.5 pr-7 text-xs font-medium text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                >
                  <option value="month">Bulanan</option>
                  <option value="range">Range</option>
                </select>

                <svg
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* BULAN */}
              {periodMode === "month" && (
                <div className="relative w-36">
                  <AiOutlineCalendar
                    className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                    size={14}
                  />

                  <input
                    type="month"
                    value={filterMonth}
                    onChange={handleMonthChange}
                    className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-1.5 text-xs font-medium text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  />
                </div>
              )}

              {/* RANGE */}
              {periodMode === "range" && (
                <>
                  {/* TANGGAL AWAL */}
                  <div className="relative w-32">
                    <AiOutlineCalendar
                      className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                      size={14}
                    />

                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={handleStartDateChange}
                      className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-1.5 text-xs font-medium text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      aria-label="Tanggal awal"
                    />
                  </div>

                  <span className="text-[10px] font-medium text-gray-400">
                    s/d
                  </span>

                  {/* TANGGAL AKHIR */}
                  <div className="relative w-32">
                    <AiOutlineCalendar
                      className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                      size={14}
                    />

                    <input
                      type="date"
                      value={filterEndDate}
                      min={filterStartDate || undefined}
                      onChange={handleEndDateChange}
                      className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-1.5 text-xs font-medium text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      aria-label="Tanggal akhir"
                    />
                  </div>
                </>
              )}

              {/* RESET */}
              {(searchTerm.trim() ||
                filterKelas ||
                filterMonth !== getCurrentMonth() ||
                filterStartDate ||
                filterEndDate ||
                periodMode !== "month") && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ==================================================================
              TABLE
          ================================================================== */}

          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <table className="min-w-full bg-white">
              <thead className="sticky top-0 z-10 border-b bg-gray-200">
                <tr className="text-[11px] uppercase text-gray-700">
                  <th className="whitespace-nowrap px-3 py-2.5">No</th>

                  <th className="whitespace-nowrap px-3 py-2.5">Nama Kelas</th>

                  <th className="whitespace-nowrap px-3 py-2.5">Mentor</th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Tanggal Efektif
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Jam
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Tipe Pertemuan
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5">Topik</th>

                  <th className="whitespace-nowrap px-3 py-2.5">Catatan</th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>

          {/* ==================================================================
              PAGINATION
          ================================================================== */}

          <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-2.5 sm:flex-row md:px-5">
            {/* PAGINATION INFO */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-md border bg-gray-50 px-2 py-1 text-[11px]">
                <span className="font-bold text-gray-500">DATA:</span>

                <select
                  value={perPage}
                  onChange={(event) => {
                    const newPerPage = Number(event.target.value);

                    setPerPage(newPerPage);
                    setCurrentPage(1);

                    fetchJadwalData(
                      1,
                      searchTerm,
                      filterKelas,
                      newPerPage,
                      activeDateRange.startDate,
                      activeDateRange.endDate,
                    );
                  }}
                  className="cursor-pointer bg-transparent font-bold text-blue-600 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <p className="text-[10px] font-semibold text-gray-500">
                Total: <span className="text-blue-600">{totalData}</span> Jadwal
                | Hal <span className="text-blue-600">{currentPage}</span> dari{" "}
                {totalPage}
              </p>
            </div>

            {/* PAGINATION BUTTON */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isLoading || currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  isLoading || currentPage <= 1
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "border border-blue-500 bg-white text-blue-500 hover:bg-blue-50"
                }`}
              >
                Previous
              </button>

              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 text-[11px] font-bold text-white">
                {currentPage}
              </span>

              <button
                type="button"
                disabled={isLoading || currentPage >= totalPage}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  isLoading || currentPage >= totalPage
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "border border-blue-500 bg-white text-blue-500 hover:bg-blue-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          MODAL - HISTORY IMPORT
      ==================================================================== */}

      {showImportHistoryModal && (
        <ImportHistoryModal
          setShowModal={setShowImportHistoryModal}
          fetchJadwal={handleRefreshFetch}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterKelas}
          limit={perPage}
        />
      )}

      {/* ====================================================================
          MODAL - TAMBAH JADWAL
      ==================================================================== */}

      {showTambahModal && (
        <TambahJadwalForm
          setShowModal={setShowTambahModal}
          fetchJadwal={handleRefreshFetch}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterKelas}
          limit={perPage}
        />
      )}

      {/* ====================================================================
          MODAL - EDIT JADWAL
      ==================================================================== */}

      {showEditModal && selectedData && (
        <EditJadwalForm
          setShowModal={setShowEditModal}
          fetchJadwal={handleRefreshFetch}
          selectedId={selectedId}
          initialData={selectedData}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterKelas}
          limit={perPage}
        />
      )}

      {/* ====================================================================
          MODAL - RESCHEDULE
      ==================================================================== */}

      {showRescheduleModal && selectedData && (
        <RescheduleJadwalModal
          setShowModal={setShowRescheduleModal}
          fetchJadwal={handleRefreshFetch}
          selectedId={selectedId}
          initialData={selectedData}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterKelas}
          limit={perPage}
        />
      )}

      {/* ====================================================================
          MODAL - SWITCH MENTOR
      ==================================================================== */}

      {showSwitchMentorModal && selectedSwitchJadwal && (
        <SwitchMentorModal
          setShowModal={setShowSwitchMentorModal}
          fetchJadwal={handleRefreshFetch}
          selectedJadwal={selectedSwitchJadwal}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterKelas}
          limit={perPage}
        />
      )}
    </div>
  );
};

export default DaftarJadwal;
