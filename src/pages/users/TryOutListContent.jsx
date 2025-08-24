// src/pages/users/TryOutListContent.jsx
import React, { useEffect, useState } from "react";

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

const TryoutListContent = ({ tryout, onBack }) => {
  const [selectedTryOut, setSelectedTryOut] = useState(tryout);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [answers, setAnswers] = useState(
    Array(dummyQuestions.length).fill(null)
  );
  const [doubts, setDoubts] = useState(
    Array(dummyQuestions.length).fill(false)
  );
  const [showResult, setShowResult] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDoubtWarning, setShowDoubtWarning] = useState(false);
  const [timer, setTimer] = useState(60 * 10); // 10 menit
  const [intervalId, setIntervalId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Kalkulator state ---
  const [showCalculator, setShowCalculator] = useState(false);
  const [input, setInput] = useState("");
  const [calcPos, setCalcPos] = useState({
    x: window.innerWidth / 2 - 150,
    y: 100,
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [calcSize, setCalcSize] = useState(300);

  const buttons = [
    ["sin", "cos", "tan", "π"],
    ["log", "ln", "√", "e"],
    ["(", ")", "^", "%"],
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "C", "+"],
    ["⌫", "="],
  ];

  const handlePress = (value) => {
    if (value === "C") {
      setInput("");
    } else if (value === "⌫") {
      setInput(input.slice(0, -1));
    } else if (value === "=") {
      try {
        let expression = input
          .replace(/π/g, Math.PI)
          .replace(/e/g, Math.E)
          .replace(/√/g, "Math.sqrt")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/log/g, "Math.log10")
          .replace(/ln/g, "Math.log")
          .replace(/\^/g, "**")
          .replace(/×/g, "*")
          .replace(/÷/g, "/");
        setInput(eval(expression).toString());
      } catch {
        setInput("Error");
      }
    } else {
      setInput(input + value);
    }
  };

  // --- Drag + Resize handler ---
  const handleMouseDown = (e) => {
    if (e.target.dataset.resize) {
      setResizing(true);
    } else {
      setDragging(true);
      setOffset({
        x: e.clientX - calcPos.x,
        y: e.clientY - calcPos.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setCalcPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
    if (resizing) {
      setCalcSize(Math.max(250, e.clientX - calcPos.x));
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  // --- Fullscreen detect ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(!!fsElement);
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

  // Timer countdown
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
    if (!selectedTryOut || showResult) {
      setTimer(60 * 10);
      if (intervalId) clearInterval(intervalId);
    }
  }, [selectedTryOut, isFullscreen, showResult]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (idx) => {
    const newAnswers = [...answers];
    newAnswers[currentNumber] = idx;
    setAnswers(newAnswers);
  };

  const toggleDoubt = (idx) => {
    const newDoubts = [...doubts];
    newDoubts[idx] = !newDoubts[idx];
    setDoubts(newDoubts);
  };

  const handleFinish = () => {
    if (doubts.some(Boolean)) {
      setShowDoubtWarning(true);
      return;
    }
    setShowResult(true);
  };

  return (
    <div className="p-2 relative">
      <h2 className="text-2xl font-semibold mb-4">{tryout?.title}</h2>

      {/* Modal Tryout Fullscreen */}
      {selectedTryOut && (
        <div
          ref={(el) => {
            if (el && !isFullscreen) openFullscreen(el);
          }}
          className="fixed inset-0 bg-gradient-to-r from-[#a11d1d] to-[#531d1d] z-[9999] flex items-center justify-center"
          tabIndex={-1}
          onContextMenu={(e) => e.preventDefault()}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Map Soal (kembali) */}
          <div className="absolute top-6 left-8 z-50 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center">
            <div className="font-semibold mb-2 text-gray-700 text-sm">
              Dafar Soal
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
                </button>
              ))}
            </div>
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

          {/* Tombol Kalkulator */}
          <button
            className="absolute top-4 right-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 z-[100000]"
            onClick={() => setShowCalculator(true)}
          >
            Kalkulator
          </button>

          {/* KONTEN UJIAN */}
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg relative select-none">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className={`h-3 transition-all duration-500 ${
                  timer <= 300 ? "bg-red-600" : "bg-blue-500"
                }`}
                style={{ width: `${(timer / (60 * 10)) * 100}%` }}
              ></div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedTryOut.title}
              </h3>
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
                <div className="mb-4 text-lg font-medium">
                  {currentNumber + 1}. {dummyQuestions[currentNumber].question}
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
                    setDoubts(Array(dummyQuestions.length).fill(false));
                    onBack();
                  }}
                >
                  Tutup
                </button>
              </div>
            )}
          </div>

          {/* Kalkulator */}
          {showCalculator && (
            <div
              className="absolute inset-0 bg-transparent z-[99999]"
              onClick={() => setShowCalculator(false)}
            >
              <div
                style={{ left: calcPos.x, top: calcPos.y, width: calcSize }}
                className="absolute bg-gray-900 rounded-2xl p-4 shadow-xl cursor-move"
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-black text-green-400 text-xl p-3 rounded mb-4 text-right min-h-[50px] font-mono">
                  {input || "0"}
                </div>
                {buttons.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    {row.map((btn) => (
                      <button
                        key={btn}
                        onClick={() => handlePress(btn)}
                        className={`p-3 rounded font-bold text-white ${
                          btn === "="
                            ? "bg-green-600"
                            : btn === "C"
                            ? "bg-red-600"
                            : btn === "⌫"
                            ? "bg-orange-500"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                ))}
                {/* Resize handle */}
                <div
                  data-resize
                  onMouseDown={handleMouseDown}
                  className="absolute bottom-2 right-2 w-4 h-4 bg-gray-500 cursor-se-resize rounded"
                />
              </div>
            </div>
          )}

          {/* Modal keluar fullscreen */}
          {showExitModal && !showResult && (
            <div className="absolute inset-0 bg-black bg-opacity-60 z-[99999] flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
                <div className="text-lg font-semibold mb-4 text-red-600">
                  Anda keluar dari mode fullscreen!
                </div>
                <div className="mb-6 text-gray-700">
                  Untuk melanjutkan ujian, silakan kembali ke fullscreen atau
                  akhiri ujian.
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
                      setDoubts(Array(dummyQuestions.length).fill(false));
                      onBack();
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
            <div className="absolute inset-0 bg-black bg-opacity-60 z-[1000000] flex items-center justify-center">
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
      )}
    </div>
  );
};

export default TryoutListContent;
