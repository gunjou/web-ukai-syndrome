import React, { useEffect, useState, useRef } from "react";
import Api from "../../utils/Api.jsx";
import { FiX, FiHelpCircle, FiClock } from "react-icons/fi";
import { BsCalculator } from "react-icons/bs";
import CalculatorModal from "./components/CalculatorModal.jsx";
import QuestionNavigator from "./components/QuestionNavigator.jsx";
import ExitFullscreenModal from "./components/ExitFullscreenModal.jsx";
import ConfirmEndModal from "./components/ConfirmEndModal.jsx";
import TimeUpModal from "./components/TimeUpModal.jsx";

const TryoutListContent = ({ tryout, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [raguRagu, setRaguRagu] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAttempt, setLoadingAttempt] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const containerRef = useRef(null);
  const [showExitFullscreenModal, setShowExitFullscreenModal] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [attemptToken, setAttemptToken] = useState(null);

  // Start attempt
  useEffect(() => {
    const startAttempt = async () => {
      try {
        const res = await Api.post(
          `/tryout/${tryout.id_tryout}/attempts/start`
        );
        const result = res.data.data;

        console.log("Attempt started:", result);

        setAttempt(result);

        // 🔥 WAJIB: simpan token untuk PUT answer
        setAttemptToken(result.attempt_token);

        if (result?.jawaban_user) {
          const restoredAnswers = {};
          const restoredRagu = [];

          Object.entries(result.jawaban_user).forEach(([key, val]) => {
            const nomor = parseInt(key.replace("soal_", ""));
            if (val.jawaban) restoredAnswers[nomor] = val.jawaban;
            if (val.ragu === 1) restoredRagu.push(nomor);
          });

          setAnswers(restoredAnswers);
          setRaguRagu(restoredRagu);

          setCurrentIndex(Object.keys(restoredAnswers).length);
        }
      } catch (error) {
        console.error("Gagal memulai attempt:", error);
        alert(error?.response?.data?.message || "Gagal memulai attempt.");
        onBack();
      } finally {
        setLoadingAttempt(false);
      }
    };

    startAttempt();
  }, [tryout]);

  // Ambil soal setelah attempt siap
  useEffect(() => {
    if (!attempt) return;

    const fetchQuestions = async () => {
      try {
        const res = await Api.get(`/tryout/${tryout.id_tryout}/questions`);
        setQuestions(res.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil soal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [attempt]);

  // 🕒 Formatter server time ke WIB
  const parseServerTimeWIB = (timeString) => {
    if (!timeString) return null;
    return new Date(`${timeString.replace(" WIB", "")}+07:00`);
  };

  // ⏳ Fix: Timer tetap walau refresh + WIB
  useEffect(() => {
    if (!attempt) return;

    const saved = localStorage.getItem(`timer_${attempt?.id_hasiltryout}`);

    // Jika user refresh → gunakan waktu tersimpan
    if (saved && Number(saved) > 0) {
      console.log("⏳ Restore timer from localStorage:", saved);
      setTimeLeft(Number(saved));
      return;
    }

    // Jika server memberikan end_time → hitung sisa waktu
    if (attempt?.end_time) {
      const expiry = parseServerTimeWIB(attempt.end_time).getTime();
      const now = Date.now();
      const diff = Math.max(1, Math.floor((expiry - now) / 1000));
      console.log("⏰ Calculated synced time (WIB):", diff);
      setTimeLeft(diff);
    }
    // Jika belum ada end_time → pakai durasi tryout
    else if (tryout?.durasi) {
      setTimeLeft(tryout.durasi * 60);
    }
  }, [attempt, tryout]);

  // ⏱ Timer berjalan + otomatis tersimpan
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          localStorage.removeItem(`timer_${attempt?.id_hasiltryout}`);
          return 0;
        }

        const newTime = prev - 1;
        localStorage.setItem(`timer_${attempt?.id_hasiltryout}`, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Simpan jawaban ke server
  const saveAnswerToServer = async (questionNumber, answer) => {
    const payload = {
      attempt_token: attemptToken, // pastikan variabel attemptToken sudah ada
      nomor: questionNumber,
      jawaban: answer?.toLowerCase(), // backend pakai lower case
      ragu: 0,
    };

    console.log("📌 Payload yang dikirim ke server:", payload);

    try {
      const response = await Api.put("/tryout/attempts/answer", payload);
      console.log("✅ Jawaban berhasil disimpan:", response.data);
    } catch (error) {
      console.error("❌ Gagal menyimpan jawaban:", error);
      if (error.response) {
        console.error("🔍 Response Error:", error.response.data);
      }
    }
  };

  const handleAnswerChange = (questionNumber, newValue) => {
    console.log("📘 User memilih jawaban:", {
      nomor: questionNumber,
      jawaban: newValue,
    });

    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: newValue,
    }));

    saveAnswerToServer(questionNumber, newValue);
  };

  const toggleRaguRagu = (nomor) => {
    setRaguRagu((prev) => {
      const updated = prev.includes(nomor)
        ? prev.filter((id) => id !== nomor)
        : [...prev, nomor];

      const currentJawaban = answers[nomor] ?? "";
      saveAnswerToServer(
        nomor,
        currentJawaban,
        updated.includes(nomor) ? 1 : 0
      );

      return updated;
    });
  };

  // Submit final
  const handleSubmit = async () => {
    try {
      const res = await Api.post("/tryout/attempts/submit", {
        attempt_token: attempt?.attempt_token,
      });

      alert(`Tryout selesai! Nilai Anda: ${res.data?.result?.nilai}`);
      onBack();
    } catch (err) {
      console.error("Gagal submit attempt:", err);
      alert("Terjadi kesalahan saat submit.");
    }
  };

  // Fullscreen guard
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowExitFullscreenModal(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    containerRef.current?.requestFullscreen().catch(() => {});

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gray-100 z-50 flex flex-col p-6 overflow-y-auto"
    >
      {/* LOADING ATTEMPT */}
      {loadingAttempt ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Menyiapkan sesi tryout...</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-100 z-50 pb-3 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold capitalize">
                {tryout.judul}
              </h1>
              <p className="text-gray-500 text-sm">
                {questions.length} Soal • Attempt ke-{attempt?.attempt_ke}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1 font-semibold text-lg ${
                  timeLeft <= 600 ? "text-red-500" : "text-green-600"
                }`}
              >
                <FiClock /> {formatTime(timeLeft)}
              </span>

              <button
                onClick={() => setShowCalculator(true)}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                <BsCalculator />
              </button>

              <button
                onClick={() => setShowConfirmEndModal(true)}
                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* SOAL */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
              <p className="text-gray-600">Memuat soal...</p>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-full md:w-64 sticky top-6 h-max">
                <QuestionNavigator
                  questions={questions}
                  currentIndex={currentIndex}
                  answers={answers}
                  raguRagu={raguRagu}
                  setCurrentIndex={setCurrentIndex}
                />
              </div>

              <div className="flex-1 bg-white rounded-xl shadow p-6 border border-gray-200 overflow-y-auto max-h-[calc(100vh-6rem)]">
                <div className="text-lg font-medium mb-4 leading-relaxed">
                  <span>{currentIndex + 1}. </span>
                  <div
                    className="soal-content [&_img]:max-w-full [&_img]:object-contain"
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion?.pertanyaan,
                    }}
                  />
                </div>

                <div className="space-y-2">
                  {Object.entries(currentQuestion?.opsi || {}).map(
                    ([key, value]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                          answers[currentQuestion.nomor_urut] === key
                            ? "bg-red-50 border-red-400"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`soal-${currentQuestion.id_soaltryout}`}
                          value={key}
                          checked={answers[currentQuestion.nomor_urut] === key}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.nomor_urut, key)
                          }
                          className="accent-red-500"
                        />
                        <span className="font-semibold">{key}.</span>
                        <span>{value}</span>
                      </label>
                    )
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => toggleRaguRagu(currentQuestion.nomor_urut)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      raguRagu.includes(currentQuestion.nomor_urut)
                        ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <FiHelpCircle />
                    {raguRagu.includes(currentQuestion.nomor_urut)
                      ? "Hapus Ragu-Ragu"
                      : "Tandai Ragu-Ragu"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => prev - 1)}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentIndex === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Sebelumnya
                    </button>

                    {currentIndex === questions.length - 1 ? (
                      <button
                        onClick={() => setShowConfirmEndModal(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
                      >
                        Selesai Tryout
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
                      >
                        Selanjutnya
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {showCalculator && (
        <CalculatorModal onClose={() => setShowCalculator(false)} />
      )}
      {showExitFullscreenModal && (
        <ExitFullscreenModal
          onContinue={() => {
            containerRef.current?.requestFullscreen().catch(() => {});
            setShowExitFullscreenModal(false);
          }}
          onEnd={handleSubmit}
        />
      )}
      {showConfirmEndModal && (
        <ConfirmEndModal
          onCancel={() => setShowConfirmEndModal(false)}
          onConfirm={handleSubmit}
          raguCount={raguRagu.length}
        />
      )}
      {isTimeUp && <TimeUpModal onConfirm={handleSubmit} />}
    </div>
  );
};

export default TryoutListContent;
