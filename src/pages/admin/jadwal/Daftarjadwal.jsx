import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import debounce from "lodash/debounce";
import {
  AiOutlineCalendar,
  AiOutlinePlus,
  AiOutlineSwap,
} from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import {
  LuCalendarClock,
  LuChevronRight,
  LuLayers,
  LuPencil,
} from "react-icons/lu";
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
import GroupKelasModal from "./modal/GroupKelasModal.jsx";
import EditGroupJadwalModal from "./modal/EditGroupJadwalModal.jsx";
import RescheduleGroupJadwalModal from "./modal/RescheduleGroupJadwalModal.jsx";
import SwitchMentorGroupModal from "./modal/SwitchMentorGroupModal.jsx";

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
  const [filterType, setFilterType] = useState("");
  const [filterDestinationId, setFilterDestinationId] = useState("");

  const [periodMode, setPeriodMode] = useState("month");
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Urutan default: jadwal yang belum selesai tampil lebih dulu (terdekat),
  // lalu yang sudah selesai (terbaru). Tidak ada data yang disembunyikan.
  const [sortUpcoming, setSortUpcoming] = useState(true);
  const sortUpcomingRef = useRef(sortUpcoming);
  sortUpcomingRef.current = sortUpcoming;

  // ========================================================================
  // STATE - DATA
  // ========================================================================

  const [jadwalData, setJadwalData] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [kelompokOptions, setKelompokOptions] = useState([]);

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
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Aksi group (v2) - berlaku untuk semua jadwal dalam 1 group
  const [groupAction, setGroupAction] = useState(null); // "edit" | "reschedule" | "switch"
  const [actionGroup, setActionGroup] = useState(null);

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
      meetingType = "",
      destinationId = "",
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

        if (meetingType) {
          params.set("type_pertemuan", meetingType);
        }

        if (destinationId && meetingType === "ONLINE") {
          params.set("id_paketkelas", destinationId);
        } else if (destinationId && meetingType === "OFFLINE") {
          params.set("id_kelompok", destinationId);
        }

        if (startDate) {
          params.set("start_date", startDate);
        }

        if (endDate) {
          params.set("end_date", endDate);
        }

        params.set("upcoming", sortUpcomingRef.current ? "1" : "0");

        // Data jadwal sudah di-group per mentor + tipe + tanggal + jam
        const response = await Api.get(`/jadwal/v2/group?${params.toString()}`);

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

  const fetchFilterOptions = useCallback(async () => {
    const [kelasResult, kelompokResult] = await Promise.allSettled([
      Api.get("/paket-kelas?limit=999"),
      Api.get("/kelompok/all"),
    ]);

    if (kelasResult.status === "fulfilled") {
      const result = kelasResult.value?.data;
      setKelasOptions(Array.isArray(result?.data) ? result.data : []);
    } else {
      console.error("Gagal mengambil data kelas:", kelasResult.reason);
    }

    if (kelompokResult.status === "fulfilled") {
      const payload = kelompokResult.value?.data;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];
      setKelompokOptions(rows);
    } else {
      console.error("Gagal mengambil data kelompok:", kelompokResult.reason);
      toast.error("Gagal memuat daftar kelompok.");
    }
  }, []);

  // ========================================================================
  // DEBOUNCED FILTER FETCH
  // ========================================================================

  const debouncedFetch = useMemo(
    () =>
      debounce(
        (
          nextSearch,
          nextType,
          nextDestinationId,
          nextPerPage,
          nextStartDate,
          nextEndDate,
        ) => {
          fetchJadwalData(
            1,
            nextSearch,
            nextType,
            nextDestinationId,
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
  // INITIAL LOAD - CLASS AND GROUP FILTERS
  // ========================================================================

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // ========================================================================
  // FILTER CHANGE
  // ========================================================================

  useEffect(() => {
    setCurrentPage(1);

    debouncedFetch(
      searchTerm,
      filterType,
      filterDestinationId,
      perPage,
      activeDateRange.startDate,
      activeDateRange.endDate,
    );

    return () => {
      debouncedFetch.cancel();
    };
  }, [
    searchTerm,
    filterType,
    filterDestinationId,
    filterMonth,
    perPage,
    sortUpcoming,
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
      filterType,
      filterDestinationId,
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
      filterType,
      filterDestinationId,
      perPage,
      activeDateRange.startDate,
      activeDateRange.endDate,
    );
  }, [
    fetchJadwalData,
    currentPage,
    searchTerm,
    filterType,
    filterDestinationId,
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

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setFilterDestinationId("");
  };

  const handleFilterDestinationChange = (event) => {
    setFilterDestinationId(event.target.value);
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
    setFilterType("");
    setFilterDestinationId("");
    setPeriodMode("month");
    setFilterMonth(getCurrentMonth());
    setFilterStartDate("");
    setFilterEndDate("");
    setSortUpcoming(true);
    setCurrentPage(1);
  };

  // ========================================================================
  // ACTION HANDLER
  // ========================================================================

  const handleEditClick = (jadwal) => {
    setSelectedGroup(null);
    setSelectedId(jadwal.id_jadwal);
    setSelectedData(jadwal);
    setShowEditModal(true);
  };

  const handleRescheduleClick = (jadwal) => {
    setSelectedGroup(null);
    setSelectedId(jadwal.id_jadwal);
    setSelectedData(jadwal);
    setShowRescheduleModal(true);
  };

  const handleOpenSwitchMentor = (jadwal) => {
    setSelectedGroup(null);
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
        setSelectedGroup(null);

        await fetchJadwalData(
          currentPage,
          searchTerm,
          filterType,
          filterDestinationId,
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
  // AKSI GROUP (v2) - DITERAPKAN KE SEMUA JADWAL DALAM GROUP
  // ========================================================================

  const openGroupAction = (action, group) => {
    setActionGroup(group);
    setGroupAction(action);
  };

  const closeGroupAction = () => {
    setGroupAction(null);
    setActionGroup(null);
  };

  const handleDeleteGroup = (group) => {
    const total = group.count ?? group.classes?.length ?? 1;
    const message =
      total > 1
        ? `Yakin ingin menghapus ${total} jadwal dalam group ini?`
        : "Yakin ingin menghapus jadwal ini?";

    ConfirmToast(message, async () => {
      try {
        const response = await Api.delete(
          `/jadwal/v2/group/${group.id_jadwal}`,
        );

        toast.success(response?.data?.message || "Jadwal berhasil dihapus.");

        handleRefreshFetch();
      } catch (error) {
        console.error("Gagal menghapus group jadwal:", error);

        toast.error(
          error?.response?.data?.message || "Gagal menghapus jadwal.",
        );
      }
    });
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
            colSpan="8"
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
            colSpan="8"
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
            colSpan="8"
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

      const isOffline = jadwal.type_pertemuan === "OFFLINE";
      const targets = Array.isArray(jadwal.classes) ? jadwal.classes : [];
      const jumlahTarget = jadwal.count ?? targets.length;
      const firstTarget = targets[0];

      return (
        <tr
          key={`${jadwal.id_mentor}-${jadwal.type_pertemuan}-${tanggalEfektif}-${waktuMulai}-${waktuSelesai}`}
          className={`border-b text-sm transition-colors hover:bg-gray-50 ${
            jadwal.is_selesai ? "bg-gray-50/60 opacity-60" : ""
          }`}
        >
          {/* NOMOR */}
          <td className="whitespace-nowrap px-4 py-3 text-gray-600">{nomor}</td>

          {/* KELAS / KELOMPOK: 1 item = nama langsung, >1 = "{count} Kelas" */}
          <td className="px-4 py-3">
            {jumlahTarget === 1 ? (
              <span className="font-semibold text-gray-800 whitespace-nowrap">
                {(isOffline
                  ? firstTarget?.nama_kelompok
                  : firstTarget?.nama_kelas) ||
                  firstTarget?.nama_kelas ||
                  firstTarget?.nama_kelompok ||
                  "-"}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedGroup(jadwal)}
                title={`Lihat daftar ${isOffline ? "kelompok" : "kelas"}`}
                className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-sm ring-2 ring-yellow-200 transition hover:bg-yellow-600 hover:shadow-md focus:outline-none focus:ring-yellow-300 active:scale-95"
              >
                <LuLayers className="h-3.5 w-3.5" />
                {jumlahTarget} {isOffline ? "Kelompok" : "Kelas"}
                <LuChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </td>

          {/* MENTOR */}
          <td className="px-4 py-3 text-gray-700">
            {jadwal.nama_mentor || "-"}
          </td>

          {/* TANGGAL & JAM */}
          <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
            <div>{formatDate(tanggalEfektif)}</div>
            <div className="text-xs text-gray-500">
              {formatTime(waktuMulai)} - {formatTime(waktuSelesai)}
            </div>
          </td>

          {/* TIPE PERTEMUAN */}
          <td className="px-4 py-3 text-center">
            {getTypePertemuanBadge(jadwal.type_pertemuan)}
          </td>

          {/* TOPIK */}
          <td className="max-w-xs px-4 py-3 text-gray-700">
            <div className="line-clamp-2">{jadwal.topik || "-"}</div>
          </td>

          {/* CATATAN */}
          <td className="max-w-xs px-4 py-3 text-gray-600">
            <div className="line-clamp-2">{jadwal.catatan || "-"}</div>
          </td>

          {/* AKSI GROUP (berlaku untuk semua jadwal dalam group) */}
          <td className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              {[
                {
                  label: "Edit jadwal",
                  color: "bg-blue-500 hover:bg-blue-600",
                  icon: <LuPencil className="h-4 w-4" />,
                  onClick: () => openGroupAction("edit", jadwal),
                },
                {
                  label: "Switch mentor",
                  color: "bg-yellow-500 hover:bg-yellow-600",
                  icon: <AiOutlineSwap className="h-4 w-4" />,
                  onClick: () => openGroupAction("switch", jadwal),
                },
                {
                  label: "Reschedule",
                  color: "bg-orange-500 hover:bg-orange-600",
                  icon: <LuCalendarClock className="h-4 w-4" />,
                  onClick: () => openGroupAction("reschedule", jadwal),
                },
                {
                  label: "Hapus jadwal",
                  color: "bg-red-500 hover:bg-red-600",
                  icon: <BsTrash3 className="h-4 w-4" />,
                  onClick: () => handleDeleteGroup(jadwal),
                },
              ].map((action) => (
                <div key={action.label} className="group relative">
                  <button
                    type="button"
                    onClick={action.onClick}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors ${action.color}`}
                    aria-label={action.label}
                  >
                    {action.icon}
                  </button>

                  <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                    {jumlahTarget > 1
                      ? `${action.label} (${jumlahTarget} ${isOffline ? "kelompok" : "kelas"})`
                      : action.label}
                  </span>
                </div>
              ))}
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

      <main className="px-4 py-3 md:px-5 md:py-4">
        <div className="rounded-xl bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b px-4 py-3 md:px-5">
            {/* TITLE, FILTER & ACTION (SATU BARIS) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
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

              {/* FILTER + ACTION */}
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {/* SEARCH */}
                <div className="relative w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Cari kelas/kelompok/mentor/topik..."
                    className="h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  />
                </div>

                {/* MEETING TYPE */}
                <div className="relative w-32">
                  <select
                    value={filterType}
                    onChange={handleFilterTypeChange}
                    aria-label="Filter tipe pertemuan"
                    className="h-8 w-full appearance-none rounded-md border border-gray-300 bg-white px-2.5 pr-7 text-xs text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
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

                {/* CLASS OR GROUP */}
                {filterType === "ONLINE" && (
                  <div className="relative w-40">
                    <select
                      value={filterDestinationId}
                      onChange={handleFilterDestinationChange}
                      aria-label="Filter berdasarkan kelas"
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
                )}

                {filterType === "OFFLINE" && (
                  <div className="relative w-44">
                    <select
                      value={filterDestinationId}
                      onChange={handleFilterDestinationChange}
                      aria-label="Filter berdasarkan kelompok"
                      className="h-8 w-full appearance-none rounded-md border border-gray-300 bg-white px-2.5 pr-7 text-xs text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    >
                      <option value="">Semua Kelompok</option>
                      {kelompokOptions.map((kelompok) => (
                        <option
                          key={kelompok.id_kelompok}
                          value={kelompok.id_kelompok}
                        >
                          {kelompok.nama_kelompok}
                          {kelompok.nama_batch
                            ? ` (${kelompok.nama_batch})`
                            : ""}
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
                )}

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

                {/* URUTAN: MULAI DARI SEKARANG */}
                <label
                  className="flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700"
                  title="Aktif: jadwal yang belum selesai tampil lebih dulu, lalu yang sudah selesai. Nonaktif: urut kronologis."
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sortUpcoming}
                    onClick={() => setSortUpcoming((prev) => !prev)}
                    className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                      sortUpcoming ? "bg-yellow-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                        sortUpcoming ? "translate-x-3.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span>Upcoming</span>
                </label>

                {/* RESET */}
                {(searchTerm.trim() ||
                  filterType ||
                  filterDestinationId ||
                  filterMonth !== getCurrentMonth() ||
                  filterStartDate ||
                  filterEndDate ||
                  !sortUpcoming ||
                  periodMode !== "month") && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    Reset
                  </button>
                )}

                {/* ACTION */}
                <div className="ml-1 flex shrink-0 items-center gap-1.5 border-l border-gray-200 pl-2.5">
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
            </div>
          </div>

          {/* TABLE */}
          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <table className="min-w-full bg-white">
              <thead className="sticky top-0 z-10 border-b bg-gray-200">
                <tr className="text-[11px] uppercase text-gray-700">
                  <th className="whitespace-nowrap px-3 py-2.5">No</th>

                  <th className="whitespace-nowrap px-3 py-2.5">
                    Kelas / Kelompok
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5">Mentor</th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Tanggal &amp; Jam
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Tipe Pertemuan
                  </th>

                  <th className="whitespace-nowrap px-3 py-2.5">Topik</th>

                  <th className="whitespace-nowrap px-3 py-2.5">Catatan</th>

                  <th className="whitespace-nowrap px-3 py-2.5 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>

          {/* PAGINATION */}
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
                      filterType,
                      filterDestinationId,
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

      {/* MODAL - DAFTAR KELAS / KELOMPOK DALAM GROUP */}
      {selectedGroup && (
        <GroupKelasModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onEdit={handleEditClick}
          onReschedule={handleRescheduleClick}
          onSwitchMentor={handleOpenSwitchMentor}
          onDelete={handleDelete}
        />
      )}

      {/* MODAL - AKSI GROUP (v2) */}
      {groupAction === "edit" && actionGroup && (
        <EditGroupJadwalModal
          setShowModal={closeGroupAction}
          fetchJadwal={handleRefreshFetch}
          group={actionGroup}
        />
      )}

      {groupAction === "reschedule" && actionGroup && (
        <RescheduleGroupJadwalModal
          setShowModal={closeGroupAction}
          fetchJadwal={handleRefreshFetch}
          group={actionGroup}
        />
      )}

      {groupAction === "switch" && actionGroup && (
        <SwitchMentorGroupModal
          setShowModal={closeGroupAction}
          fetchJadwal={handleRefreshFetch}
          group={actionGroup}
          startDate={activeDateRange.startDate}
          endDate={activeDateRange.endDate}
        />
      )}

      {/* MODAL - HISTORY IMPORT */}
      {showImportHistoryModal && (
        <ImportHistoryModal
          setShowModal={setShowImportHistoryModal}
          fetchJadwal={handleRefreshFetch}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterDestinationId}
          limit={perPage}
        />
      )}

      {/* MODAL - TAMBAH JADWAL */}
      {showTambahModal && (
        <TambahJadwalForm
          setShowModal={setShowTambahModal}
          fetchJadwal={handleRefreshFetch}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterDestinationId}
          limit={perPage}
        />
      )}

      {/* MODAL - EDIT JADWAL */}
      {showEditModal && selectedData && (
        <EditJadwalForm
          setShowModal={setShowEditModal}
          fetchJadwal={handleRefreshFetch}
          selectedId={selectedId}
          initialData={selectedData}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterDestinationId}
          limit={perPage}
        />
      )}

      {/* MODAL - RESCHEDULE */}
      {showRescheduleModal && selectedData && (
        <RescheduleJadwalModal
          setShowModal={setShowRescheduleModal}
          fetchJadwal={handleRefreshFetch}
          selectedId={selectedId}
          initialData={selectedData}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterDestinationId}
          limit={perPage}
        />
      )}

      {/* MODAL - SWITCH MENTOR */}
      {showSwitchMentorModal && selectedSwitchJadwal && (
        <SwitchMentorModal
          setShowModal={setShowSwitchMentorModal}
          fetchJadwal={handleRefreshFetch}
          selectedJadwal={selectedSwitchJadwal}
          currentPage={currentPage}
          searchTerm={searchTerm}
          filterKelas={filterDestinationId}
          limit={perPage}
        />
      )}
    </div>
  );
};

export default DaftarJadwal;
