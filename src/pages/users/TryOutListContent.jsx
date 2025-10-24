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
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const containerRef = useRef(null);
  const [showExitFullscreenModal, setShowExitFullscreenModal] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // ambil soal
  useEffect(() => {
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
  }, [tryout]);

  // set durasi
  useEffect(() => {
    if (tryout.durasi) setTimeLeft(tryout.durasi * 60);
  }, [tryout]);

  // timer jalan
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true); // waktu habis → munculkan modal
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleAnswerChange = (id_soal, option) => {
    setAnswers((prev) => ({
      ...prev,
      [id_soal]: option,
    }));
  };

  const toggleRaguRagu = (id_soal) => {
    setRaguRagu((prev) =>
      prev.includes(id_soal)
        ? prev.filter((id) => id !== id_soal)
        : [...prev, id_soal]
    );
  };

  const handleSubmit = () => {
    alert("Tryout selesai! Jawaban sudah disimpan");
    onBack();
  };

  // fullscreen listener
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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-100 z-50 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold capitalize">{tryout.judul}</h1>
          <p className="text-gray-500 text-sm">
            {questions.length} Soal • Durasi: {tryout.durasi} menit
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

      {/* ISI SOAL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat soal...</p>
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center text-gray-600 py-8">
          Belum ada soal tersedia.
        </p>
      ) : (
        <div className="flex gap-4">
          {/* Sidebar navigasi */}
          {questions.length > 0 && (
            <div className="w-full md:w-64">
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                raguRagu={raguRagu}
                setCurrentIndex={setCurrentIndex}
              />
            </div>
          )}

          {/* Konten Soal */}
          <div className="flex-1 bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-lg font-medium mb-4">
              {currentIndex + 1}. {currentQuestion?.pertanyaan}
            </h2>

            <div className="space-y-2">
              {Object.entries(currentQuestion?.opsi || {}).map(
                ([key, value]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                      answers[currentQuestion.id_soaltryout] === key
                        ? "bg-red-50 border-red-400"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`soal-${currentQuestion.id_soaltryout}`}
                      value={key}
                      checked={answers[currentQuestion.id_soaltryout] === key}
                      onChange={() =>
                        handleAnswerChange(currentQuestion.id_soaltryout, key)
                      }
                      className="accent-red-500"
                    />
                    <span className="font-semibold">{key}.</span>
                    <span>{value}</span>
                  </label>
                )
              )}
            </div>

            {/* Tombol Ragu-Ragu + Navigasi */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => toggleRaguRagu(currentQuestion.id_soaltryout)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  raguRagu.includes(currentQuestion.id_soaltryout)
                    ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <FiHelpCircle />
                {raguRagu.includes(currentQuestion.id_soaltryout)
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
          onTimeout={handleSubmit}
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
