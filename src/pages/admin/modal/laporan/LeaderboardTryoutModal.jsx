import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Api from "../../../../utils/Api";

export default function LeaderboardTryoutModal({ open, setOpen }) {
  const [listTryout, setListTryout] = useState([]);
  const [selected, setSelected] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch list tryout saat modal dibuka
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

  // Fetch leaderboard
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

  // Trigger fetch on tryout change
  useEffect(() => {
    if (selected) fetchLeaderboard(selected);
  }, [selected]);

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
            {/* HEADER */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Leaderboard Tryout</h2>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              >
                ✕
              </button>
            </div>

            {/* SELECT TRYOUT */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">
                Pilih Tryout
              </label>

              <select
                className="w-full border rounded-xl px-3 py-3 mt-2 bg-gray-50 
                           focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
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
                      <th className="p-2 border text-sm">Nilai</th>
                      <th className="p-2 border text-sm">Benar</th>
                      <th className="p-2 border text-sm">Salah</th>
                      <th className="p-2 border text-sm">Kosong</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaderboard.map((d, i) => (
                      <tr key={i} className="odd:bg-white even:bg-gray-50">
                        <td className="border p-2 text-center font-bold text-blue-700">
                          #{d.rn}
                        </td>
                        <td className="border p-2 capitalize">{d.nama_user}</td>
                        <td className="border p-2 text-center">{d.nilai}</td>
                        <td className="border p-2 text-center text-green-700 font-semibold">
                          {d.benar}
                        </td>
                        <td className="border p-2 text-center text-red-600 font-semibold">
                          {d.salah}
                        </td>
                        <td className="border p-2 text-center">{d.kosong}</td>
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
