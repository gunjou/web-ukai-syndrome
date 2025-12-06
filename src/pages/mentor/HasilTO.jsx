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
import "jspdf-autotable";

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
      setListTryout(res.data.data || []);
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
      d.nilai,
      d.benar,
      d.salah,
      d.kosong,
      formatDateTime(d.end_time),
      d.status_pengerjaan,
    ]);

    doc.autoTable({
      startY: 20,
      head: [
        [
          "No",
          "Nama",
          "Tryout",
          "Attempt",
          "Nilai",
          "Benar",
          "Salah",
          "Kosong",
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
    <div className="min-h-screen bg-white flex justify-center">
      <div className="bg-gray-100 w-full max-w-6xl h-auto p-4 rounded-[20px] shadow-md relative">
        {/* HEADER + BUTTONS */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Hasil Try Out
            </h1>
            <p className="text-sm text-gray-500 mt-1">
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
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <BsFolder2Open size={18} /> Rekapan
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <BsTrophy size={18} /> Leaderboard
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <AiOutlineFileExcel size={18} /> Excel
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Cari nama peserta atau tryout..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-red-300 outline-none"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
          >
            <AiOutlineFilter size={18} /> Filter
          </button>

          <button
            onClick={resetFilter}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm"
          >
            <AiOutlineReload size={18} /> Reset
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-y-auto max-h-[65vh] border rounded-lg">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="border px-3 py-2">No</th>
                <th className="border px-3 py-2 text-left">Nama Peserta</th>
                <th className="border px-3 py-2 text-left">Judul Tryout</th>
                <th className="border px-3 py-2 text-center">Attempt</th>
                <th className="border px-3 py-2 text-center">Benar</th>
                <th className="border px-3 py-2 text-center">Salah</th>
                <th className="border px-3 py-2 text-center">Kosong</th>
                <th className="border px-3 py-2 text-center">Nilai</th>
                <th className="border px-3 py-2 text-center">Mulai</th>
                <th className="border px-3 py-2 text-center">Submit</th>
                <th className="border px-3 py-2 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-7 h-7 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
                      <p className="text-gray-500 text-sm">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-gray-500">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-100 transition cursor-pointer"
                  >
                    <td className="border px-3 py-2 text-center">{i + 1}</td>
                    <td className="border px-3 py-2">{item.nama_user}</td>
                    <td className="border px-3 py-2 capitalize">
                      {item.judul_tryout}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {item.attempt_ke}
                    </td>

                    <td className="border px-3 py-2 text-center text-green-700 font-semibold">
                      {item.benar}
                    </td>
                    <td className="border px-3 py-2 text-center text-red-600 font-semibold">
                      {item.salah}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {item.kosong}
                    </td>
                    <td className="border px-3 py-2 text-center font-semibold">
                      {item.nilai}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {formatDateTime(item.start_time)}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {formatDateTime(item.end_time)}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status_pengerjaan === "submitted"
                            ? "bg-green-100 text-green-700"
                            : item.status_pengerjaan === "ongoing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-600"
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

        <p className="pt-3 text-xs text-gray-600">
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
