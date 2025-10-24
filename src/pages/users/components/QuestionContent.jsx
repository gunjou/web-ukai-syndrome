import React from "react";

const QuestionContent = ({
  question,
  index,
  total,
  answer,
  onAnswerChange,
  onNext,
  onPrev,
  onSubmit,
  isLast,
  isFirst,
}) => {
  if (!question) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
      <h2 className="text-lg font-medium mb-4">
        {index + 1}. {question.pertanyaan}
      </h2>

      <div className="space-y-2">
        {Object.entries(question.opsi || {}).map(([key, value]) => (
          <label
            key={key}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
              answer === key
                ? "bg-red-50 border-red-400"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
            }`}
          >
            <input
              type="radio"
              name={`soal-${question.id_soaltryout}`}
              value={key}
              checked={answer === key}
              onChange={() => onAnswerChange(question.id_soaltryout, key)}
              className="accent-red-500"
            />
            <span className="font-semibold">{key}.</span>
            <span>{value}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          disabled={isFirst}
          onClick={onPrev}
          className={`px-4 py-2 rounded-lg transition ${
            isFirst
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Sebelumnya
        </button>

        {isLast ? (
          <button
            onClick={onSubmit}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
          >
            Selesai Tryout
          </button>
        ) : (
          <button
            onClick={onNext}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
          >
            Selanjutnya
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionContent;
