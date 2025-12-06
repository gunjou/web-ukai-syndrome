// src/pages/users/HasilTO.js
import React, { useEffect, useState, useMemo } from "react";
import Api from "../../utils/Api.jsx";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AiOutlineBarChart,
  AiOutlineFilePdf,
  AiOutlineFileExcel,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineReload,
} from "react-icons/ai";

const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <svg
      className="animate-spin h-10 w-10 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  </div>
);

const HasilTO = () => {
  const [hasil, setHasil] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTryout, setFilterTryout] = useState("all");

  useEffect(() => {
    const fetchHasil = async () => {
      try {
        setLoading(true);
        const res = await Api.get("/hasil-tryout/peserta");
        setHasil(res.data.data);
      } catch (err) {
        setError("Gagal memuat data hasil tryout.");
      } finally {
        setLoading(false);
      }
    };

    fetchHasil();
  }, []);

  const uniqueTryouts = useMemo(() => {
    const titles = hasil.map((item) => item.judul_tryout);
    return ["all", ...Array.from(new Set(titles))];
  }, [hasil]);

  const filteredHasil =
    filterTryout === "all"
      ? hasil
      : hasil.filter((item) => item.judul_tryout === filterTryout);

  // UI: search & helpers
  const [query, setQuery] = useState("");

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "submitted") return "bg-green-100 text-green-800";
    if (s === "ongoing") return "bg-yellow-100 text-yellow-800";
    if (s === "time_up") return "bg-red-100 text-red-800";
    // fallback untuk status lain
    return "bg-gray-100 text-gray-800";
  };

  const displayedHasil = filteredHasil.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (item.judul_tryout || "").toLowerCase().includes(q) ||
      String(item.nilai || "")
        .toLowerCase()
        .includes(q) ||
      (item.status_pengerjaan || "").toLowerCase().includes(q)
    );
  });

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Laporan Hasil Tryout", 14, 15);

    const tableColumn = [
      "Tryout",
      "Attempt",
      "Tanggal",
      "Benar",
      "Salah",
      "Kosong",
      "Nilai",
      "Status",
    ];

    const tableRows = displayedHasil.map((item) => [
      item.judul_tryout,
      item.attempt_ke,
      dayjs(item.tanggal_pengerjaan).format("DD MMM YYYY HH:mm"),
      item.benar,
      item.salah,
      item.kosong,
      item.nilai,
      item.status_pengerjaan,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }, // warna ungu indigo
    });

    doc.save(`hasil-tryout-${dayjs().format("DDMMYYYY")}.pdf`);
  };

  return (
    <main className="min-h-screen bg-white flex justify-center">
      <div className="bg-gray-100 w-full max-w-6xl h-auto p-4 rounded-[20px] shadow-md relative">
        {/* Header: Judul + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Hasil Try Out
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Ringkasan hasil tryout peserta
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 shadow-inner">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
              <input
                aria-label="Search results"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul, nilai, atau status..."
                className="bg-transparent focus:outline-none text-sm text-gray-700 w-40"
              />
            </div>

            <div>
              <label htmlFor="filterTryout" className="sr-only">
                Filter Tryout
              </label>
              <select
                id="filterTryout"
                value={filterTryout}
                onChange={(e) => setFilterTryout(e.target.value)}
                className="block w-36 rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {uniqueTryouts.map((title) => (
                  <option key={title} value={title}>
                    {title === "all" ? "Semua Tryout" : title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <AiOutlineFilePdf size={18} /> PDF
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="py-16 text-center text-red-600 font-semibold text-lg">
            {error}
          </div>
        ) : displayedHasil.length === 0 ? (
          <div className="py-16 text-center text-gray-500 italic text-lg">
            Tidak ada hasil try out untuk filter ini.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              {/* Make the table body vertically scrollable, prevent horizontal scroll, use table-fixed so columns respect widths */}
              <div className="max-h-[450px] overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        style={{ width: "15%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 break-words"
                      >
                        Tryout
                      </th>
                      <th
                        style={{ width: "8%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Attempt
                      </th>
                      <th
                        style={{ width: "18%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Tanggal
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Benar
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Salah
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Kosong
                      </th>
                      <th
                        style={{ width: "8%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Nilai
                      </th>
                      <th
                        style={{ width: "12%" }}
                        className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayedHasil.map((item, idx) => (
                      <tr
                        key={item.id_hasiltryout}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 align-top text-sm font-medium text-gray-900 break-words whitespace-normal max-w-[28rem]">
                          {item.judul_tryout}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700 text-center truncate">
                          {item.attempt_ke}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700 truncate">
                          {dayjs(item.tanggal_pengerjaan).format(
                            "DD MMM YYYY HH:mm"
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-green-600 text-center truncate">
                          {item.benar}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-red-500 text-center truncate">
                          {item.salah}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700 text-center truncate">
                          {item.kosong}
                        </td>
                        <td className="px-6 py-4 align-top text-sm font-semibold text-indigo-600 text-center truncate">
                          {item.nilai}
                        </td>
                        <td className="px-6 py-4 align-top text-sm truncate">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              item.status_pengerjaan
                            )}`}
                          >
                            {item.status_pengerjaan}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {displayedHasil.map((item) => (
                <div
                  key={item.id_hasiltryout}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.judul_tryout}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {dayjs(item.tanggal_pengerjaan).format(
                          "DD MMM YYYY HH:mm"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {item.nilai}
                      </div>
                      <div className="text-xs text-gray-500">
                        Attempt {item.attempt_ke}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        B:{" "}
                        <span className="font-medium text-gray-800">
                          {item.benar}
                        </span>
                      </div>
                      <div className="text-sm">
                        S:{" "}
                        <span className="font-medium text-gray-800">
                          {item.salah}
                        </span>
                      </div>
                      <div className="text-sm">
                        K:{" "}
                        <span className="font-medium text-gray-800">
                          {item.kosong}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          item.status_pengerjaan
                        )}`}
                      >
                        {item.status_pengerjaan}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default HasilTO;
