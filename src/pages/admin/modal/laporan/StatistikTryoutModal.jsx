import React, { useEffect, useState } from "react";
import Api from "../../../../utils/Api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export default function StatistikTryoutModal({ open, setOpen }) {
  const [listTryout, setListTryout] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState("");
  const [statistik, setStatistik] = useState(null);

  useEffect(() => {
    if (open) fetchTryoutList();
  }, [open]);

  useEffect(() => {
    if (selectedTryout) fetchStatistik();
  }, [selectedTryout]);

  const fetchTryoutList = async () => {
    try {
      const res = await Api.get("/tryout/all-tryout");
      setListTryout(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch list tryout", err);
    }
  };

  const fetchStatistik = async () => {
    if (!selectedTryout) return;

    try {
      const res = await Api.get("/hasil-tryout/statistik", {
        params: { id_tryout: selectedTryout },
      });

      setStatistik(res.data.data);
    } catch (err) {
      console.error("Gagal fetch statistik", err);
    }
  };

  if (!open) return null;

  const pieData = statistik
    ? [
        { name: "Rata-rata Benar", value: statistik.rata_rata_benar },
        { name: "Rata-rata Salah", value: statistik.rata_rata_salah },
        { name: "Rata-rata Kosong", value: statistik.rata_rata_kosong },
      ]
    : [];

  const COLORS = ["#4ade80", "#f87171", "#fbbf24"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-[92%] max-w-6xl max-h-[92vh] p-7 relative overflow-hidden flex flex-col border border-gray-200">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
        >
          ✕
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 tracking-wide">
          Statistik Tryout
        </h2>

        {/* SCROLLABLE AREA */}
        <div
          className="overflow-y-auto pr-2 space-y-6"
          style={{ maxHeight: "80vh" }}
        >
          {/* SELECT TRYOUT */}
          <div>
            <label className="font-semibold text-gray-700 text-sm">
              Pilih Tryout
            </label>
            <select
              value={selectedTryout}
              onChange={(e) => setSelectedTryout(e.target.value)}
              className="w-full mt-2 p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 shadow-sm"
            >
              <option value="">-- Pilih Tryout --</option>
              {listTryout.map((t) => (
                <option key={t.id_tryout} value={t.id_tryout}>
                  {t.judul}
                </option>
              ))}
            </select>
          </div>

          {/* CHARTS */}
          {statistik && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PIE CHART */}
              <div className="bg-white rounded-2xl shadow-lg border p-5">
                <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
                  Komposisi Jawaban
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        label={({ name, percent }) =>
                          `${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value}`, name]}
                        contentStyle={{ fontSize: "13px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BAR CHART */}
              <div className="bg-white rounded-2xl shadow-lg border p-5">
                <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
                  Perbandingan Jawaban
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <BarChart data={pieData} barSize={45}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {pieData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL SECTION */}
          {statistik && (
            <div className="bg-gray-50 p-5 rounded-2xl border shadow-inner">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
                Detail Statistik
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
                {/* <p>
                  <b>ID Tryout:</b> {statistik.id_tryout}
                </p> */}
                <p>
                  <b>Total Peserta:</b> {statistik.total_peserta}
                </p>
                <p>
                  <b>Total Attempt:</b> {statistik.total_attempt}
                </p>
                <p>
                  <b>Selesai:</b> {statistik.total_selesai}
                </p>
                <p>
                  <b>Belum Selesai:</b> {statistik.total_belum_selesai}
                </p>
                <p>
                  <b>Rata-rata Nilai:</b> {statistik.rata_rata_nilai}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
