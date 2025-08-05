import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HiDocumentText } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import Api from "../../utils/Api";
import { pdfjs } from "react-pdf";

// Dummy questions data
const dummyQuestions = [
  {
    id: 1,
    question:
      "Ibu membeli 3 kg apel dan 2 kg jeruk. Jika harga apel Rp20.000/kg dan jeruk Rp15.000/kg, berapa total harga yang harus dibayar Ibu?",
    options: ["Rp60.000", "Rp70.000", "Rp80.000", "Rp85.000"],
    answer: 1,
  },
  {
    id: 2,
    question: "Manakah yang merupakan ibukota provinsi Jawa Tengah?",
    options: ["Surabaya", "Semarang", "Bandung", "Yogyakarta"],
    answer: 1,
  },
  {
    id: 3,
    question: "Hasil dari 12 x 8 adalah ...",
    options: ["80", "88", "96", "104"],
    answer: 2,
  },
];

const TryoutListContent = () => {
  const { folder } = useParams();
  const [TryoutList, setTryOutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTryOut, setSelectedTryOut] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tambahkan state untuk soal dan jawaban
  const [currentNumber, setCurrentNumber] = useState(0);
  const [answers, setAnswers] = useState(
    Array(dummyQuestions.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [timer, setTimer] = useState(60 * 10); // contoh: 10 menit (600 detik)
  const [intervalId, setIntervalId] = useState(null);

  // Tambahkan state doubts
  const [doubts, setDoubts] = useState(
    Array(dummyQuestions.length).fill(false)
  );

  // Tambahkan state untuk warning ragu-ragu
  const [showDoubtWarning, setShowDoubtWarning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiRes, modulRes] = await Promise.all([
          Api.get("/materi/peserta"),
          Api.get("/modul/user"),
        ]);

        const materiData = materiRes.data.data || [];
        const modulData = modulRes.data.data || [];

        const selectedModul = modulData.find((modul) => {
          const slug = modul.judul.toLowerCase().replace(/\s+/g, "-");
          return slug === folder;
        });

        if (!selectedModul) {
          setTryOutList([]);
          setError("Modul tidak ditemukan.");
          setLoading(false);
          return;
        }

        const filtered = materiData.filter(
          (item) =>
            item.id_modul === selectedModul.id_modul &&
            item.tipe_materi === "document"
        );

        setTryOutList(filtered);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat materi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [folder]);

  const getEmbedUrl = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const loadPdf = (url) => {
    setPdfUrl(getEmbedUrl(url));
  };

  useEffect(() => {
    // Listener untuk deteksi keluar fullscreen
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(!!fsElement);

      // Jika keluar fullscreen saat ujian, tampilkan modal konfirmasi
      if (!fsElement && selectedTryOut) {
        setShowExitModal(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [selectedTryOut]);

  const openFullscreen = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  };

  const closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  };

  // Fungsi handle jawaban
  const handleAnswer = (idx) => {
    const newAnswers = [...answers];
    newAnswers[currentNumber] = idx;
    setAnswers(newAnswers);
  };

  // Fungsi toggle ragu-ragu
  const toggleDoubt = (idx) => {
    const newDoubts = [...doubts];
    newDoubts[idx] = !newDoubts[idx];
    setDoubts(newDoubts);
  };

  // Fungsi submit ujian
  const handleFinish = () => {
    if (doubts.some(Boolean)) {
      setShowDoubtWarning(true);
      return;
    }
    setShowResult(true);
    //closeFullscreen();
  };

  // Timer countdown effect
  useEffect(() => {
    if (selectedTryOut && isFullscreen && !showResult) {
      const id = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setShowResult(true);
            closeFullscreen();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
    // Reset timer jika keluar ujian
    if (!selectedTryOut || showResult) {
      setTimer(60 * 10);
      if (intervalId) clearInterval(intervalId);
    }
  }, [selectedTryOut, isFullscreen, showResult]);

  // Format waktu mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    // Hilangkan tanda ragu-ragu saat soal dibuka
    if (doubts[currentNumber]) {
      const newDoubts = [...doubts];
      newDoubts[currentNumber] = false;
      setDoubts(newDoubts);
    }
    // eslint-disable-next-line
  }, [currentNumber]);

  return (
    <div className="p-2 relative">
      <h2 className="text-2xl font-semibold mb-4 capitalize">
        {folder?.replace(/-/g, " ")}
      </h2>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : TryoutList.length > 0 ? (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {TryoutList.map((tryout) => (
            <div
              key={tryout.id_materi}
              onClick={() => {
                setSelectedTryOut(tryout);
                loadPdf(tryout.url_file);
              }}
              className="flex items-start gap-4 bg-white p-4 shadow rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
            >
              <HiDocumentText className="text-blue-500 text-3xl flex-shrink-0 mt-1" />
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 capitalize">
                  {tryout.judul}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Belum ada materi untuk folder ini.</p>
      )}

      {/* Modal Tryout Fullscreen */}
      {selectedTryOut && (
        <div
          ref={(el) => {
            if (el && !isFullscreen) openFullscreen(el);
          }}
          className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center"
          tabIndex={-1}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (
              e.key === "F11" ||
              e.key === "Escape" ||
              (e.ctrlKey &&
                (e.key === "w" || e.key === "W" || e.key === "Tab")) ||
              (e.altKey && e.key === "Tab")
            ) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }}
        >
          {!isFullscreen && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
              Silakan kembali ke mode fullscreen untuk melanjutkan tryout.
              <button
                className="ml-4 bg-white text-red-600 px-2 py-1 rounded"
                onClick={() =>
                  openFullscreen(document.querySelector(".fixed.inset-0"))
                }
              >
                Fullscreen
              </button>
            </div>
          )}

          {/* MAP SOAL KIRI ATAS */}
          <div className="absolute top-6 left-8 z-50 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center">
            <div className="font-semibold mb-2 text-gray-700 text-sm">
              Map Soal
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {dummyQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`w-8 h-8 rounded-full border text-sm font-bold transition relative
                    ${
                      idx === currentNumber
                        ? "bg-blue-600 text-white"
                        : answers[idx] !== null
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }
                    ${doubts[idx] ? "ring-2 ring-yellow-400" : ""}
                  `}
                  onClick={() => setCurrentNumber(idx)}
                  title={doubts[idx] ? "Ragu-ragu" : ""}
                >
                  {idx + 1}
                  {doubts[idx] && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></span>
                  )}
                </button>
              ))}
            </div>
            {/* Tombol Selesai Ujian di Map Soal */}
            <button
              className={`w-full px-4 py-2 rounded text-white text-sm font-semibold transition ${
                answers.some((ans) => ans === null)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={handleFinish}
              disabled={answers.some((ans) => ans === null)}
            >
              Selesai
            </button>
          </div>

          {/* KONTEN UJIAN */}
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg relative select-none">
            {/* Progress Bar Waktu */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className={`h-3 transition-all duration-500 ${
                  timer <= 300 ? "bg-red-600" : "bg-blue-500"
                }`}
                style={{
                  width: `${(timer / (60 * 10)) * 100}%`, // 10 menit default
                }}
              ></div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 capitalize">
                {selectedTryOut.judul}
              </h3>
              {/* Timer */}
              <div
                className={`text-lg font-mono bg-gray-100 px-4 py-1 rounded ${
                  timer <= 300 ? "text-red-600 font-bold" : "text-blue-700"
                }`}
              >
                {formatTime(timer)}
              </div>
            </div>
            {!showResult ? (
              <>
                {/* Soal */}
                <div>
                  <div className="mb-4 text-lg font-medium">
                    {currentNumber + 1}.{" "}
                    {dummyQuestions[currentNumber].question}
                  </div>
                  <div className="space-y-2">
                    {dummyQuestions[currentNumber].options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`block px-4 py-2 rounded border cursor-pointer ${
                          answers[currentNumber] === idx
                            ? "bg-blue-100 border-blue-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`soal-${currentNumber}`}
                          className="mr-2"
                          checked={answers[currentNumber] === idx}
                          onChange={() => handleAnswer(idx)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {/* Tombol ragu-ragu */}
                  <button
                    className={`mt-4 px-4 py-2 rounded text-sm font-semibold border ${
                      doubts[currentNumber]
                        ? "bg-yellow-400 text-white border-yellow-400"
                        : "bg-white text-yellow-600 border-yellow-400"
                    }`}
                    onClick={() => toggleDoubt(currentNumber)}
                  >
                    {doubts[currentNumber]
                      ? "Batalkan Ragu-ragu"
                      : "Tandai Ragu-ragu"}
                  </button>
                </div>
                {/* Navigasi */}
                <div className="flex justify-between mt-6">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                    disabled={currentNumber === 0}
                    onClick={() => setCurrentNumber((n) => n - 1)}
                  >
                    Sebelumnya
                  </button>
                  {currentNumber < dummyQuestions.length - 1 ? (
                    <button
                      className={`px-4 py-2 rounded text-white ${
                        answers[currentNumber] === null
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={() => {
                        if (answers[currentNumber] !== null)
                          setCurrentNumber((n) => n + 1);
                      }}
                      disabled={answers[currentNumber] === null}
                    >
                      Selanjutnya
                    </button>
                  ) : (
                    <button
                      className={`px-4 py-2 rounded text-white ${
                        answers.some((ans) => ans === null)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={handleFinish}
                      disabled={answers.some((ans) => ans === null)}
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </>
            ) : (
              // Hasil Ujian
              <div className="text-center py-8">
                <div className="text-2xl font-bold mb-4 text-green-600">
                  Ujian Selesai!
                </div>
                <div className="mb-2">
                  Skor kamu:{" "}
                  <span className="font-bold">
                    {
                      answers.filter(
                        (ans, idx) => ans === dummyQuestions[idx].answer
                      ).length
                    }
                  </span>{" "}
                  / {dummyQuestions.length}
                </div>
                <button
                  className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
                  onClick={() => {
                    setSelectedTryOut(null);
                    setShowResult(false);
                    setCurrentNumber(0);
                    setAnswers(Array(dummyQuestions.length).fill(null));
                  }}
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal konfirmasi keluar fullscreen */}
      {showExitModal && !showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[99999] flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
            <div className="text-lg font-semibold mb-4 text-red-600">
              Anda keluar dari mode fullscreen!
            </div>
            <div className="mb-6 text-gray-700">
              Untuk melanjutkan ujian, silakan kembali ke mode fullscreen.
              <br />
              Atau akhiri ujian jika ingin keluar.
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
                onClick={() => {
                  setShowExitModal(false);
                  openFullscreen(document.querySelector(".fixed.inset-0"));
                }}
              >
                Kembali ke Fullscreen
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
                onClick={() => {
                  setShowExitModal(false);
                  setSelectedTryOut(null);
                  setShowResult(false);
                  setCurrentNumber(0);
                  setAnswers(Array(dummyQuestions.length).fill(null));
                }}
              >
                Akhiri Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal peringatan ragu-ragu */}
      {showDoubtWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[99999999] flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
            <div className="text-lg font-semibold mb-4 text-yellow-600">
              Masih ada jawaban yang ditandai ragu-ragu!
            </div>
            <div className="mb-6 text-gray-700">
              Apakah Anda yakin ingin menyelesaikan ujian?
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold"
                onClick={() => {
                  setShowDoubtWarning(false);
                  setShowResult(true);
                  //closeFullscreen();
                }}
              >
                Ya, Selesaikan
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-semibold"
                onClick={() => setShowDoubtWarning(false)}
              >
                Kembali ke Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryoutListContent;
