import React, { useState, useEffect } from "react";
import { IoBook } from "react-icons/io5";
import TryoutListContent from "./TryOutListContent";
import Api from "../../utils/Api.jsx";

const Tryout = () => {
  const [tryouts, setTryouts] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tryoutToStart, setTryoutToStart] = useState(null);
  const [loadingStart, setLoadingStart] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null); // 🔹 Info attempt per tryout

  // 🔹 Ambil daftar tryout
  useEffect(() => {
    const fetchTryouts = async () => {
      try {
        const response = await Api.get("/tryout/list");
        const list = response.data.data || [];

        // 🔹 Hanya ambil tryout dengan visibility "open"
        const openTryouts = list.filter((to) => to.visibility === "open");

        // 🔹 Ambil remaining attempts untuk setiap tryout open
        const updatedList = await Promise.all(
          openTryouts.map(async (to) => {
            try {
              const res = await Api.get(
                `/tryout/${to.id_tryout}/remaining-attempts`
              );
              return {
                ...to,
                remaining_attempts: res.data.data.remaining_attempts,
              };
            } catch (err) {
              console.error("Gagal mengambil remaining attempts:", err);
              return { ...to, remaining_attempts: null };
            }
          })
        );

        setTryouts(updatedList);
      } catch (error) {
        console.error("Gagal mengambil data tryout:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTryouts();
  }, []);

  // 🔹 Ketika user klik satu tryout → ambil ulang remaining attempt untuk modal
  const handleSelectTryout = async (to) => {
    try {
      const res = await Api.get(`/tryout/${to.id_tryout}/remaining-attempts`);
      setAttemptInfo(res.data.data);
      setTryoutToStart(to);
      setShowModal(true);
    } catch (err) {
      console.error("Gagal memuat remaining attempts:", err);
      alert("Gagal memuat informasi attempt. Coba lagi.");
    }
  };

  // 🔹 Fungsi mulai tryout
  const handleStartTryout = async () => {
    if (!tryoutToStart) return;
    setLoadingStart(true);

    try {
      // 🔹 Jalankan fullscreen di sini
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      const startRes = await Api.post(
        `/tryout/${tryoutToStart.id_tryout}/attempts/start`
      );
      const { attempt_token } = startRes.data.data;

      const detailRes = await Api.get(
        `/tryout/${tryoutToStart.id_tryout}/attempts/${attempt_token}`
      );

      const attemptData = detailRes.data.data;

      setShowModal(false);
      setSelectedTryout({
        ...tryoutToStart,
        attempt: attemptData,
      });
    } catch (error) {
      console.error("Gagal memulai tryout:", error);
      alert("Gagal memulai tryout. Silakan coba lagi.");
    } finally {
      setLoadingStart(false);
    }
  };

  const refreshRemainingAttempts = async () => {
    try {
      const updatedList = await Promise.all(
        tryouts.map(async (to) => {
          try {
            const res = await Api.get(
              `/tryout/${to.id_tryout}/remaining-attempts`
            );
            return {
              ...to,
              remaining_attempts: res.data.data.remaining_attempts,
            };
          } catch {
            return to;
          }
        })
      );

      setTryouts(updatedList);
    } catch (err) {
      console.error("Gagal memperbarui attempt:", err);
    }
  };

  // 🔹 Modal konfirmasi mulai tryout
  const renderModal = () => {
    if (!showModal || !tryoutToStart) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-7 animate-scaleIn">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-full text-xl">
              ⚠️
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Konfirmasi Mulai Tryout
            </h2>
          </div>

          {/* Body */}
          <p className="text-gray-600 leading-relaxed">
            Setelah kamu menekan tombol{" "}
            <span className="font-semibold text-red-600">Mulai</span>, waktu
            pengerjaan akan langsung berjalan dan mode fullscreen aktif.
            Pastikan kamu sudah siap.
          </p>

          <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-600">Judul Tryout:</span>
              <span className="font-semibold">{tryoutToStart.judul}</span>
            </p>

            <p className="flex justify-between">
              <span className="text-gray-600">Jumlah Soal:</span>
              <span className="font-semibold">{tryoutToStart.jumlah_soal}</span>
            </p>

            <p className="flex justify-between">
              <span className="text-gray-600">Durasi:</span>
              <span className="font-semibold">
                {tryoutToStart.durasi} Menit
              </span>
            </p>

            {/* Attempt Info */}
            {attemptInfo && (
              <>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sisa Attempt:</span>
                  <span
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      attemptInfo.remaining_attempts === 0
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {attemptInfo.remaining_attempts}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-5 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 transition font-medium text-gray-700"
            >
              Batal
            </button>

            <button
              onClick={handleStartTryout}
              disabled={loadingStart || attemptInfo?.remaining_attempts === 0}
              className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition active:scale-95 ${
                loadingStart
                  ? "bg-red-300 cursor-not-allowed"
                  : attemptInfo?.remaining_attempts === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loadingStart
                ? "Memulai..."
                : attemptInfo?.remaining_attempts === 0
                ? "Attempt Habis"
                : "Mulai Tryout"}
            </button>
          </div>
        </div>

        {/* Animations */}
        <style>{`
        .animate-fadeIn {
          animation: fadeIn .25s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn .28s ease forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      </div>
    );
  };

  // 🔹 Jika user sudah mulai tryout
  if (selectedTryout) {
    return (
      <TryoutListContent
        tryout={selectedTryout}
        onBack={() => {
          setSelectedTryout(null);
          refreshRemainingAttempts(); // ← panggil refresh
        }}
      />
    );
  }

  // 🔹 Tampilkan daftar tryout
  return (
    <div className="bg-gray-100 w-full h-auto p-6 rounded-[20px] shadow relative">
      <h1 className="text-2xl font-semibold mb-4">Daftar Tryout</h1>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat daftar tryout...</p>
        </div>
      ) : tryouts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Belum ada tryout tersedia.
        </p>
      ) : (
        <div className="space-y-3">
          {tryouts.map((to) => (
            <div
              key={to.id_tryout}
              onClick={() => handleSelectTryout(to)}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="bg-red-100 text-red-600 p-3 rounded-xl text-lg group-hover:bg-red-200 transition">
                  <IoBook />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 capitalize">
                    {to.judul}
                  </h2>

                  <div className="flex items-center gap-3 mt-2">
                    {/* Tag jumlah soal */}
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200">
                      📝 {to.jumlah_soal} Soal
                    </span>

                    {/* Tag durasi */}
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200">
                      ⏳ {to.durasi} Menit
                    </span>
                  </div>

                  {/* Status attempt */}
                  <div className="mt-3 flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      Max Attempt: {to.max_attempt}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        to.remaining_attempts === 0
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Sisa: {to.remaining_attempts ?? "-"}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 text-xl group-hover:text-red-500 transition">
                  ➤
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Konfirmasi */}
      {renderModal()}
    </div>
  );
};

export default Tryout;
