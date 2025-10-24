import React from "react";
import { FiHelpCircle } from "react-icons/fi";

const QuestionNavigator = ({
  questions,
  currentIndex,
  answers,
  raguRagu,
  setCurrentIndex,
}) => {
  return (
    <div className="flex flex-wrap gap-2 w-full justify-center">
      {questions.map((q, i) => {
        const isAnswered = !!answers[q.id_soaltryout];
        const isRagu = raguRagu.includes(q.id_soaltryout);
        const isActive = i === currentIndex;

        let btnClass =
          "w-10 h-10 rounded-full border text-sm font-semibold flex items-center justify-center transition";

        if (isActive) btnClass += " bg-red-500 text-white border-red-500";
        else if (isRagu)
          btnClass += " bg-yellow-200 border-yellow-500 text-yellow-700";
        else if (isAnswered)
          btnClass += " bg-green-100 border-green-400 text-green-600";
        else
          btnClass +=
            " bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";

        return (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)} // klik soal hanya pindah, tidak submit
            className={btnClass}
            title={`Soal ${i + 1}`}
          >
            {i + 1}
            {isRagu && (
              <FiHelpCircle className="text-yellow-600 w-3 h-3 absolute -top-1 -right-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionNavigator;
