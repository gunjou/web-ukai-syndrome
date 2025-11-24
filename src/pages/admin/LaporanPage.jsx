import React, { useState, useEffect, useCallback } from "react";
import Header from "../../components/admin/Header.jsx";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { AiOutlineFilter } from "react-icons/ai";
import FilterLaporanModal from "./modal/laporan/FilterLaporanModal.jsx";
// UTILITY: debounce
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function LaporanPage() {
  const [data, setData] = useState([]);
  const [listTryout, setListTryout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    fetchData({});
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
    debouncedSearch(e.target.value);
  };

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
    await fetchData({});
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
      d.nilai,
      d.benar,
      d.salah,
      d.kosong,
      ringkasJawaban(d.jawaban_user),
      formatTanggal(d.tanggal_pengerjaan),
      d.status_pengerjaan,
    ]);

    doc.autoTable({
      startY: 20,
      head: [
        [
          "No",
          "User",
          "Tryout",
          "Attempt",
          "Nilai",
          "Benar",
          "Salah",
          "Kosong",
          "Jawaban",
          "Submit",
          "Status",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
    });

    doc.save("laporan_tryout.pdf");
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
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              PDF
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="px-8 pb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2 w-full md:w-2/3">
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari user / judul..."
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 text-sm"
            >
              <AiOutlineFilter /> Filter
            </button>

            <button
              onClick={resetFilter}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Reset
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
          <div className="overflow-x-auto max-h-[70vh] px-4">
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
                  {/* <th className="px-4 py-2 text-sm">Selesai</th> */}
                  {/* <th className="px-4 py-2 text-sm">Submit</th> */}
                  <th className="px-4 py-2 text-sm">Status</th>
                </tr>
              </thead>

              <tbody>
                {data.map((d, i) => (
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
                    {/* <td className="px-4 py-2 text-sm border text-center">
                      {formatTanggal(d.end_time)}
                    </td> */}
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
                  </tr>
                ))}

                {data.length === 0 && (
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
    </div>
  );
}
