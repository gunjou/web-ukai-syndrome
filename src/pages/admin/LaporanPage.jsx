import React, { useState, useEffect, useCallback } from "react";
import {
  AiOutlineBarChart,
  AiOutlineFilePdf,
  AiOutlineFileExcel,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineReload,
} from "react-icons/ai";
import { BsTrophy, BsFolder2Open } from "react-icons/bs";
import Header from "../../components/admin/Header.jsx";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import StatistikTryoutModal from "./modal/laporan/StatistikTryoutModal.jsx";
import LeaderboardTryoutModal from "./modal/laporan/LeaderboardTryoutModal.jsx";
import RekapTryoutModal from "./modal/laporan/RekapTryoutModal.jsx";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import FilterLaporanModal from "./modal/laporan/FilterLaporanModal.jsx";
// UTILITY: debounce
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const getTodayDate = () => {
  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const formatted = `${yyyy}-${mm}-${dd}`;

  return {
    tanggal_mulai: formatted,
  };
};

export default function LaporanPage() {
  const [data, setData] = useState([]);
  const [listTryout, setListTryout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [statistik, setStatistik] = useState(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // filter states
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

  // FETCH TRYOUTS
  const fetchTryoutList = async () => {
    try {
      const res = await Api.get("/tryout/all-tryout");
      setListTryout(res.data.data || []);
    } catch (e) {
      console.error("Gagal mengambil daftar tryout:", e);
    }
  };

  // FETCH LAPORAN
  const fetchData = async (params = {}) => {
    setIsLoading(true);
    try {
      const clean = { ...params };
      Object.keys(clean).forEach(
        (k) => (clean[k] === "" || clean[k] == null) && delete clean[k]
      );

      const res = await Api.get("/hasil-tryout", { params: clean });
      setData(res.data.data || []);
    } catch (e) {
      console.error("Error load laporan:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTryoutList();

    const today = getTodayDate();

    setFilters((prev) => ({
      ...prev,
      tanggalMulai: today.tanggal_mulai,
      tanggalAkhir: today.tanggal_akhir,
    }));

    setLastAppliedParams(today);
    fetchData(today);
  }, []);

  // AUTO SEARCH (debounced)
  // --------------------------------------------------------
  const debouncedSearch = useCallback(
    debounce((text) => {
      const params = {
        ...lastAppliedParams,
        search: text,
      };
      fetchData(params);
    }, 500),
    [lastAppliedParams]
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // filteredData = data yang sudah difilter berdasarkan search nama_user dan judul_tryout
  const filteredData = data.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.nama_user.toLowerCase().includes(searchLower) ||
      item.judul_tryout.toLowerCase().includes(searchLower)
    );
  });
  // APPLY FILTERS (from modal)
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

    setFilters(newFilters);
    setLastAppliedParams(params);

    await fetchData(params);
  };

  // RESET FILTER
  const resetFilter = async () => {
    const today = getTodayDate();

    setFilters({
      statusPengerjaan: "",
      nilaiMin: "",
      nilaiMax: "",
      attemptKe: "",
      tanggalMulai: today.tanggal_mulai,
      selectedTryouts: [],
    });

    setSearch("");
    setLastAppliedParams(today);
    await fetchData(today);
  };

  // FORMATTING HELPERS
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const ringkasJawaban = (obj) => {
    if (!obj) return "-";
    const total = Object.keys(obj).length;
    const answered = Object.values(obj).filter(
      (x) => x.jawaban !== null
    ).length;
    const ragu = Object.values(obj).filter((x) => x.ragu === 1).length;
    return `${total} soal • ${answered} dijawab • ${ragu} ragu`;
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    const excelData = data.map((d) => ({
      User: d.nama_user,
      Tryout: d.judul_tryout,
      Attempt: d.attempt_ke,
      Nilai: d.nilai,
      Benar: d.benar,
      Salah: d.salah,
      Kosong: d.kosong,
      Jawaban: ringkasJawaban(d.jawaban_user),
      Submit: formatTanggal(d.tanggal_pengerjaan),
      Status: d.status_pengerjaan,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "laporan_tryout.xlsx");
  };

  // EXPORT PDF
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Laporan Hasil Tryout", 14, 15);

    const tableData = data.map((d, i) => [
      i + 1,
      d.nama_user,
      d.judul_tryout,
      d.attempt_ke,
      d.benar,
      d.salah,
      d.kosong,
      d.nilai,
      formatTanggal(d.tanggal_pengerjaan),
      d.status_pengerjaan,
    ]);

    // use imported autoTable function instead of doc.autoTable to ensure compatibility
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "No",
          "User",
          "Tryout",
          "Attempt Ke",
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

    doc.save("laporan_tryout.pdf");
  };

  const deleteHasil = async (id) => {
    if (!window.confirm("Yakin ingin menghapus hasil tryout ini?")) return;

    try {
      await Api.delete(`/hasil-tryout/${id}`);

      // Refresh data setelah hapus
      fetchData(lastAppliedParams);

      alert("Data berhasil dihapus!");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data!");
    }
  };

  // UI
  return (
    <div className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      {/* Background */}
      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto opacity-40 z-0"
        alt=""
      />
      <img
        src={garisKanan}
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 z-0"
        alt=""
      />

      <Header />

      {/* CARD */}
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        {/* TITLE */}
        <div className="py-4 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h1 className="text-xl font-bold">Laporan Hasil Tryout</h1>

          <div className="flex gap-2">
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setIsStatModalOpen(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
              >
                <AiOutlineBarChart size={18} /> Statistik
              </button>

              <button
                onClick={() => {
                  if (!data.length)
                    return alert("Tidak ada data untuk direkap!");
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
        </div>

        {/* SEARCH & FILTER */}
        <div className="px-8 pb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          {/* Search Box */}
          <div className="flex gap-2 w-full md:w-2/3">
            <div className="relative w-full">
              <AiOutlineSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari user / judul tryout..."
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none pl-10 pr-3 py-2 rounded-lg text-sm w-full transition"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Data ditampilkan default untuk <b>hari ini</b>. Gunakan filter untuk
            melihat tanggal lain.
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <AiOutlineFilter size={18} /> Filter
            </button>

            <button
              onClick={resetFilter}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <AiOutlineReload size={18} /> Reset
            </button>
          </div>
        </div>

        {/* TABLE */}
        {isLoading ? (
          <div className="flex flex-col items-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[59vh] px-4">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-sm">No</th>
                  <th className="px-4 py-2 text-sm">Judul Tryout</th>
                  <th className="px-4 py-2 text-sm">Nama Peserta</th>
                  <th className="px-4 py-2 text-sm">Attempt Ke</th>
                  <th className="px-4 py-2 text-sm">Benar</th>
                  <th className="px-4 py-2 text-sm">Salah</th>
                  <th className="px-4 py-2 text-sm">Kosong</th>
                  <th className="px-4 py-2 text-sm">Nilai</th>
                  {/* <th className="px-4 py-2 text-sm">Jawaban</th> */}
                  <th className="px-4 py-2 text-sm">Mulai</th>
                  <th className="px-4 py-2 text-sm">Selesai</th>
                  {/* <th className="px-4 py-2 text-sm">Submit</th> */}
                  <th className="px-4 py-2 text-sm">Status</th>
                  <th className="px-4 py-2 text-sm text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((d, i) => (
                  <tr key={i} className="bg-gray-100 hover:bg-gray-200">
                    <td className="px-2 py-2 text-xs text-center border">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2 text-sm border capitalize">
                      {d.judul_tryout}
                    </td>
                    <td className="px-4 py-2 text-sm border capitalize">
                      {d.nama_user}
                    </td>
                    <td className="px-4 py-2 text-sm border text-center">
                      {d.attempt_ke}
                    </td>
                    <td className="px-4 py-2 text-sm border text-center text-green-700">
                      {d.benar}
                    </td>
                    <td className="px-4 py-2 text-sm border text-center text-red-700">
                      {d.salah}
                    </td>
                    <td className="px-4 py-2 text-sm border text-center">
                      {d.kosong}
                    </td>
                    <td className="px-4 py-2 text-sm border text-center">
                      {d.nilai}
                    </td>
                    {/* <td className="px-4 py-2 text-sm border text-center">
                      {ringkasJawaban(d.jawaban_user)}
                    </td> */}
                    <td className="px-4 py-2 text-sm border text-center">
                      {formatTanggal(d.start_time)}
                    </td>
                    <td className="px-4 py-2 text-sm border text-center">
                      {formatTanggal(d.end_time)}
                    </td>
                    {/* <td className="px-4 py-2 text-sm border text-center">
                      {formatTanggal(d.tanggal_pengerjaan)}
                    </td> */}
                    <td className="px-4 py-2 text-sm border text-center">
                      <span
                        className={`
      px-3 py-1 rounded-full text-xs font-semibold capitalize
      ${
        d.status_pengerjaan === "submitted"
          ? "bg-green-100 text-green-700"
          : d.status_pengerjaan === "ongoing"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-700"
      }
    `}
                      >
                        {d.status_pengerjaan}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm border text-center">
                      <button
                        onClick={() => deleteHasil(d.id_hasiltryout)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={13} className="text-center py-6 text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="pl-4 pt-2 text-xs font-semibold text-blue-600">
          <sup>*</sup>Jumlah data: {data.length}
        </p>
      </div>

      {/* MODAL */}
      <FilterLaporanModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        listTryout={listTryout}
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onReset={resetFilter}
      />

      <StatistikTryoutModal
        open={isStatModalOpen}
        setOpen={setIsStatModalOpen}
        statistik={statistik}
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
  );
}
