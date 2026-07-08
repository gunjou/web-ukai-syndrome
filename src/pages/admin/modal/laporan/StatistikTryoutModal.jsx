import React, { useEffect, useState } from "react";
import Api from "../../../../utils/Api";
import ApiExternal from "../../../../utils/ApiExternal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AiOutlineFilePdf } from "react-icons/ai";
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
  const [overview, setOverview] = useState(null);
  const [score, setScore] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [questionAnalysis, setQuestionAnalysis] = useState([]);
  const [questionSort, setQuestionSort] = useState("default");
  const [questionPage, setQuestionPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // ==== STATE: DETAIL PILIHAN JAWABAN PER SOAL ====
  const [choiceDetail, setChoiceDetail] = useState(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [loadingChoiceDetail, setLoadingChoiceDetail] = useState(false);

  useEffect(() => {
    if (open) fetchTryoutList();
  }, [open]);

  useEffect(() => {
    if (selectedTryout) {
      fetchStatistics();
      fetchDistribution();
      setQuestionSort("default");
    }
  }, [selectedTryout]);

  useEffect(() => {
    if (selectedTryout) fetchQuestionAnalysis();
  }, [selectedTryout, questionSort]);

  useEffect(() => {
    setQuestionPage(1);
  }, [questionAnalysis]);

  const fetchTryoutList = async () => {
    try {
      const res = await Api.get("/tryout/all-tryout");
      setListTryout(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch list tryout", err);
    }
  };

  const fetchStatistics = async () => {
    if (!selectedTryout) return;

    try {
      setLoading(true);
      const res = await ApiExternal.get(`/tryout/${selectedTryout}/statistics`);

      const payload = res.data?.data || {};
      setOverview(payload.overview || null);
      setScore(payload.score || null);
    } catch (err) {
      console.error("Gagal fetch statistik", err);
      setOverview(null);
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistribution = async () => {
    if (!selectedTryout) return;

    try {
      const res = await ApiExternal.get(
        `/tryout/${selectedTryout}/distribution`
      );

      const payload = res.data?.data || {};
      setDistribution(payload.distribution || []);
    } catch (err) {
      console.error("Gagal fetch distribusi skor", err);
      setDistribution([]);
    }
  };

  const fetchQuestionAnalysis = async () => {
    if (!selectedTryout) return;

    try {
      setLoadingQuestion(true);
      const res = await ApiExternal.get(`/tryout/${selectedTryout}/questions`, {
        params: { sort: questionSort },
      });

      setQuestionAnalysis(res.data?.data || []);
    } catch (err) {
      console.error("Gagal fetch analisis soal", err);
      setQuestionAnalysis([]);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // ==== FETCH: DETAIL PILIHAN JAWABAN PER SOAL ====
  const fetchQuestionChoices = async (idSoal) => {
    try {
      setChoiceDetail(null);
      setShowChoiceModal(true);
      setLoadingChoiceDetail(true);

      const res = await ApiExternal.get(`/tryout/question/${idSoal}/choices`);
      setChoiceDetail(res.data?.data || null);
    } catch (err) {
      console.error("Gagal fetch detail pilihan jawaban", err);
      setChoiceDetail(null);
    } finally {
      setLoadingChoiceDetail(false);
    }
  };

  const sortLabel = {
    default: "Default",
    hardest: "Tersulit",
    easiest: "Termudah",
  };

  const downloadPDF = () => {
    if (
      !overview &&
      !score &&
      distribution.length === 0 &&
      questionAnalysis.length === 0
    )
      return;

    const doc = new jsPDF();
    const tryoutName = listTryout.find(
      (t) => t.id_tryout == selectedTryout
    )?.judul;

    doc.setFontSize(16);
    doc.text("Statistik Tryout", 14, 15);

    doc.setFontSize(11);
    doc.text(`Tryout: ${tryoutName || "-"}`, 14, 22);

    let cursorY = 30;

    // SECTION: OVERVIEW
    if (overview) {
      doc.setFontSize(12);
      doc.text("Ringkasan", 14, cursorY);

      autoTable(doc, {
        startY: cursorY + 4,
        theme: "grid",
        head: [["Metrik", "Nilai"]],
        body: [
          ["Total Peserta", overview.total_participants],
          ["Total Attempt", overview.total_attempt],
          ["Selesai", overview.completed],
          ["Belum Selesai", overview.unfinished],
          ["Tingkat Penyelesaian", `${overview.completion_rate}%`],
          ["Rata-rata Durasi", `${overview.average_duration} detik`],
        ],
      });

      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // SECTION: SKOR
    if (score) {
      doc.setFontSize(12);
      doc.text("Detail Skor", 14, cursorY);

      autoTable(doc, {
        startY: cursorY + 4,
        theme: "grid",
        head: [["Metrik", "Nilai"]],
        body: [
          ["Tertinggi", score.highest],
          ["Terendah", score.lowest],
          ["Rata-rata", score.average],
          ["Median", score.median],
        ],
      });

      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // SECTION: DISTRIBUSI SKOR
    if (distribution.length > 0) {
      doc.setFontSize(12);
      doc.text("Distribusi Skor Peserta", 14, cursorY);

      autoTable(doc, {
        startY: cursorY + 4,
        theme: "grid",
        head: [["Rentang Skor", "Jumlah Peserta"]],
        body: distribution.map((d) => [d.range, d.count]),
      });

      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // SECTION: ANALISIS SOAL
    if (questionAnalysis.length > 0) {
      // Kalau section sebelumnya sudah mendekati batas halaman, mulai halaman baru
      if (cursorY > 250) {
        doc.addPage();
        cursorY = 15;
      }

      doc.setFontSize(12);
      doc.text(
        `Analisis Soal (Urutan: ${sortLabel[questionSort] || "Default"})`,
        14,
        cursorY
      );

      autoTable(doc, {
        startY: cursorY + 4,
        theme: "grid",
        head: [
          ["No. Soal", "Benar", "Salah", "Kosong", "Ragu", "Tingkat Kebenaran"],
        ],
        body: questionAnalysis.map((q) => [
          `#${q.number}`,
          q.correct,
          q.wrong,
          q.blank,
          q.doubt,
          `${(q.correct_rate * 100).toFixed(1)}%`,
        ]),
      });
    }

    // Susun nama file sesuai filter yang aktif
    const parts = [tryoutName || "Tryout", "Statistik"];

    if (questionAnalysis.length > 0 && questionSort !== "default") {
      parts.push(`AnalisisSoal${sortLabel[questionSort]}`);
    }

    const fileName = parts
      .join("_")
      .replace(/\s+/g, "_") // spasi jadi underscore
      .replace(/[^a-zA-Z0-9_-]/g, ""); // buang karakter tidak aman untuk nama file

    doc.save(`${fileName}.pdf`);
  };

  if (!open) return null;

  // Pie chart: perbandingan peserta yang selesai vs belum selesai
  const completionData = overview
    ? [
        { name: "Selesai", value: overview.completed },
        { name: "Belum Selesai", value: overview.unfinished },
      ]
    : [];

  const COLORS = ["#4ade80", "#f87171", "#fbbf24", "#60a5fa", "#a78bfa"];

  // Pagination untuk tabel analisis soal
  const totalQuestionPages = Math.max(
    1,
    Math.ceil(questionAnalysis.length / QUESTIONS_PER_PAGE)
  );
  const paginatedQuestions = questionAnalysis.slice(
    (questionPage - 1) * QUESTIONS_PER_PAGE,
    questionPage * QUESTIONS_PER_PAGE
  );

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
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
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

            {selectedTryout &&
              (overview ||
                score ||
                distribution.length > 0 ||
                questionAnalysis.length > 0) && (
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold active:scale-95 whitespace-nowrap"
                >
                  <AiOutlineFilePdf size={20} />
                  Download PDF
                </button>
              )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-2">Memuat statistik...</p>
            </div>
          )}

          {/* CHARTS */}
          {!loading && overview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PIE CHART: STATUS PENGERJAAN */}
              <div className="bg-white rounded-2xl shadow-lg border p-5">
                <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
                  Status Pengerjaan
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={completionData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        label={({ name, percent }) =>
                          `${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {completionData.map((entry, index) => (
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

              {/* BAR CHART: DISTRIBUSI SKOR */}
              <div className="bg-white rounded-2xl shadow-lg border p-5">
                <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
                  Distribusi Skor Peserta
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <BarChart data={distribution} barSize={45}>
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="count"
                        name="Jumlah Peserta"
                        radius={[6, 6, 0, 0]}
                      >
                        {distribution.map((entry, index) => (
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
          {!loading && overview && (
            <div className="bg-gray-50 p-5 rounded-2xl border shadow-inner">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
                Detail Statistik
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
                <p>
                  <b>Total Peserta:</b> {overview.total_participants}
                </p>
                <p>
                  <b>Total Attempt:</b> {overview.total_attempt}
                </p>
                <p>
                  <b>Selesai:</b> {overview.completed}
                </p>
                <p>
                  <b>Belum Selesai:</b> {overview.unfinished}
                </p>
                <p>
                  <b>Tingkat Penyelesaian:</b> {overview.completion_rate}%
                </p>
                <p>
                  <b>Rata-rata Durasi:</b> {overview.average_duration} detik
                </p>
              </div>
            </div>
          )}

          {/* DETAIL SKOR */}
          {!loading && score && (
            <div className="bg-gray-50 p-5 rounded-2xl border shadow-inner">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
                Detail Skor
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
                <p>
                  <b>Tertinggi:</b> {score.highest}
                </p>
                <p>
                  <b>Terendah:</b> {score.lowest}
                </p>
                <p>
                  <b>Rata-rata:</b> {score.average}
                </p>
                <p>
                  <b>Median:</b> {score.median}
                </p>
              </div>
            </div>
          )}

          {/* ANALISIS SOAL */}
          {selectedTryout && (
            <div className="bg-white rounded-2xl shadow-lg border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Analisis Soal
                </h3>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    Urutkan:
                  </label>
                  <select
                    value={questionSort}
                    onChange={(e) => setQuestionSort(e.target.value)}
                    className="border rounded-xl px-3 py-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  >
                    <option value="default">Default (No. Soal)</option>
                    <option value="hardest">Tersulit</option>
                    <option value="easiest">Termudah</option>
                  </select>
                </div>
              </div>

              {loadingQuestion ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-2">Memuat analisis soal...</p>
                </div>
              ) : questionAnalysis.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada data analisis soal.
                </p>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-2">
                    Klik salah satu baris untuk melihat detail pilihan jawaban.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="p-2 border">No. Soal</th>
                          <th className="p-2 border">Benar</th>
                          <th className="p-2 border">Salah</th>
                          <th className="p-2 border">Kosong</th>
                          <th className="p-2 border">Ragu</th>
                          <th className="p-2 border">Tingkat Kebenaran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedQuestions.map((q) => {
                          const rate = q.correct_rate * 100;
                          const rateColor =
                            rate >= 70
                              ? "text-green-700"
                              : rate >= 40
                              ? "text-yellow-700"
                              : "text-red-700";

                          return (
                            <tr
                              key={q.id}
                              onClick={() => fetchQuestionChoices(q.id)}
                              title="Klik untuk detail pilihan jawaban"
                              className="odd:bg-white even:bg-gray-50 cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                              <td className="border p-2 text-center font-semibold">
                                #{q.number}
                              </td>
                              <td className="border p-2 text-center text-green-700">
                                {q.correct}
                              </td>
                              <td className="border p-2 text-center text-red-700">
                                {q.wrong}
                              </td>
                              <td className="border p-2 text-center text-gray-600">
                                {q.blank}
                              </td>
                              <td className="border p-2 text-center text-yellow-700">
                                {q.doubt}
                              </td>
                              <td
                                className={`border p-2 text-center font-bold ${rateColor}`}
                              >
                                {rate.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION CONTROLS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                    <p className="text-xs text-gray-500">
                      Menampilkan {(questionPage - 1) * QUESTIONS_PER_PAGE + 1}–
                      {Math.min(
                        questionPage * QUESTIONS_PER_PAGE,
                        questionAnalysis.length
                      )}{" "}
                      dari {questionAnalysis.length} soal
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setQuestionPage((p) => Math.max(1, p - 1))
                        }
                        disabled={questionPage === 1}
                        className="px-3 py-1.5 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>

                      {Array.from(
                        { length: totalQuestionPages },
                        (_, i) => i + 1
                      )
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalQuestionPages ||
                            Math.abs(p - questionPage) <= 1
                        )
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === "..." ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-2 text-gray-400 text-sm"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setQuestionPage(p)}
                              className={`px-3 py-1.5 text-sm rounded-lg border ${
                                p === questionPage
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}

                      <button
                        onClick={() =>
                          setQuestionPage((p) =>
                            Math.min(totalQuestionPages, p + 1)
                          )
                        }
                        disabled={questionPage === totalQuestionPages}
                        className="px-3 py-1.5 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: DETAIL PILIHAN JAWABAN PER SOAL */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[92%] max-w-lg p-6 relative border border-gray-200">
            <button
              onClick={() => setShowChoiceModal(false)}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
              Detail Pilihan Jawaban
            </h3>

            {loadingChoiceDetail && (
              <div className="flex flex-col items-center py-10">
                <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-2 text-sm">Memuat detail...</p>
              </div>
            )}

            {!loadingChoiceDetail && !choiceDetail && (
              <p className="text-gray-500 text-center py-8 text-sm">
                Data tidak ditemukan.
              </p>
            )}

            {!loadingChoiceDetail && choiceDetail && (
              <div className="space-y-5">
                {/* SUMMARY */}
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border">
                  <p>
                    <b>No. Soal:</b> #{choiceDetail.number}
                  </p>
                  <p>
                    <b>Kunci Jawaban:</b>{" "}
                    <span className="text-green-700 font-bold">
                      {choiceDetail.correct_answer}
                    </span>
                  </p>
                  <p>
                    <b>Total Peserta:</b> {choiceDetail.total_participant}
                  </p>
                  <p>
                    <b>Total Menjawab:</b> {choiceDetail.total_answer}
                  </p>
                  <p>
                    <b>Kosong:</b> {choiceDetail.blank}
                  </p>
                  <p>
                    <b>Ragu-ragu:</b> {choiceDetail.doubt}
                  </p>
                </div>

                {/* BAR CHART DISTRIBUSI PILIHAN */}
                <div className="w-full h-56">
                  <ResponsiveContainer>
                    <BarChart
                      data={["a", "b", "c", "d", "e"].map((opt) => ({
                        option: opt.toUpperCase(),
                        count: choiceDetail[opt] ?? 0,
                      }))}
                      barSize={40}
                    >
                      <XAxis dataKey="option" tick={{ fontSize: 13 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Jumlah Pemilih"
                        radius={[6, 6, 0, 0]}
                      >
                        {["a", "b", "c", "d", "e"].map((opt, index) => (
                          <Cell
                            key={index}
                            fill={
                              opt.toUpperCase() === choiceDetail.correct_answer
                                ? "#4ade80"
                                : "#60a5fa"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Bar hijau menandakan pilihan jawaban yang benar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
