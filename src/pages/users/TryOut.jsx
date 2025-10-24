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

        // 🔹 Ambil remaining attempts untuk setiap tryout
        const updatedList = await Promise.all(
          list.map(async (to) => {
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

  // 🔹 Modal konfirmasi mulai tryout
  const renderModal = () => {
    if (!showModal || !tryoutToStart) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
          <h2 className="text-xl font-semibold mb-3">Mulai Tryout</h2>
          <p className="text-gray-700 mb-4">
            Apakah kamu yakin ingin memulai tryout{" "}
            <span className="font-semibold">{tryoutToStart.judul}</span>? <br />
            Waktu pengerjaan akan dimulai setelah kamu menekan tombol “Mulai”.
          </p>

          {/* 🔹 Info Attempt */}
          {attemptInfo && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p>
                Maksimum Attempt:{" "}
                <span className="font-semibold">{attemptInfo.max_attempt}</span>
              </p>

              <p>
                Sisa Attempt:{" "}
                <span
                  className={`font-semibold ${
                    attemptInfo.remaining_attempts === 0
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  {attemptInfo.remaining_attempts}
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>

            <button
              onClick={handleStartTryout}
              disabled={loadingStart || attemptInfo?.remaining_attempts === 0}
              className={`px-4 py-2 rounded-lg text-white transition ${
                loadingStart
                  ? "bg-red-300"
                  : attemptInfo?.remaining_attempts === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
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
      </div>
    );
  };

  // 🔹 Jika user sudah mulai tryout
  if (selectedTryout) {
    return (
      <TryoutListContent
        tryout={selectedTryout}
        onBack={() => setSelectedTryout(null)}
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
              className="p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition flex items-center justify-between"
              onClick={() => handleSelectTryout(to)}
            >
              {/* Kiri: icon dan info */}
              <div className="flex items-center gap-4">
                <IoBook className="text-red-500 text-xl flex items-center justify-center" />
                <div>
                  <h2 className="text-md font-semibold capitalize">
                    {to.judul}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Jumlah Soal: {to.jumlah_soal}
                  </p>
                  <p className="text-sm text-gray-600">
                    Durasi: {to.durasi} Menit
                  </p>
                  <p className="text-xs text-gray-500">
                    Maks Attempt:{" "}
                    <span className="font-semibold">{to.max_attempt}</span> •
                    Sisa Attempt:{" "}
                    <span
                      className={`font-semibold ${
                        to.remaining_attempts === 0
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {to.remaining_attempts ?? "-"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Kanan: status visibility */}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  to.visibility === "open"
                    ? "bg-green-100 text-green-700"
                    : to.visibility === "hold"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {to.visibility === "open"
                  ? "Open"
                  : to.visibility === "hold"
                  ? "Hold"
                  : "Closed"}
              </span>
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
