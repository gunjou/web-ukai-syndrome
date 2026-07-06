import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Api from "../../../../utils/Api";
import ApiExternal from "../../../../utils/ApiExternal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiUsers, FiRepeat, FiTrendingUp, FiAward } from "react-icons/fi";

export default function LeaderboardTryoutModal({ open, setOpen }) {
  const [listTryout, setListTryout] = useState([]);
  const [selected, setSelected] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState("");
  const [firstAttemptOnly, setFirstAttemptOnly] = useState(false);

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
    if (selected) fetchLeaderboard(selected);
  }, [selected]);

  // Filter limit rank + percobaan pertama dilakukan di frontend
  useEffect(() => {
    let result = rawLeaderboard;

    // Filter percobaan pertama saja (attempt === 1)
    if (firstAttemptOnly) {
      result = result
        .filter((d) => d.attempt === 1)
        // rawLeaderboard sudah terurut berdasarkan skor (rank asli),
        // jadi urutan relatifnya tetap valid setelah difilter
        .map((d, idx) => ({ ...d, rank: idx + 1 }));
    }

    // Filter limit rank
    const n = parseInt(limit, 10);
    if (limit && !isNaN(n) && n > 0) {
      result = result.filter((d) => d.rank <= n);
    }

    setLeaderboard(result);
  }, [limit, firstAttemptOnly, rawLeaderboard]);

  const downloadPDF = () => {
    if (leaderboard.length === 0) return;

    const doc = new jsPDF();
    const tryoutName = listTryout.find((t) => t.id_tryout == selected)?.judul;

    doc.setFontSize(16);
    doc.text("Leaderboard Tryout", 14, 15);

    doc.setFontSize(11);
    doc.text(`Tryout: ${tryoutName || "-"}`, 14, 22);

    if (summary) {
      doc.setFontSize(10);
      doc.text(
        `Peserta: ${summary.total_participants} | Percobaan: ${
          summary.total_attempt
        } | Rata-rata: ${Number(summary.average_score).toFixed(
          2
        )} | Tertinggi: ${summary.highest_score}`,
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
      "Durasi (menit)",
    ];
    const tableRows = leaderboard.map((d) => [
      `#${d.rank}`,
      d.name,
      d.class,
      d.score,
      d.attempt,
      d.duration,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: summary ? 33 : 28,
      theme: "grid",
    });

    // Susun nama file sesuai filter yang aktif
    const parts = [tryoutName || "Tryout"];

    const n = parseInt(limit, 10);
    if (limit && !isNaN(n) && n > 0) {
      parts.push(`Top${n}`);
    }

    if (firstAttemptOnly) {
      parts.push("PercobaanPertama");
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
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Leaderboard Tryout</h2>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              >
                ✕
              </button>
            </div>

            {/* Baris filter: Pilih Tryout, Batasi Rank, Checkbox, Download PDF */}
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[220px]">
                <label className="text-sm font-semibold text-gray-700">
                  Pilih Tryout
                </label>
                <select
                  className="w-full border rounded-xl px-3 py-3 mt-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
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

              <div className="w-40">
                <label className="text-sm font-semibold text-gray-700">
                  Batasi Rank
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 5, 10"
                  className="w-full border rounded-xl px-3 py-3 mt-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 whitespace-nowrap pb-3">
                <input
                  type="checkbox"
                  checked={firstAttemptOnly}
                  onChange={() => setFirstAttemptOnly((v) => !v)}
                />
                Percobaan Pertama Saja
              </label>

              {leaderboard.length > 0 && (
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold active:scale-95 whitespace-nowrap"
                >
                  <AiOutlineFilePdf size={20} className="animate-pulse" />
                  Download PDF
                </button>
              )}
            </div>

            {/* Ringkasan */}
            {summary && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-2xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-1">
                    <FiUsers size={14} />
                    <p className="text-xs font-medium text-blue-600">
                      Total Peserta
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-blue-700">
                    {summary.total_participants}
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
                    {summary.total_attempt}
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
                    {Number(summary.average_score).toFixed(2)}
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
                    {summary.highest_score}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 overflow-y-auto max-h-[60vh] pr-1">
              {!selected ? (
                <p className="text-gray-500 text-center py-10">
                  Silakan pilih tryout terlebih dahulu.
                </p>
              ) : loading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-2">Memuat leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  Leaderboard masih kosong.
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
                      <th className="p-2 border text-sm">Durasi (menit)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((d) => (
                      <tr
                        key={d.user_id}
                        className="odd:bg-white even:bg-gray-50"
                      >
                        <td className="border p-2 text-center font-bold text-blue-700">
                          #{d.rank}
                        </td>
                        <td className="border p-2 capitalize">{d.name}</td>
                        <td className="border p-2 text-center">{d.class}</td>
                        <td className="border p-2 text-center text-blue-800 font-bold">
                          {d.score}
                        </td>
                        <td className="border p-2 text-center">{d.attempt}</td>
                        <td className="border p-2 text-center">{d.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
