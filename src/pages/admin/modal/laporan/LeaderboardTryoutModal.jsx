import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Api from "../../../../utils/Api";
import ApiExternal from "../../../../utils/ApiExternal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiUsers, FiRepeat, FiTrendingUp, FiAward } from "react-icons/fi";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

// ==== KONFIGURASI PEMBEDA VISUAL UNTUK RANK 1, 2, 3 ====
const RANK_BADGE = {
  1: {
    emoji: "🥇",
    label: "Juara 1",
    rowClass: "bg-gradient-to-r from-yellow-50 to-amber-50",
    rankTextClass: "text-amber-600",
    pillClass: "bg-amber-100 text-amber-700 border border-amber-300",
  },
  2: {
    emoji: "🥈",
    label: "Juara 2",
    rowClass: "bg-gradient-to-r from-slate-50 to-gray-100",
    rankTextClass: "text-slate-500",
    pillClass: "bg-slate-200 text-slate-700 border border-slate-300",
  },
  3: {
    emoji: "🥉",
    label: "Juara 3",
    rowClass: "bg-gradient-to-r from-orange-50 to-orange-100",
    rankTextClass: "text-orange-600",
    pillClass: "bg-orange-100 text-orange-700 border border-orange-300",
  },
};

function formatDuration(seconds) {
  const totalSeconds = Number(seconds);

  if (!totalSeconds || totalSeconds <= 0) {
    return "0 detik";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
  }

  if (minutes > 0) {
    return remainingSeconds > 0
      ? `${minutes} menit ${remainingSeconds} detik`
      : `${minutes} menit`;
  }

  return `${remainingSeconds} detik`;
}

