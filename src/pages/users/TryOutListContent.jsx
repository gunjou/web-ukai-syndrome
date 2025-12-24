import React, { useEffect, useState, useRef } from "react";
import Api from "../../utils/Api.jsx";
import { FiX, FiHelpCircle, FiClock } from "react-icons/fi";
import { BsCalculator } from "react-icons/bs";
import CalculatorModal from "./components/CalculatorModal.jsx";
import QuestionNavigator from "./components/QuestionNavigator.jsx";
// import ExitFullscreenModal from "./components/ExitFullscreenModal.jsx";
import ConfirmEndModal from "./components/ConfirmEndModal.jsx";
import TimeUpModal from "./components/TimeUpModal.jsx";
import ResultModal from "./components/ResultModal.jsx";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import styles for toast notifications

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
  // const [showExitFullscreenModal, setShowExitFullscreenModal] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [attemptToken, setAttemptToken] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [showNavigator, setShowNavigator] = useState(true);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "Peserta";
  const [showOngoingAttemptModal, setShowOngoingAttemptModal] = useState(false);

  // Start attempt with toast message
  useEffect(() => {
    const startAttempt = async () => {
      try {
        // Memulai attempt dengan request POST
        const res = await Api.post(
          `/tryout/${tryout.id_tryout}/attempts/start`
        );
        const result = res.data.data;

        // Periksa status kode HTTP
        const isNewAttempt = res.status === 201; // Jika kode 201, berarti attempt baru

        setAttempt(result);
        setAttemptToken(result.attempt_token);

        // Jika attempt baru (status 201), reset jawaban dan timer
        if (isNewAttempt) {
          setAnswers({});
          setRaguRagu([]);
          setCurrentIndex(0);
          localStorage.removeItem(`timer_${result?.id_hasiltryout}`); // Reset timer
        } else {
          // Jika attempt sebelumnya, restore jawaban yang ada
          if (result?.jawaban_user) {
            const restoredAnswers = {};
            const restoredRagu = [];

            Object.entries(result.jawaban_user).forEach(([key, val]) => {
              const nomor = parseInt(key.replace("soal_", ""));
              if (val.jawaban)
                restoredAnswers[nomor] = val.jawaban.trim().toUpperCase();
              if (val.ragu === 1) restoredRagu.push(nomor);
            });

            setAnswers(restoredAnswers);
            setRaguRagu(restoredRagu);

            const answeredCount = Object.keys(restoredAnswers).length;
            const safeIndex = answeredCount > 0 ? answeredCount : 0;
            setCurrentIndex(safeIndex);
          }
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat memulai attempt:", error);
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
  const saveAnswerToServer = async (nomor, jawaban, ragu = 0) => {
    const payload = {
      attempt_token: attemptToken,
      nomor,
      jawaban: jawaban?.toLowerCase(),
      ragu,
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

      const nilai = res.data?.result?.nilai ?? 0;

      setFinalScore(nilai);
      setShowResultModal(true);

      // Hapus timer dari LocalStorage
      localStorage.removeItem(`timer_${attempt?.id_hasiltryout}`);
    } catch (err) {
      console.error("Gagal submit attempt:", err);
      alert("Terjadi kesalahan saat submit.");
    }
  };

  // // Fullscreen guard
  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     if (!document.fullscreenElement) {
  //       setShowExitFullscreenModal(true);
  //     }
  //   };

  //   document.addEventListener("fullscreenchange", handleFullscreenChange);

  //   containerRef.current?.requestFullscreen().catch(() => {});

  //   return () => {
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //   };
  // }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-[#F7F8FA] z-50 flex flex-col md:p-6 p-3 select-none overflow-hidden">
      {/* WATERMARK */}
      <div className="pointer-events-none fixed inset-0 flex flex-wrap justify-center items-center opacity-[0.06] text-gray-500 text-4xl font-bold tracking-widest">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className="rotate-[-25deg] mx-10 my-6">
            {userName}
          </span>
        ))}
      </div>

      {/* LOADING */}
      {loadingAttempt ? (
        <div className="flex flex-col h-full items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600 font-medium">Menyiapkan sesi tryout...</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex justify-between items-center bg-white shadow rounded-xl px-4 py-3 mb-4 border border-gray-200">
            <div>
              <h1 className="text-xl font-semibold capitalize">
                {tryout.judul}
              </h1>
              <p className="text-gray-500 text-sm">
                {questions.length} Soal • Attempt ke-{attempt?.attempt_ke}
              </p>
            </div>
            {/* MOBILE SMALL BUTTON NAVIGATOR */}
            <button
              onClick={() => setShowNavigator(true)}
              className="
    lg:hidden
    fixed 
    bottom-5
    right-3 
    w-11 
    h-11
    flex 
    items-center 
    justify-center
    rounded-full
    bg-red-500 
    text-white
    shadow-md 
    z-[999]
    active:scale-95 
    transition
  "
            >
              ☰
            </button>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <span
                className={`flex items-center gap-2 px-4 py-1.5 text-lg font-semibold rounded-full shadow 
                ${
                  timeLeft <= 600
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                <FiClock /> {formatTime(timeLeft)}
              </span>

              <button
                onClick={() => setShowCalculator(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                <BsCalculator size={18} />
              </button>

              <button
                onClick={() => {
                  const unanswered =
                    questions.length - Object.keys(answers).length;

                  if (unanswered > 0) {
                    toast.warning(
                      `Masih ada ${unanswered} soal yang belum dijawab!`
                    );
                  }

                  setShowConfirmEndModal(true);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition shadow-sm"
              >
                Selesai
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div
            className="flex h-full gap-4 overflow-hidden 
  max-md:flex-col-reverse max-md:gap-2"
          >
            {/* NAVIGATOR PANEL */}
            <div className="hidden lg:block w-64 bg-white rounded-xl shadow p-4 border border-gray-200 overflow-y-auto max-h-[80vh]">
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                raguRagu={raguRagu}
                setCurrentIndex={setCurrentIndex}
              />
            </div>

            {/* QUESTION CARD */}
            <div className="flex-1 bg-white rounded-xl shadow-md pt-4 px-4 border border-gray-200 overflow-y-auto max-h-[85vh]">
              {/* SOAL */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">Memuat soal...</p>
                </div>
              ) : (
                <>
                  <div className="text-[17px] max-md:text-[16px] max-sm:text-[15px] leading-relaxed mb-5 font-medium flex gap-2">
                    <span>{currentIndex + 1}.</span>
                    <div
                      className="
    whitespace-pre-line
    [&_img]:max-w-full 
    [&_img]:h-auto 
    [&_img]:max-h-[350px]
    [&_img]:object-contain 
    md:[&_img]:max-h-[300px] 
    lg:[&_img]:max-h-[250px]
  "
                      dangerouslySetInnerHTML={{
                        __html: currentQuestion?.pertanyaan,
                      }}
                    />
                  </div>

                  {/* OPTIONS */}
                  <div className="space-y-2">
                    {Object.entries(currentQuestion?.opsi || {}).map(
                      ([key, value]) => (
                        <label
                          key={key}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition  max-sm:p-2 max-sm:text-sm
                        ${
                          answers[currentQuestion?.nomor_urut] === key
                            ? "bg-red-50 border-red-400"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                        }`}
                        >
                          <input
                            type="radio"
                            name={`soal-${currentQuestion?.id_soaltryout}`}
                            value={key}
                            checked={
                              answers[currentQuestion?.nomor_urut] === key
                            }
                            onChange={() =>
                              handleAnswerChange(
                                currentQuestion?.nomor_urut,
                                key
                              )
                            }
                            className="accent-red-500 scale-110"
                          />
                          <span className="font-semibold">{key}.</span>
                          <span>{value}</span>
                        </label>
                      )
                    )}
                  </div>

                  {/* BOTTOM BUTTONS */}
                  <div
                    className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200
  py-2 flex justify-between items-center mt-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]
  max-md:flex-col max-md:gap-3 max-md:text-sm"
                  >
                    {/* RAGU */}
                    <button
                      onClick={() => toggleRaguRagu(currentQuestion.nomor_urut)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        raguRagu.includes(currentQuestion?.nomor_urut)
                          ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <FiHelpCircle />
                      {raguRagu.includes(currentQuestion?.nomor_urut)
                        ? "Hapus Ragu-Ragu"
                        : "Tandai Ragu-Ragu"}
                    </button>

                    <div className="flex gap-1">
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
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      {showCalculator && (
        <CalculatorModal onClose={() => setShowCalculator(false)} />
      )}
      {/* {showExitFullscreenModal && (
        <ExitFullscreenModal
          onContinue={() => {
            containerRef.current?.requestFullscreen().catch(() => {});
            setShowExitFullscreenModal(false);
          }}
          onEnd={handleSubmit}
        />
      )} */}
      {showConfirmEndModal && (
        <ConfirmEndModal
          onCancel={() => setShowConfirmEndModal(false)}
          onConfirm={handleSubmit}
          raguCount={raguRagu.length}
          unanswered={questions.length - Object.keys(answers).length}
        />
      )}

      {isTimeUp && <TimeUpModal onConfirm={handleSubmit} />}
      {showResultModal && (
        <ResultModal
          open={showResultModal}
          nilai={finalScore}
          onClose={() => {
            // if (document.fullscreenElement) {
            //   document.exitFullscreen().catch(() => {});
            // }

            setTimeout(() => {
              setShowResultModal(false);
              onBack();
            }, 300);
          }}
        />
      )}
      {showNavigator && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center lg:hidden z-[999]">
          <div className="bg-white w-[90%] max-h-[80%] rounded-xl p-4 overflow-y-auto shadow-lg">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              raguRagu={raguRagu}
              setCurrentIndex={(val) => {
                setCurrentIndex(val);
                setShowNavigator(false);
              }}
            />

            <button
              onClick={() => setShowNavigator(false)}
              className="mt-4 w-full bg-gray-200 rounded-lg py-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryoutListContent;
