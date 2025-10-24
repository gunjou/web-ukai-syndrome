import React from "react";

const ResultScreen = ({ answers, questions, onClose }) => {
  const score = answers.filter(
    (ans, idx) => ans === questions[idx].answer
  ).length;

  return (
    <div className="text-center py-8">
      <div className="text-2xl font-bold mb-4 text-green-600">
        Ujian Selesai!
      </div>
      <div className="mb-2">
        Skor kamu: <span className="font-bold">{score}</span> /{" "}
        {questions.length}
      </div>
      <button
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
        onClick={onClose}
      >
        Tutup
      </button>
    </div>
  );
};

export default ResultScreen;
