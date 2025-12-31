import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Api from "../../../utils/Api";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function LeaderboardTryoutModal({ open, setOpen }) {
  const [listTryout, setListTryout] = useState([]);
  const [selected, setSelected] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchTryoutList();
  }, [open]);

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

  const fetchLeaderboard = async (id) => {
    try {
      setLoading(true);
      const res = await Api.get(`/hasil-tryout/${id}/leaderboard`);
      setLeaderboard(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) fetchLeaderboard(selected);
  }, [selected]);

  // ======================================================
  // 📌 EXPORT PDF FUNCTION
  // ======================================================
  const exportPDF = () => {
    if (!leaderboard.length) return;

    const selectedTryout =
      listTryout.find((x) => x.id_tryout === selected)?.judul || "Tryout";

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text(`Leaderboard: ${selectedTryout}`, 14, 15);

    const tableData = leaderboard.map((row) => [
      `#${row.rn}`,
      row.nama_user,
      row.benar,
      row.salah,
      row.nilai,
      row.kosong,
    ]);

    doc.autoTable({
      startY: 25,
      head: [["Rank", "Nama", "Benar", "Salah", "Kosong", "Nilai"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`Leaderboard-${selectedTryout}.pdf`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-[92%] max-w-6xl max-h-[92vh] p-7 relative overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Leaderboard Tryout
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              >
                ✕
              </button>
            </div>

            {/* SELECT TRYOUT */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Pilih Tryout
              </label>

              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3 mt-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
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

            {/* CONTENT */}
            <div className="mt-5 overflow-y-auto max-h-[60vh] pr-1">
              {!selected ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                  Silakan pilih tryout terlebih dahulu.
                </p>
              ) : loading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Memuat leaderboard...
                  </p>
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                  Leaderboard masih kosong.
                </p>
              ) : (
                <>
                  {/* BUTTON DOWNLOAD */}
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={exportPDF}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow text-sm transition"
                    >
                      📄 Download PDF
                    </button>
                  </div>

                  <table className="min-w-full mt-2 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 border text-sm text-gray-700 dark:text-gray-300">
                          Rank
                        </th>
                        <th className="p-2 border text-sm text-gray-700 dark:text-gray-300">
                          Nama
                        </th>
                        <th className="p-2 border text-sm text-gray-700 dark:text-gray-300">
                          Benar
                        </th>
                        <th className="p-2 border text-sm text-gray-700 dark:text-gray-300">
                          Salah
                        </th>
                        <th className="p-2 border text-sm text-gray-700 dark:text-gray-300">
                          Kosong
                        </th>
                        <th className="p-2 border text-sm text-gray-700 dark:text-gray-300">
                          Nilai
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {leaderboard.map((d, i) => (
                        <tr
                          key={i}
                          className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
                        >
                          <td className="border p-2 text-center font-bold text-indigo-600 dark:text-indigo-400">
                            #{d.rn}
                          </td>
                          <td className="border p-2 capitalize text-gray-800 dark:text-gray-200">
                            {d.nama_user}
                          </td>
                          <td className="border p-2 text-center text-green-600 dark:text-green-400 font-semibold">
                            {d.benar}
                          </td>
                          <td className="border p-2 text-center text-red-600 dark:text-red-400 font-semibold">
                            {d.salah}
                          </td>
                          <td className="border p-2 text-center text-gray-700 dark:text-gray-300">
                            {d.kosong}
                          </td>
                          <td className="border p-2 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                            {d.nilai}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
