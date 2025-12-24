import React, { useState, useEffect } from "react";
import {
  IoBookOutline,
  IoChevronForwardOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoFilterCircleOutline,
  IoPlayCircleOutline,
} from "react-icons/io5";

import TryoutListContent from "./TryOutListContent";
import Api from "../../utils/Api.jsx";
import { toast } from "react-toastify";

const formatTanggalIndo = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// const getTryoutStatus = (to) => {
//   if (!to.access_start_at || !to.access_end_at) return "unknown";

//   const now = new Date();
//   const start = new Date(to.access_start_at);
//   const end = new Date(to.access_end_at);

//   if (now >= start && now <= end) return "ongoing";
//   return "not_started";
// };

const getTryoutStatus = (to) => {
  // sementara: null = boleh diakses
  if (!to.access_start_at || !to.access_end_at) return "ongoing";

  const now = new Date();

  const start = new Date(to.access_start_at);
  start.setHours(0, 0, 0, 0); // awal hari

  const end = new Date(to.access_end_at);
  end.setHours(23, 59, 59, 999); // akhir hari

  if (now >= start && now <= end) return "ongoing";
  if (now < start) return "not_started";
  return "ended";
};

const Tryout = () => {
  const [tryouts, setTryouts] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tryoutToStart, setTryoutToStart] = useState(null);
  const [loadingStart, setLoadingStart] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [filter, setFilter] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const fetchTryouts = async () => {
      try {
        const response = await Api.get("/tryout/list");
        const list = response.data.data || [];

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
            } catch {
              return { ...to, remaining_attempts: null };
            }
          })
        );

        setTryouts(updatedList);
      } catch {
        console.error("Gagal mengambil data tryout");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTryouts();
  }, []);

  const handleSelectTryout = async (to) => {
    const status = getTryoutStatus(to);

    // if (status !== "ongoing") {
    //   toast.warning(
    //     `Tryout ini belum berlangsung.\n\n` +
    //       `Mulai: ${formatTanggalIndo(to.access_start_at)}\n` +
    //       `Selesai: ${formatTanggalIndo(to.access_end_at)}`,
    //     { autoClose: 5000 }
    //   );
    //   return;
    // }

    if (status === "not_started") {
      toast.warning(
        `Tryout belum berlangsung.\nMulai: ${formatTanggalIndo(
          to.access_start_at
        )}`,
        {
          style: {
            whiteSpace: "pre-line",
          },
        }
      );
      return;
    }

    if (status === "ended") {
      toast.error("Tryout ini sudah berakhir.");
      return;
    }

    try {
      const res = await Api.get(`/tryout/${to.id_tryout}/remaining-attempts`);
      setAttemptInfo(res.data.data);
      setTryoutToStart(to);
      setShowModal(true);
    } catch {
      toast.error("Gagal memuat data attempt.");
    }
  };

  const handleStartTryout = async () => {
    if (!tryoutToStart) return;
    setLoadingStart(true);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      const startRes = await Api.post(
        `/tryout/${tryoutToStart.id_tryout}/attempts/start`
      );
      const attemptData = startRes.data.data;

      toast.success(
        startRes.status === 201
          ? "Attempt baru dimulai."
          : "Melanjutkan attempt aktif.",
        { autoClose: 6000 }
      );

      const detailRes = await Api.get(
        `/tryout/${tryoutToStart.id_tryout}/attempts/${attemptData.attempt_token}`
      );

      setShowModal(false);
      setSelectedTryout({ ...tryoutToStart, attempt: detailRes.data.data });
    } catch {
      alert("Gagal memulai tryout.");
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
    } catch {}
  };

  const renderFilterModal = () => {
    if (!showFilterModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Filter Tryout
            </h2>
            <button onClick={() => setShowFilterModal(false)}>
              <IoCloseCircleOutline
                size={26}
                className="text-gray-500 hover:text-black"
              />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-xl p-2">
            {tryouts.map((to) => (
              <button
                key={to.id_tryout}
                onClick={() => {
                  setFilter(to.judul);
                  setShowFilterModal(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm mb-1 transition ${
                  filter === to.judul
                    ? "bg-black text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {to.judul}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setFilter("");
                setShowFilterModal(false);
              }}
              className="px-4 py-2 border bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-full text-xl">
              ⚠️
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Konfirmasi Mulai Tryout
            </h2>
          </div>

          <p className="text-gray-600">
            Menekan <span className="text-red-600 font-semibold">Mulai</span>{" "}
            berarti Anda menyetujui untuk memulai tryout, dan waktu pengerjaan
            akan berjalan secara otomatis.
          </p>

          <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
            <span className="text-lg">ℹ️</span>
            <p>
              Jika kamu masih memiliki{" "}
              <strong>attempt yang sedang berlangsung</strong>, maka sistem akan{" "}
              <strong>melanjutkan attempt tersebut</strong> dan
              <strong> tidak membuat attempt baru</strong>.
            </p>
          </div>

          {attemptInfo && (
            <div className="mt-4 bg-gray-50 border p-4 rounded-xl text-sm space-y-2">
              <p className="flex justify-between">
                <span>Sisa Attempt:</span>
                <span
                  className={`px-3 py-1 rounded-lg ${
                    attemptInfo.remaining_attempts === 0
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {attemptInfo.remaining_attempts}
                </span>
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-5 py-2 border bg-gray-100 rounded-lg"
            >
              Batal
            </button>

            <button
              onClick={handleStartTryout}
              disabled={loadingStart || attemptInfo?.remaining_attempts === 0}
              className={`px-5 py-2 rounded-lg text-white ${
                attemptInfo?.remaining_attempts === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loadingStart ? "Memulai..." : "Mulai Tryout"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredTryouts = filter
    ? tryouts.filter((to) =>
        to.judul.toLowerCase().includes(filter.toLowerCase())
      )
    : tryouts;

  if (selectedTryout) {
    return (
      <TryoutListContent
        tryout={selectedTryout}
        onBack={() => {
          setSelectedTryout(null);
          refreshRemainingAttempts();
        }}
      />
    );
  }

  return (
    <div className="bg-white w-full h-auto h-p-6">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Tryout
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Daftar Tryout yang tersedia untuk anda.
            </p>
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white hover:bg-gray-200"
          >
            <IoFilterCircleOutline /> Filter
          </button>
        </div>

        {filter && (
          <div className="mb-4 bg-black text-white px-4 py-2 rounded-lg w-fit flex items-center gap-3">
            Filter: {filter}
            <button
              onClick={() => setFilter("")}
              className="bg-white text-black rounded-md px-2 py-1 text-sm"
            >
              Reset
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-gray-500 py-10">Memuat...</p>
        ) : filteredTryouts.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Tidak ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTryouts.map((to) => (
              <div
                key={to.id_tryout}
                onClick={() => handleSelectTryout(to)}
                className={`bg-white p-5 rounded-xl shadow-sm transition ${
                  getTryoutStatus(to) === "ongoing"
                    ? "hover:shadow-md hover:-translate-y-1 cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <h2 className="font-semibold text-lg mb-2">{to.judul}</h2>
                {(() => {
                  const status = getTryoutStatus(to);
                  return (
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${
                        status === "ongoing"
                          ? "bg-green-100 text-green-700"
                          : status === "not_started"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {/* {status === "ongoing"
                        ? "Berlangsung"
                        : "Belum Berlangsung"} */}
                      {status === "ongoing"
                        ? "Sedang Berlangsung"
                        : status === "not_started"
                        ? "Belum Dimulai"
                        : "Sudah Berakhir"}
                    </span>
                  );
                })()}

                <div className="flex items-center gap-2">
                  <IoBookOutline className="text-gray-500" />
                  <span>{to.jumlah_soal} Soal</span>
                </div>

                <div className="flex items-center gap-2">
                  <IoTimeOutline className="text-gray-500" />
                  <span>Durasi: {to.durasi} menit</span>
                </div>

                <div className="flex items-center gap-2">
                  <IoPlayCircleOutline className="text-gray-400" />
                  <span>
                    Mulai:{" "}
                    <strong>{formatTanggalIndo(to.access_start_at)}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <IoPlayCircleOutline className="text-gray-400" />
                  <span>
                    Selesai:{" "}
                    <strong>{formatTanggalIndo(to.access_end_at)}</strong>
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-500 text-sm">
                    Attempt: {to.max_attempt}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      to.remaining_attempts === 0
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {to.remaining_attempts} tersisa
                  </span>
                </div>

                <div className="mt-4 flex justify-end">
                  <IoChevronForwardOutline className="text-gray-400 text-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {renderModal()}
        {renderFilterModal()}
      </div>
    </div>
  );
};

export default Tryout;
