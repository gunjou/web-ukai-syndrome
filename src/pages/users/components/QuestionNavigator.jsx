import React from "react";
import { FiHelpCircle } from "react-icons/fi";

const QuestionNavigator = ({
  questions,
  currentIndex,
  answers,
  raguRagu,
  answerStatus, // ⬅️ status: saved | pending | failed
  setCurrentIndex,
}) => {
  return (
    <div className="flex flex-wrap gap-2 w-full justify-center">
      {questions.map((q, i) => {
        const nomor = q.nomor_urut;

        const isAnswered = !!answers[nomor];
        const isRagu = raguRagu.includes(nomor);
        const isActive = i === currentIndex;
        const isFailed = answerStatus?.[nomor] === "failed";

        let btnClass =
          "relative w-10 h-10 rounded-full border text-sm font-semibold flex items-center justify-center transition";

        // PRIORITAS WARNA
        if (isFailed) {
          btnClass += " bg-red-100 border-red-500 text-red-700 animate-pulse";
        } else if (isActive) {
          btnClass +=
            " bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300";
        } else if (isRagu) {
          btnClass += " bg-yellow-200 border-yellow-500 text-yellow-700";
        } else if (isAnswered) {
          btnClass += " bg-green-100 border-green-400 text-green-600";
        } else {
          btnClass +=
            " bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
        }

        return (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={btnClass}
            title={`Soal ${i + 1}`}
          >
            {i + 1}

            {/* IKON GAGAL TERKIRIM */}
            {isFailed && (
              <span
                className="
                  absolute -top-1 -right-1
                  w-4 h-4 rounded-full
                  bg-red-500 text-white
                  text-[10px] font-bold
                  flex items-center justify-center
                "
                title="Jawaban belum tersimpan"
              >
                !
              </span>
            )}

            {/* IKON RAGU-RAGU (tidak tampil jika gagal) */}
            {isRagu && !isFailed && (
              <FiHelpCircle
                className="
                  absolute -top-1 -right-1
                  w-3 h-3 text-yellow-600
                "
                title="Ditandai ragu-ragu"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionNavigator;
