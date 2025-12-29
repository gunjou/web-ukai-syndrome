import React, { useEffect, useState } from "react";
import Api from "../../utils/Api.jsx";
import QuestionNavigator from "./components/QuestionNavigatorReview.jsx";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const TryoutResultDetail = ({ idHasilTryout, onBack }) => {
  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await Api.get(`/hasil-tryout/peserta/${idHasilTryout}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Gagal ambil hasil tryout", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [idHasilTryout]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const soal = data.detail_soal[currentIndex];

  // Normalisasi jawaban uppercase
  const userAnswer = soal.jawaban_user?.toUpperCase();
  const correctAnswer = soal.jawaban_benar?.toUpperCase();
  const isCorrect = userAnswer === correctAnswer;

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-gray-800 rounded-[20px] p-4 md:p-6 flex flex-col">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 mb-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold dark:text-gray-100">
            {data.judul_tryout}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nilai: <b>{data.nilai}</b> • Attempt ke-{data.attempt_ke}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm dark:text-gray-200"
        >
          Kembali
        </button>
      </div>

      <div className="flex gap-4 max-md:flex-col-reverse flex-1 overflow-hidden">
        {/* NAVIGATOR */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow p-3 border dark:border-gray-700 max-md:w-full h-full overflow-y-auto">
          <QuestionNavigator
            questions={data.detail_soal.map((s) => ({
              jawaban_user: s.jawaban_user,
              jawaban_benar: s.jawaban_benar,
            }))}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </div>

        {/* SOAL */}
        <div className="flex-1 bg-white rounded-xl shadow p-3 border dark:bg-gray-800 dark:border-gray-700 overflow-y-auto h-full">
          {/* PERTANYAAN */}
          <div className="text-base font-medium dark:text-gray-100 mb-3 flex gap-2">
            <span>{soal.nomor}.</span>
            <div
              dangerouslySetInnerHTML={{ __html: soal.pertanyaan }}
              className="
                [&_img]:max-w-[70%]
                [&_img]:h-auto
                [&_img]:rounded-lg
                [&_img]:my-2
                dark:[&_p]:text-gray-200
                dark:[&_img]:brightness-90
              "
            />
          </div>

          {/* PILIHAN */}
          <div className="space-y-1.5 text-sm dark:text-gray-200 dark:[&_div]:bg-gray-700">
            {Object.entries(soal.pilihan).map(([key, val]) => {
              const isUser = userAnswer === key;
              const isCorrectOption = correctAnswer === key;

              return (
                <div
                  key={key}
                  className={`p-2 rounded-lg border flex items-center gap-2
                    ${
                      isCorrectOption
                        ? "bg-green-50 border-green-400 dark:bg-green-900 dark:border-green-800"
                        : isUser
                        ? "bg-red-50 border-red-400 dark:bg-red-900 dark:border-red-800"
                        : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                >
                  <span className="font-semibold">{key}.</span>
                  <span className="flex-1">{val}</span>

                  {isCorrectOption && (
                    <FiCheckCircle className="text-green-600" />
                  )}
                  {isUser && !isCorrectOption && (
                    <FiXCircle className="text-red-600" />
                  )}
                </div>
              );
            })}
          </div>

          {/* STATUS */}
          <div className="mt-3">
            {userAnswer ? (
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold
        ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
      `}
              >
                {isCorrect ? "Jawaban Benar" : "Jawaban Salah"}
              </span>
            ) : (
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-red-200 text-red-700">
                Jawaban Salah (Tidak Dijawab)
              </span>
            )}
          </div>

          {/* PEMBAHASAN */}
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <h3 className="font-semibold mb-1.5">Pembahasan</h3>
            <div
              className="text-gray-700 [&_p]:mb-1.5 [&_img]:max-w-[70%] [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2"
              dangerouslySetInnerHTML={{ __html: soal.pembahasan }}
            />
          </div>

          {/* NAVIGATION */}
          <div className="flex justify-between mt-5">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((p) => p - 1)}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-lg disabled:opacity-50 text-sm"
            >
              Sebelumnya
            </button>

            {currentIndex === data.detail_soal.length - 1 ? (
              <button
                onClick={onBack}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
              >
                Selesai
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((p) => p + 1)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg disabled:opacity-50 text-sm"
              >
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryoutResultDetail;
