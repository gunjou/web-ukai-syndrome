import React, { useEffect, useState, useMemo } from "react";
import Api from "../../utils/Api.jsx";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AiOutlineFilePdf, AiOutlineSearch } from "react-icons/ai";
import TryoutResultDetail from "./TryoutResultDetail.jsx";
import { useLocation } from "react-router-dom";

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
  const [selectedHasil, setSelectedHasil] = useState(null);
  const [query, setQuery] = useState("");

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

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "submitted") return "bg-green-100 text-green-800";
    if (s === "ongoing") return "bg-yellow-100 text-yellow-800";
    if (s === "time_up") return "bg-red-100 text-red-800";
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
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(`hasil-tryout-${dayjs().format("DDMMYYYY")}.pdf`);
  };

  if (selectedHasil) {
    return (
      <TryoutResultDetail
        idHasilTryout={selectedHasil.id_hasiltryout}
        onBack={() => setSelectedHasil(null)}
      />
    );
  }

  return (
    <main className="min-h-screen flex justify-center bg-gray-50">
      <div className="bg-gray-100 w-full max-w-7xl rounded-2xl shadow-md p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Hasil Tryout
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Ringkasan hasil tryout peserta
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 shadow-inner w-full sm:w-64">
              <AiOutlineSearch className="w-5 h-5 text-gray-400 mr-2" />
              <input
                aria-label="Search results"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul, nilai, atau status..."
                className="bg-transparent focus:outline-none text-sm text-gray-700 w-full"
              />
            </div>

            <select
              id="filterTryout"
              value={filterTryout}
              onChange={(e) => setFilterTryout(e.target.value)}
              className="block w-full sm:w-44 rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {uniqueTryouts.map((title) => (
                <option key={title} value={title}>
                  {title === "all" ? "Semua Tryout" : title}
                </option>
              ))}
            </select>

            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-shadow shadow-sm"
            >
              <AiOutlineFilePdf size={20} /> Export PDF
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="py-20 text-center text-red-600 font-semibold text-lg">
            {error}
          </div>
        ) : displayedHasil.length === 0 ? (
          <div className="py-20 text-center text-gray-500 italic text-lg">
            Tidak ada hasil try out untuk filter ini.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="max-h-[480px] overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                    <tr>
                      <th
                        style={{ width: "15%" }}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide break-words"
                      >
                        Tryout
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        Attempt
                      </th>
                      <th
                        style={{ width: "18%" }}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        Tanggal
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="px-6 py-3 text-center text-xs font-semibold text-green-600 uppercase tracking-wide"
                      >
                        Benar
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="px-6 py-3 text-center text-xs font-semibold text-red-600 uppercase tracking-wide"
                      >
                        Salah
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide"
                      >
                        Kosong
                      </th>
                      <th
                        style={{ width: "7%" }}
                        className="px-6 py-3 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wide"
                      >
                        Nilai
                      </th>
                      <th
                        style={{ width: "12%" }}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        Status
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayedHasil.map((item, idx) => (
                      <tr
                        key={item.id_hasiltryout}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 align-top text-sm font-medium text-gray-900 break-words max-w-[28rem] whitespace-normal">
                          {item.judul_tryout}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700 text-center whitespace-nowrap">
                          {item.attempt_ke}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700 whitespace-nowrap">
                          {dayjs(item.tanggal_pengerjaan).format(
                            "DD MMM YYYY HH:mm"
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-green-600 text-center whitespace-nowrap font-semibold">
                          {item.benar}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-red-600 text-center whitespace-nowrap font-semibold">
                          {item.salah}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700 text-center whitespace-nowrap">
                          {item.kosong}
                        </td>
                        <td className="px-6 py-4 align-top text-sm font-semibold text-indigo-600 text-center whitespace-nowrap">
                          {item.nilai}
                        </td>
                        <td className="px-6 py-4 align-top text-sm whitespace-normal">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              item.status_pengerjaan
                            )}`}
                          >
                            {item.status_pengerjaan}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedHasil(item)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {displayedHasil.map((item) => (
                <div
                  key={item.id_hasiltryout}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {item.judul_tryout}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {dayjs(item.tanggal_pengerjaan).format(
                          "DD MMM YYYY HH:mm"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600">
                        {item.nilai}
                      </div>
                      <div className="text-xs text-gray-500">
                        Attempt {item.attempt_ke}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-5">
                      <div>
                        B:{" "}
                        <span className="font-semibold text-gray-800">
                          {item.benar}
                        </span>
                      </div>
                      <div>
                        S:{" "}
                        <span className="font-semibold text-gray-800">
                          {item.salah}
                        </span>
                      </div>
                      <div>
                        K:{" "}
                        <span className="font-semibold text-gray-800">
                          {item.kosong}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          item.status_pengerjaan
                        )}`}
                      >
                        {item.status_pengerjaan}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedHasil(item)}
                      className="w-full sm:w-auto mt-3 sm:mt-0 text-center text-sm font-semibold text-indigo-600 border border-indigo-300 rounded-md py-2 hover:bg-indigo-50 transition"
                    >
                      Lihat Pembahasan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default HasilTO;
