import React from "react";

const QuestionNavigatorReview = ({
  questions,
  currentIndex,
  setCurrentIndex,
}) => {
  return (
    <div className="flex flex-wrap gap-2 w-full justify-center overflow-y-auto max-h-96">
      {questions.map((q, i) => {
        const isActive = i === currentIndex;
        const userAnswer = q.jawaban_user?.toUpperCase();
        const correctAnswer = q.jawaban_benar?.toUpperCase();
        const isCorrect = userAnswer === correctAnswer;

        let btnClass =
          "w-10 h-10 max-w-xs rounded-full border text-sm font-semibold flex items-center justify-center transition ";

        if (isActive) {
          btnClass += " bg-blue-500 text-white border-blue-500 cursor-default";
        } else if (isCorrect) {
          btnClass +=
            " bg-green-50 border-green-400 text-green-600 hover:bg-green-100 hover:border-green-500";
        } else {
          btnClass +=
            " bg-red-50 border-red-400 text-red-600 hover:bg-red-100 hover:border-red-500";
        }

        return (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={btnClass}
            title={`Soal ${i + 1}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionNavigatorReview;
