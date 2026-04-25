import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import Header from "../../components/admin/Header.jsx";
import { AiOutlinePlus, AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";

import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import TambahTryoutModal from "./modal/TambahTryoutModal.jsx";
import Api, { CDN_ASSET_URL } from "../../utils/Api.jsx";
import LihatSoalModal from "./modal/LihatSoalModal.jsx";
import EditTryoutModal from "./modal/EditTryoutModal.jsx";

const makeUTCFromWIB = (date, time = "00:00") => {
  // WIB = UTC+7 → convert ke UTC
  return new Date(`${date}T${time}:00+07:00`);
};

const formatTanggalJamWIB = (date, time) => {
  if (!date) return "-";

  const d = new Date(`${date}T${time || "00:00"}:00+07:00`);

  return (
    d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB"
  );
};

const TryoutPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tryoutData, setTryoutData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PAGINATION & META ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [limit, setLimit] = useState(20);

  // --- MODAL STATES ---
  const [showAddTryoutModal, setShowAddTryoutModal] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [selectedTryoutForQuestions, setSelectedTryoutForQuestions] =
    useState(null);

  // --- KELAS MODAL STATES ---
  const [kelasModalData, setKelasModalData] = useState(null); // Menyimpan info tryout yang dipilih
  const [listKelasTryout, setListKelasTryout] = useState([]); // Menyimpan data dari endpoint /tryout/{id}/kelas
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [searchKelas, setSearchKelas] = useState("");

  // 1. Fungsi Fetch Utama
  const fetchTryoutData = useCallback(
    async (page = 1, search = "", currentLimit = 20) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", currentLimit);
        if (search.trim()) params.append("search", search);

        const response = await Api.get(
          `/tryout/all-tryout?${params.toString()}`,
        );
        const result = response.data;

        setTryoutData(result.data || []);
        setTotalData(result.meta?.total || 0);
        setTotalPage(result.meta?.total_page || 1);
      } catch (error) {
        toast.error("Gagal memuat data tryout");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 2. Debounce Search
  const debouncedFetch = useRef(
    debounce((nextSearch, nextLimit) => {
      fetchTryoutData(1, nextSearch, nextLimit);
    }, 500),
  ).current;

  useEffect(() => {
    setCurrentPage(1);
    debouncedFetch(searchTerm, limit);
    return () => debouncedFetch.cancel();
  }, [searchTerm, limit, debouncedFetch]);

  // 3. Fetch Detail Kelas saat tombol diklik
  const handleOpenKelasModal = async (tryout) => {
    setKelasModalData(tryout);
    setListKelasTryout([]);
    setIsLoadingKelas(true);
    try {
      const res = await Api.get(`/tryout/${tryout.id_tryout}/kelas`);
      setListKelasTryout(res.data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil daftar kelas");
    } finally {
      setIsLoadingKelas(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setCurrentPage(newPage);
      fetchTryoutData(newPage, searchTerm, limit);
    }
  };

  // === DELETE TRYOUT ===
  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus tryout ini?", async () => {
      await Api.delete(`/tryout/delete/${id}`);
      toast.success("Tryout berhasil dihapus.");
      fetchTryoutData();
    });
  };

  // === UBAH STATUS VISIBILITY ===
  const [updatingId, setUpdatingId] = useState(null);

  const handleVisibilityChange = async (id_tryout, newStatus) => {
    // 1. Tampilkan konfirmasi (Opsional tapi disarankan agar tidak salah klik)
    const confirm = window.confirm(`Ubah status menjadi ${newStatus}?`);
    if (!confirm) return;

    setUpdatingId(id_tryout);
    try {
      await Api.put(`/tryout/${id_tryout}/visibility`, {
        visibility: newStatus,
      });

      toast.success("Status diperbarui");

      // 2. Update state lokal
      setTryoutData((prev) =>
        prev.map((t) =>
          t.id_tryout === id_tryout ? { ...t, visibility: newStatus } : t,
        ),
      );
    } catch (error) {
      toast.error("Gagal mengubah status");
    } finally {
      setUpdatingId(null);
    }
  };

  // === AUTO VISIBILITY BERDASARKAN WAKTU ===
  const autoUpdateVisibility = async () => {
    if (!tryoutData.length) return;

    const nowUTC = new Date(); // ⬅️ UTC REAL TIME

    for (const t of tryoutData) {
      if (!t.access_start_at_date || !t.access_end_at_date) continue;

      const startUTC = makeUTCFromWIB(
        t.access_start_at_date,
        t.access_start_at_time,
      );

      const endUTC = makeUTCFromWIB(
        t.access_end_at_date,
        t.access_end_at_time || "23:59",
      );

      const expectedStatus =
        nowUTC >= startUTC && nowUTC <= endUTC ? "open" : "hold";

      if (t.visibility !== expectedStatus) {
        try {
          await Api.put(`/tryout/${t.id_tryout}/visibility`, {
            visibility: expectedStatus,
          });

          setTryoutData((prev) =>
            prev.map((x) =>
              x.id_tryout === t.id_tryout
                ? { ...x, visibility: expectedStatus }
                : x,
            ),
          );

          console.log(
            `[AUTO] ${t.judul}`,
            "\nnowUTC :",
            nowUTC.toISOString(),
            "\nstart :",
            startUTC.toISOString(),
            "\nend   :",
            endUTC.toISOString(),
            "\n→",
            expectedStatus,
          );
        } catch (err) {
          console.error("Auto visibility gagal:", err);
        }
      }
    }
  };

  // Gunakan ref untuk mencegah loop atau pengecekan berlebih saat baru update manual
  const isAutoChecking = useRef(false);

  useEffect(() => {
    if (!isLoading && tryoutData.length && !isAutoChecking.current) {
      // Jalankan auto update hanya sekali di awal atau via interval
      autoUpdateVisibility();

      const interval = setInterval(() => {
        autoUpdateVisibility();
      }, 60000);

      return () => clearInterval(interval);
    }
    // HAPUS tryoutData dari dependency array ini agar tidak trigger terus menerus
    // saat Anda update status manual
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // === RENDER TABEL ===
  const renderTableRows = () =>
    tryoutData.map((t, index) => (
      <tr
        key={t.id_tryout}
        className="bg-gray-100 hover:bg-gray-200 transition text-xs sm:text-sm"
      >
        <td className="px-2 py-3 text-center border">
          {(currentPage - 1) * limit + (index + 1)}
        </td>
        <td className="px-4 py-3 border font-semibold text-gray-800">
          {t.judul}
        </td>
        <td className="px-4 py-3 border text-center font-bold text-blue-600">
          {t.jumlah_soal}
        </td>
        <td className="px-4 py-3 border text-center">{t.durasi} mnt</td>
        <td className="px-4 py-3 border text-center">{t.max_attempt}x</td>
        <td className="px-4 py-3 border text-center">
          <button
            onClick={() => handleOpenKelasModal(t)}
            className="group flex items-center justify-center gap-2 mx-auto bg-white border border-blue-500 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <span className="font-bold text-xs">{t.total_kelas || 0}</span>
            <span className="text-[10px] uppercase font-medium">Kelas</span>
          </button>
        </td>
        <td className="px-2 py-3 border text-center text-[10px] leading-tight">
          <div className="font-bold text-green-600">Start:</div>
          {formatTanggalJamWIB(t.access_start_at_date, t.access_start_at_time)}
        </td>
        <td className="px-2 py-3 border text-center text-[10px] leading-tight">
          <div className="font-bold text-red-600">End:</div>
          {formatTanggalJamWIB(t.access_end_at_date, t.access_end_at_time)}
        </td>
        <td className="px-4 py-3 border text-center">
          <select
            value={t.visibility || "hold"}
            disabled={updatingId === t.id_tryout} // Tambahkan ini
            onChange={(e) =>
              handleVisibilityChange(t.id_tryout, e.target.value)
            }
            className={`font-bold rounded-md px-2 py-1 text-xs border focus:outline-none capitalize
    ${updatingId === t.id_tryout ? "opacity-50 cursor-not-allowed" : ""}
    ${t.visibility === "open" ? "text-green-600 bg-green-50 border-green-200" : "text-yellow-600 bg-yellow-50 border-yellow-200"}
  `}
          >
            <option value="open">Open</option>
            <option value="hold">Hold</option>
          </select>
        </td>
        <td className="px-4 py-3 border text-center">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setSelectedTryoutForQuestions(t)}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
            >
              <AiOutlineEye size={16} />
            </button>
            <button
              onClick={() => setSelectedTryout(t)}
              className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm"
            >
              <LuPencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(t.id_tryout)}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-sm"
            >
              <BsTrash3 size={14} />
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      {/* Background Pattern */}
      {/* <img
        src={`${CDN_ASSET_URL}/garis-kanan.png`}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto opacity-40 z-0"
        alt=""
      />
      <img
        src={`${CDN_ASSET_URL}/garis-kanan.png`}
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 transform z-0"
        alt=""
      /> */}

      <Header />

      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        {/* Header Atas */}
        <div className="grid grid-cols-3 items-center py-2 px-8 gap-4">
          {/* Kolom kiri */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tryout..."
              className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">Daftar Tryout</h1>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddTryoutModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md"
            >
              <AiOutlinePlus /> Tambah Tryout
            </button>
          </div>
        </div>

        {/* Tabel */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[66vh]">
              <table className="min-w-full bg-white border-collapse">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-[10px] uppercase text-gray-600 tracking-widest font-extrabold">
                    <th className="px-2 py-4">No</th>
                    <th className="px-4 py-4 text-left">Judul Tryout</th>
                    <th className="px-4 py-4">Soal</th>
                    <th className="px-4 py-4">Durasi</th>
                    <th className="px-4 py-4">Limit</th>
                    <th className="px-4 py-4">Total Kelas</th>
                    <th className="px-4 py-4">Mulai Akses</th>
                    <th className="px-4 py-4">Selesai Akses</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-4 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            </div>

            {/* --- PAGINATION CONTROL --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-8 mt-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-lg bg-gray-50 text-xs font-bold">
                  <span className="text-gray-400">LIMIT:</span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-transparent text-blue-600 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <p className="text-[11px] font-bold text-gray-500">
                  Total: <span className="text-red-600">{totalData}</span> Data
                  | Hal <span className="text-red-600">{currentPage}</span> /{" "}
                  {totalPage}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border border-red-500 text-red-500 hover:bg-red-50 shadow-sm"}`}
                >
                  Previous
                </button>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage === totalPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${currentPage === totalPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border border-red-500 text-red-500 hover:bg-red-50 shadow-sm"}`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah Tryout */}
      {showAddTryoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowAddTryoutModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddTryoutModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            <TambahTryoutModal
              onClose={() => setShowAddTryoutModal(false)}
              onRefresh={fetchTryoutData}
            />
          </div>
        </div>
      )}
      {/* Modal Lihat Soal */}
      {selectedTryoutForQuestions && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setSelectedTryoutForQuestions(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[95%] max-w-4xl p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <LihatSoalModal
              tryout={selectedTryoutForQuestions}
              onClose={() => setSelectedTryoutForQuestions(null)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Tryout */}
      {selectedTryout && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setSelectedTryout(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[95%] max-w-4xl p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <EditTryoutModal
              data={selectedTryout}
              onClose={() => setSelectedTryout(null)}
              onRefresh={fetchTryoutData}
            />
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL KELAS --- */}
      {kelasModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setKelasModalData(null)}
        >
          <div
            className="bg-white shadow-2xl rounded-2xl w-[95%] max-w-2xl relative animate-slide-up max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b bg-gray-50">
              <button
                onClick={() => setKelasModalData(null)}
                className="absolute top-5 right-6 text-gray-400 hover:text-red-500 transition"
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="text-lg font-bold text-gray-800">
                Daftar Akses Kelas
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Tryout:{" "}
                <span className="text-blue-600 font-bold">
                  {kelasModalData.judul}
                </span>
              </p>
              <input
                type="text"
                placeholder="Cari nama kelas..."
                className="w-full px-4 py-2 rounded-lg border mt-4 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                onChange={(e) => setSearchKelas(e.target.value)}
              />
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {isLoadingKelas ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listKelasTryout
                    .filter((kls) =>
                      kls.nama_kelas
                        .toLowerCase()
                        .includes(searchKelas.toLowerCase()),
                    )
                    .map((kls, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col hover:border-blue-300 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-800">
                          {kls.nama_kelas}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {kls.nama_batch}
                        </span>
                      </div>
                    ))}
                </div>
              )}
              {!isLoadingKelas && listKelasTryout.length === 0 && (
                <p className="text-center text-gray-400 py-10 text-sm italic">
                  Belum ada kelas yang didaftarkan untuk tryout ini.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryoutPage;
