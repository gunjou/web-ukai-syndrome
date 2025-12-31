import React, { useEffect, useState, useCallback } from "react";
import {
  AiOutlineSearch,
  AiOutlineReload,
  AiOutlineFilter,
  AiOutlineFilePdf,
  AiOutlineFileExcel,
} from "react-icons/ai";
import { BsTrophy, BsFolder2Open } from "react-icons/bs";

import Api from "../../utils/Api.jsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import FilterLaporanModal from "../mentor/modal/FilterLaporanModal.jsx";
import LeaderboardTryoutModal from "../mentor/modal/LeaderboardTryoutModal.jsx";
import RekapTryoutModal from "../mentor/modal/RekapTryoutModal.jsx";

// Debounce Utility
const debounce = (func, delay = 600) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const HasilTO = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter State
  const [listTryout, setListTryout] = useState([]);
  const [filters, setFilters] = useState({
    statusPengerjaan: "",
    nilaiMin: "",
    nilaiMax: "",
    attemptKe: "",
    tanggalMulai: "",
    tanggalAkhir: "",
    selectedTryouts: [],
  });

  const [lastAppliedParams, setLastAppliedParams] = useState({});

  // Fetch Tryout List
  const fetchTryoutList = async () => {
    try {
      const res = await Api.get("/tryout/list");
      const raw = res.data.data || [];

      const uniqueList = raw
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id_tryout === item.id_tryout)
        )
        .sort((a, b) => a.judul.localeCompare(b.judul));

      setListTryout(uniqueList);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Data
  const fetchData = async (params = {}) => {
    setIsLoading(true);
    try {
      const clean = { ...params };
      Object.keys(clean).forEach((k) => {
        if (clean[k] === "" || clean[k] == null) delete clean[k];
      });

      const res = await Api.get("/hasil-tryout/mentor", { params: clean });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTryoutList();
    fetchData();
  }, []);

  // Debounced Search
  const debouncedSearch = useCallback(
    debounce((value) => {
      const params = { ...lastAppliedParams, search: value };
      fetchData(params);
    }, 600),
    [lastAppliedParams]
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Apply Filter
  const applyFilters = async (newFilters) => {
    const params = {
      search: search || undefined,
      status_pengerjaan: newFilters.statusPengerjaan || undefined,
      nilai_min: newFilters.nilaiMin || undefined,
      nilai_max: newFilters.nilaiMax || undefined,
      attempt_ke: newFilters.attemptKe || undefined,
      tanggal_mulai: newFilters.tanggalMulai || undefined,
      tanggal_akhir: newFilters.tanggalAkhir || undefined,
      id_tryout:
        newFilters.selectedTryouts.length > 0
          ? newFilters.selectedTryouts.join(",")
          : undefined,
    };

    setLastAppliedParams(params);
    setFilters(newFilters);
    await fetchData(params);
  };

  // Reset Filter
  const resetFilter = async () => {
    setFilters({
      statusPengerjaan: "",
      nilaiMin: "",
      nilaiMax: "",
      attemptKe: "",
      tanggalMulai: "",
      tanggalAkhir: "",
      selectedTryouts: [],
    });

    setSearch("");
    setLastAppliedParams({});
    fetchData({});
  };

  // Format Date
  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    const d = new Date(datetime);
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Export Excel
  const exportExcel = () => {
    const excelData = data.map((d) => ({
      Nama: d.nama_user,
      Tryout: d.judul_tryout,
      Attempt: d.attempt_ke,
      Nilai: d.nilai,
      Benar: d.benar,
      Salah: d.salah,
      Kosong: d.kosong,
      Submit: formatDateTime(d.end_time),
      Status: d.status_pengerjaan,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histori");
    XLSX.writeFile(wb, "hasil_tryout_peserta.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Histori Hasil Tryout Peserta", 14, 15);

    const tableData = data.map((d, i) => [
      i + 1,
      d.nama_user,
      d.judul_tryout,
      d.attempt_ke,
      d.benar,
      d.salah,
      d.kosong,
      d.nilai,
      formatDateTime(d.end_time),
      d.status_pengerjaan,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "No",
          "Nama",
          "Tryout",
          "Attempt",
          "Benar",
          "Salah",
          "Kosong",
          "Nilai",
          "Submit",
          "Status",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
    });

    doc.save("hasil_tryout_peserta.pdf");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 w-full h-auto h-p-6">
      <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-[20px]">
        {/* HEADER + BUTTONS */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Hasil Try Out
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ringkasan hasil tryout peserta
            </p>
          </div>

          {/* BUTTON TOOLBAR */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (!data.length) return alert("Tidak ada data untuk direkap!");
                setSelectedUser(data[0].id_user || null);
                setIsRekapModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <BsFolder2Open size={18} /> Rekapan
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <BsTrophy size={18} /> Leaderboard
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <AiOutlineFileExcel size={18} /> Excel
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <AiOutlineFilePdf size={18} /> PDF
            </button>
          </div>
        </div>

        {/* Search + Reset + Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative w-full md:w-1/2">
            <AiOutlineSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Cari nama peserta atau tryout..."
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-red-300 outline-none"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm"
          >
            <AiOutlineFilter size={18} /> Filter
          </button>

          <button
            onClick={resetFilter}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm"
          >
            <AiOutlineReload size={18} /> Reset
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-y-auto max-h-[65vh] border dark:border-gray-700 rounded-lg">
          <table className="min-w-full border dark:border-gray-700 text-sm bg-white dark:bg-gray-800">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border dark:border-gray-700 px-3 py-2">No</th>
                <th className="border dark:border-gray-700 px-3 py-2 text-left">
                  Nama
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-left">
                  Judul Tryout
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Attempt
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Benar
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Salah
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Kosong
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Nilai
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Mulai
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Submit
                </th>
                <th className="border dark:border-gray-700 px-3 py-2 text-center">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-7 h-7 border-4 border-gray-400 dark:border-gray-500 border-dashed rounded-full animate-spin"></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Memuat data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-gray-900 dark:text-white">
                      {i + 1}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white">
                      {item.nama_user}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 capitalize text-gray-900 dark:text-white">
                      {item.judul_tryout}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-gray-900 dark:text-white">
                      {item.attempt_ke}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-green-700 dark:text-green-400 font-semibold">
                      {item.benar}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">
                      {item.salah}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-gray-900 dark:text-white">
                      {item.kosong}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-blue-500 dark:text-blue-400 font-semibold">
                      {item.nilai}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-gray-900 dark:text-white">
                      {formatDateTime(item.start_time)}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center text-gray-900 dark:text-white">
                      {formatDateTime(item.end_time)}
                    </td>
                    <td className="border dark:border-gray-700 px-3 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status_pengerjaan === "submitted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : item.status_pengerjaan === "ongoing"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.status_pengerjaan}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="pt-3 text-xs text-gray-600 dark:text-gray-400">
          <sup>*</sup> Total: {data.length} hasil
        </p>

        {/* ==== MODAL ==== */}
        <FilterLaporanModal
          open={isFilterOpen}
          setOpen={setIsFilterOpen}
          listTryout={listTryout}
          filters={filters}
          setFilters={setFilters}
          onApply={applyFilters}
          onReset={resetFilter}
        />

        <LeaderboardTryoutModal
          open={isLeaderboardOpen}
          setOpen={setIsLeaderboardOpen}
          idTryout={filters.selectedTryouts[0]}
        />

        <RekapTryoutModal
          open={isRekapModalOpen}
          setOpen={setIsRekapModalOpen}
          idUser={selectedUser}
        />
      </div>
    </div>
  );
};

export default HasilTO;