export default function LeaderboardTryoutModal({ open, setOpen }) {
  const [listTryout, setListTryout] = useState([]);
  const [selected, setSelected] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState("");
  const [firstAttemptOnly, setFirstAttemptOnly] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (open) fetchTryoutList();
  }, [open]);

  const fetchTryoutList = async () => {
    try {
      const res = await Api.get("/tryout/all-tryout");
      setListTryout(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch list tryout", err);
    }
  };

  const [rawLeaderboard, setRawLeaderboard] = useState([]);

  const fetchLeaderboard = async (id) => {
    try {
      setLoading(true);

      // Limit tidak lagi dihandle backend, ambil semua data lalu filter di frontend
      const res = await ApiExternal.get(`/tryout/${id}/leaderboard`);

      // Response shape: { status, message, data: { summary, leaderboard }, meta }
      const payload = res.data?.data || {};
      setRawLeaderboard(payload.leaderboard || []);
      setSummary(payload.summary || null);
    } catch (err) {
      console.error("Gagal memuat leaderboard:", err);
      setRawLeaderboard([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) {
      // Reset filter saat ganti tryout supaya tidak membingungkan
      setLimit("");
      setFirstAttemptOnly(false);
      setSelectedClass("");
      setSearchName("");
      setCurrentPage(1);
      fetchLeaderboard(selected);
    }
  }, [selected]);

  // Daftar kelas unik yang tersedia pada tryout yang dipilih
  const classOptions = useMemo(() => {
    const classes = rawLeaderboard
      .map((d) => d.class)
      .filter((c) => c !== undefined && c !== null && c !== "");
    return [...new Set(classes)].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [rawLeaderboard]);

  // Filter limit rank + percobaan pertama + kelas dilakukan di frontend
  useEffect(() => {
    let result = rawLeaderboard;

    // Filter percobaan pertama saja (attempt === 1)
    if (firstAttemptOnly) {
      result = result.filter((d) => d.attempt === 1);
    }

    // Filter berdasarkan kelas
    if (selectedClass) {
      result = result.filter((d) => d.class === selectedClass);
    }

    // Susun ulang rank mulai dari 1 setiap kali salah satu filter
    // (percobaan pertama / kelas) aktif, karena urutan relatifnya
    // (berdasarkan skor dari rawLeaderboard) tetap valid setelah difilter.
    if (firstAttemptOnly || selectedClass) {
      result = result.map((d, idx) => ({ ...d, rank: idx + 1 }));
    }

    // Filter limit rank (memakai rank yang sudah disusun ulang di atas)
    const n = parseInt(limit, 10);
    if (limit && !isNaN(n) && n > 0) {
      result = result.filter((d) => d.rank <= n);
    }

    setLeaderboard(result);
  }, [limit, firstAttemptOnly, selectedClass, rawLeaderboard]);

  // Reset ke halaman 1 setiap kali filter/search berubah supaya tidak
  // terjebak di halaman kosong
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, firstAttemptOnly, selectedClass, searchName, pageSize]);

  // Hasil akhir setelah search nama (tidak mengubah rank, hanya menyaring tampilan)
  const searchedLeaderboard = useMemo(() => {
    if (!searchName.trim()) return leaderboard;
    const q = searchName.trim().toLowerCase();
    return leaderboard.filter((d) =>
      String(d.name || "")
        .toLowerCase()
        .includes(q)
    );
  }, [leaderboard, searchName]);

  // Ringkasan dihitung ulang mengikuti filter kelas & percobaan pertama,
  // supaya tidak lagi menampilkan angka dari SEMUA kelas ketika sedang difilter.
  // Limit rank & search sengaja tidak dilibatkan di sini karena keduanya bersifat
  // "tampilan" (top-N / cari nama), bukan definisi ulang populasi datanya.
  const displaySummary = useMemo(() => {
    const isFiltered = Boolean(selectedClass) || firstAttemptOnly;

    if (!isFiltered) return summary;

    let base = rawLeaderboard;
    if (firstAttemptOnly) base = base.filter((d) => d.attempt === 1);
    if (selectedClass) base = base.filter((d) => d.class === selectedClass);

    if (base.length === 0) {
      return {
        total_participants: 0,
        total_attempt: 0,
        average_score: 0,
        highest_score: 0,
      };
    }

    const scores = base.map((d) => Number(d.score) || 0);
    const uniqueParticipants = new Set(base.map((d) => d.user_id ?? d.name))
      .size;

    return {
      total_participants: uniqueParticipants,
      total_attempt: base.length,
      average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
      highest_score: Math.max(...scores),
    };
  }, [rawLeaderboard, selectedClass, firstAttemptOnly, summary]);

  // Pagination dihitung dari data yang sudah lolos search
  const totalPages = Math.max(
    1,
    Math.ceil(searchedLeaderboard.length / pageSize)
  );

  const paginatedLeaderboard = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedLeaderboard.slice(start, start + pageSize);
  }, [searchedLeaderboard, currentPage, pageSize]);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
  };

  const downloadPDF = () => {
    // PDF mengambil seluruh data hasil filter (termasuk search), bukan hanya
    // yang tampil di halaman aktif.
    if (searchedLeaderboard.length === 0) return;

    const doc = new jsPDF();
    const tryoutName = listTryout.find((t) => t.id_tryout == selected)?.judul;

    doc.setFontSize(16);
    doc.text("Leaderboard Tryout", 14, 15);

    doc.setFontSize(11);
    doc.text(`Tryout: ${tryoutName || "-"}`, 14, 22);

    if (displaySummary) {
      doc.setFontSize(10);
      doc.text(
        `Peserta: ${displaySummary.total_participants} | Percobaan: ${
          displaySummary.total_attempt
        } | Rata-rata: ${Number(displaySummary.average_score).toFixed(
          2
        )} | Tertinggi: ${displaySummary.highest_score}`,
        14,
        28
      );
    }

    const tableColumn = [
      "Rank",
      "Nama",
      "Kelas",
      "Skor",
      "Percobaan",
      "Durasi",
    ];
    const tableRows = searchedLeaderboard.map((d) => [
      `#${d.rank}`,
      d.name,
      d.class,
      Number(d.score).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      }),
      d.attempt,
      formatDuration(d.duration),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: displaySummary ? 33 : 28,
      theme: "grid",
    });

    // Susun nama file sesuai filter yang aktif
    const parts = [tryoutName || "Tryout"];

    if (selectedClass) {
      parts.push(`Kelas${selectedClass}`);
    }

    const n = parseInt(limit, 10);
    if (limit && !isNaN(n) && n > 0) {
      parts.push(`Top${n}`);
    }

    if (firstAttemptOnly) {
      parts.push("PercobaanPertama");
    }

    if (searchName.trim()) {
      parts.push(`Cari-${searchName.trim()}`);
    }

    const fileName = parts
      .join("_")
      .replace(/\s+/g, "_") // spasi jadi underscore
      .replace(/[^a-zA-Z0-9_-]/g, ""); // buang karakter tidak aman untuk nama file

    doc.save(`Leaderboard_${fileName}.pdf`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-[92%] max-w-6xl max-h-[92vh] p-7 relative overflow-hidden flex flex-col border border-gray-200"
          >
            <div className="shrink-0 relative flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Leaderboard Tryout</h2>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              >
                ✕
              </button>
            </div>

            {/* Baris filter: Pilih Tryout, Kelas, Batasi Rank, Checkbox, Cari, Download PDF — dibuat 1 baris */}
            <div className="shrink-0 mt-4 flex flex-nowrap items-end gap-2 overflow-x-auto pb-1">
              <div className="min-w-[160px] flex-1">
                <label className="text-xs font-semibold text-gray-700">
                  Pilih Tryout
                </label>
                <select
                  className="w-full border rounded-lg px-2 py-1.5 mt-1 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">— Pilih Tryout —</option>
                  {listTryout.map((t) => (
                    <option key={t.id_tryout} value={t.id_tryout}>
                      {t.judul}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-28 shrink-0">
                <label className="text-xs font-semibold text-gray-700">
                  Kelas
                </label>
                <select
                  className="w-full border rounded-lg px-2 py-1.5 mt-1 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm disabled:opacity-50"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={classOptions.length === 0}
                >
                  <option value="">Semua</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-20 shrink-0">
                <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Rank
                </label>
                <input
                  type="number"
                  placeholder="Top N"
                  className="w-full border rounded-lg px-2 py-1.5 mt-1 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-700 whitespace-nowrap pb-2 shrink-0">
                <input
                  type="checkbox"
                  checked={firstAttemptOnly}
                  onChange={() => setFirstAttemptOnly((v) => !v)}
                />
                Percobaan 1
              </label>

              <div className="w-40 shrink-0">
                <label className="text-xs font-semibold text-gray-700">
                  Cari Nama
                </label>
                <div className="relative mt-1">
                  <FiSearch
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Nama peserta"
                    className="w-full border rounded-lg pl-7 pr-2 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>

              {searchedLeaderboard.length > 0 && (
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-semibold active:scale-95 whitespace-nowrap"
                >
                  <AiOutlineFilePdf size={16} />
                  PDF
                </button>
              )}
            </div>

            {/* Ringkasan */}
            {displaySummary && (
              <div className="shrink-0 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-2xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-1">
                    <FiUsers size={14} />
                    <p className="text-xs font-medium text-blue-600">
                      Total Peserta
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-blue-700">
                    {displaySummary.total_participants}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100 rounded-2xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-purple-500 mb-1">
                    <FiRepeat size={14} />
                    <p className="text-xs font-medium text-purple-600">
                      Total Percobaan
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-purple-700">
                    {displaySummary.total_attempt}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100 rounded-2xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-green-500 mb-1">
                    <FiTrendingUp size={14} />
                    <p className="text-xs font-medium text-green-600">
                      Rata-rata Skor
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-green-700">
                    {Number(displaySummary.average_score).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-100 rounded-2xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-yellow-500 mb-1">
                    <FiAward size={14} />
                    <p className="text-xs font-medium text-yellow-600">
                      Skor Tertinggi
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-yellow-700">
                    {Number(displaySummary.highest_score).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0 mt-5 overflow-y-auto pr-1">
              {!selected ? (
                <p className="text-gray-500 text-center py-10">
                  Silakan pilih tryout terlebih dahulu.
                </p>
              ) : loading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-2">Memuat leaderboard...</p>
                </div>
              ) : searchedLeaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  {searchName.trim()
                    ? "Tidak ada peserta dengan nama tersebut."
                    : "Leaderboard masih kosong."}
                </p>
              ) : (
                <table className="min-w-full mt-2 border">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 border text-sm">Rank</th>
                      <th className="p-2 border text-sm">Nama</th>
                      <th className="p-2 border text-sm">Kelas</th>
                      <th className="p-2 border text-sm">Skor</th>
                      <th className="p-2 border text-sm">Percobaan</th>
                      <th className="p-2 border text-sm">Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeaderboard.map((d) => {
                      // ==== PEMBEDA VISUAL RANK 1, 2, 3 ====
                      const badge = RANK_BADGE[d.rank];

                      return (
                        <tr
                          key={`${d.user_id}-${d.attempt}`}
                          className={
                            badge
                              ? `${badge.rowClass} font-semibold`
                              : "odd:bg-white even:bg-gray-50"
                          }
                        >
                          <td className="border p-2 text-center">
                            {badge ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${badge.pillClass}`}
                                title={badge.label}
                              >
                                <span className="text-base leading-none">
                                  {badge.emoji}
                                </span>
                                #{d.rank}
                              </span>
                            ) : (
                              <span className="font-bold text-blue-700">
                                #{d.rank}
                              </span>
                            )}
                          </td>
                          <td className="border p-2 capitalize">{d.name}</td>
                          <td className="border p-2 text-center">{d.class}</td>
                          <td
                            className={`border p-2 text-center font-bold ${
                              badge ? badge.rankTextClass : "text-blue-800"
                            }`}
                          >
                            {Number(d.score).toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border p-2 text-center">
                            {d.attempt}
                          </td>
                          <td className="border p-2 text-center">
                            {formatDuration(d.duration)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {selected && !loading && searchedLeaderboard.length > 0 && (
              <div className="shrink-0 mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Menampilkan{" "}
                    <span className="font-semibold text-gray-800">
                      {(currentPage - 1) * pageSize + 1}
                      {"–"}
                      {Math.min(
                        currentPage * pageSize,
                        searchedLeaderboard.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-gray-800">
                      {searchedLeaderboard.length}
                    </span>{" "}
                    peserta
                  </span>
                  <select
                    className="border rounded-lg px-2 py-1 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size} / halaman
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  <span className="px-3 text-sm font-medium text-gray-700">
                    Halaman {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
