import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/admin/Header.jsx";
import { AiOutlinePlus, AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import garisKanan from "../../assets/garis-kanan.png";
import TambahTryoutModal from "./modal/TambahTryoutModal.jsx";
import Api from "../../utils/Api.jsx";
import LihatSoalModal from "./modal/LihatSoalModal.jsx";
import EditTryoutModal from "./modal/EditTryoutModal.jsx";

// === AMBIL WAKTU INTERNET (SERVER TIME) ===
const getInternetTime = async () => {
  try {
    const res = await fetch("https://google.com", { method: "HEAD" });
    const dateHeader = res.headers.get("Date");
    return dateHeader ? new Date(dateHeader) : new Date();
  } catch (e) {
    console.warn("Gagal ambil waktu internet, fallback ke local time");
    return new Date();
  }
};
const formatTanggalIndo = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const TryoutPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tryoutData, setTryoutData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [showAddTryoutModal, setShowAddTryoutModal] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [selectedTryoutForQuestions, setSelectedTryoutForQuestions] =
    useState(null);
  const [kelasModalData, setKelasModalData] = useState(null);
  const [searchKelas, setSearchKelas] = useState("");

  // 🔹 Filter state
  const [paketKelas, setPaketKelas] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  // === FETCH DATA ===
  const fetchTryoutData = async () => {
    try {
      const response = await Api.get("/tryout/all-tryout");
      setTryoutData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data tryout:", error);
      toast.error("Gagal memuat data tryout");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaketKelas = async () => {
    try {
      const res = await Api.get("/paket-kelas");
      setPaketKelas(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data paket kelas:", error);
    }
  };

  useEffect(() => {
    fetchTryoutData();
    fetchPaketKelas();
  }, []);

  // === BUAT BATCH UNIK DARI paket-kelas ===
  const batchOptions = [
    ...new Map(
      paketKelas.map((item) => [item.id_batch, item.nama_batch])
    ).entries(),
  ].map(([id, nama]) => ({ id, nama }));

  // === FILTER KELAS BERDASARKAN BATCH YANG DIPILIH ===
  const filteredKelas = selectedBatch
    ? paketKelas.filter((k) => k.id_batch === Number(selectedBatch))
    : paketKelas;

  // === FILTERING DATA TRYOUT ===
  const filteredData = useMemo(() => {
    let data = [...tryoutData];

    if (searchTerm) {
      const key = searchTerm.toLowerCase();
      data = data.filter((t) => t.judul?.toLowerCase().includes(key));
    }

    if (selectedBatch) {
      data = data.filter((t) => t.id_batch === Number(selectedBatch));
    }

    if (selectedKelas) {
      data = data.filter((t) =>
        Array.isArray(t.id_paketkelas)
          ? t.id_paketkelas.includes(Number(selectedKelas))
          : t.id_paketkelas === Number(selectedKelas)
      );
    }

    return data;
  }, [tryoutData, searchTerm, selectedBatch, selectedKelas]);

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
    setUpdatingId(id_tryout); // tandai baris yang sedang diupdate
    try {
      const res = await Api.put(`/tryout/${id_tryout}/visibility`, {
        visibility: newStatus,
      });
      toast.success(res?.data?.message || "Status tryout berhasil diubah");

      // update langsung di state
      setTryoutData((prev) =>
        prev.map((t) =>
          t.id_tryout === id_tryout ? { ...t, visibility: newStatus } : t
        )
      );
    } catch (error) {
      console.error("Gagal ubah visibility:", error);
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat mengubah visibility"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // === AUTO VISIBILITY BERDASARKAN WAKTU ===
  const autoUpdateVisibility = async () => {
    if (!tryoutData.length) return;

    const now = await getInternetTime();

    for (const t of tryoutData) {
      if (!t.access_start_at || !t.access_end_at) continue;

      const start = new Date(t.access_start_at);
      start.setHours(0, 0, 0, 0); // awal hari

      const end = new Date(t.access_end_at);
      end.setHours(23, 59, 59, 999); // akhir hari

      let expectedStatus = "hold";

      if (now >= start && now <= end) {
        expectedStatus = "open";
      }

      if (t.visibility !== expectedStatus) {
        try {
          await Api.put(`/tryout/${t.id_tryout}/visibility`, {
            visibility: expectedStatus,
          });

          // update state lokal
          setTryoutData((prev) =>
            prev.map((x) =>
              x.id_tryout === t.id_tryout
                ? { ...x, visibility: expectedStatus }
                : x
            )
          );

          console.log(
            `Auto update: ${t.judul} → ${expectedStatus.toUpperCase()}`
          );
        } catch (err) {
          console.error("Auto visibility gagal:", err);
        }
      }
    }
  };

  useEffect(() => {
    if (!isLoading && tryoutData.length) {
      autoUpdateVisibility();

      const interval = setInterval(() => {
        autoUpdateVisibility();
      }, 60000); // cek tiap 1 menit

      return () => clearInterval(interval);
    }
  }, [isLoading, tryoutData]);

  // === RENDER TABEL ===
  const renderTableRows = () =>
    filteredData.map((t, index) => (
      <tr
        key={t.id_tryout}
        className="bg-gray-100 hover:bg-gray-200 transition"
      >
        <td className="px-2 py-2 text-xs text-center border">{index + 1}</td>
        <td className="px-4 py-2 text-sm border capitalize">{t.judul}</td>
        <td className="px-4 py-2 text-sm border text-center">
          {t.jumlah_soal}
        </td>
        <td className="px-4 py-2 text-sm border text-center">{t.durasi} mnt</td>
        <td className="px-4 py-2 text-sm border text-center">
          {t.max_attempt}x
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {t.nama_batch || "-"}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          <button
            onClick={() => setKelasModalData(t)}
            className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full hover:bg-blue-600"
          >
            {t.nama_kelas?.filter(Boolean).length || 0} Kelas
          </button>
        </td>

        <td className="px-4 py-2 text-sm border text-center">
          {formatTanggalIndo(t.access_start_at)}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {formatTanggalIndo(t.access_end_at)}
        </td>

        <td className="px-4 py-2 text-sm border text-center">
          <select
            value={t.visibility || "hold"}
            onChange={(e) =>
              handleVisibilityChange(t.id_tryout, e.target.value)
            }
            className={`capitalize font-semibold rounded-md px-2 py-1 ${
              t.visibility === "open"
                ? "text-green-600"
                : t.visibility === "hold"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            <option value="open">Open</option>
            <option value="hold">Hold</option>
          </select>
        </td>

        {/* 🔹 Kolom aksi pakai icon */}
        <td className="px-4 py-2 text-sm border text-center">
          <div className="flex justify-center items-center gap-3">
            {/* Lihat Soal */}
            <button
              onClick={() => setSelectedTryoutForQuestions(t)}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
              title="Lihat Soal"
            >
              <AiOutlineEye size={18} />
            </button>
            {/* Edit */}
            <button
              onClick={() => setSelectedTryout(t)}
              className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition"
              title="Edit Tryout"
            >
              <LuPencil size={18} />
            </button>

            {/* Hapus */}
            <button
              onClick={() => handleDelete(t.id_tryout)}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
              title="Hapus Tryout"
            >
              <BsTrash3 size={16} />
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      {/* Background Pattern */}
      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto opacity-40 z-0"
        alt=""
      />
      <img
        src={garisKanan}
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 transform z-0"
        alt=""
      />

      <Header />

      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        {/* Header Atas */}
        <div className="grid grid-cols-3 items-center py-2 px-8 gap-4">
          {/* Kolom kiri */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tryout..."
              className="border rounded-lg px-4 py-2 w-full sm:w-48"
            />
          </div>

          {/* Tengah */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">Daftar Tryout</h1>
          </div>

          {/* Kanan */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddTryoutModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Tryout
            </button>
          </div>
        </div>

        {/* 🔽 FILTER */}
        <div className="flex flex-wrap gap-3 px-8 pb-4">
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setSelectedKelas("");
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Batch</option>
            {batchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama}
              </option>
            ))}
          </select>

          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Kelas</option>
            {filteredKelas.map((k) => (
              <option key={k.id_paketkelas} value={k.id_paketkelas}>
                {k.nama_kelas}
              </option>
            ))}
          </select>
        </div>

        {/* Tabel */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data tryout...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-sm">No</th>
                  <th className="px-4 py-2 text-sm">Judul</th>
                  <th className="px-4 py-2 text-sm">Jumlah Soal</th>
                  <th className="px-4 py-2 text-sm">Durasi</th>
                  <th className="px-4 py-2 text-sm">Max Attempt</th>
                  <th className="px-4 py-2 text-sm">Batch</th>
                  <th className="px-4 py-2 text-sm">Kelas</th>
                  <th className="px-4 py-2 text-sm">Mulai</th>
                  <th className="px-4 py-2 text-sm">Selesai</th>
                  <th className="px-4 py-2 text-sm">Status</th>
                  <th className="px-4 py-2 text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}

        <p className="pl-4 pt-2 text-xs font-semibold text-blue-600">
          <sup>*</sup>Jumlah tryout: {filteredData.length} data
        </p>
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
      {kelasModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setKelasModalData(null)}
        >
          <div
            className="bg-white shadow-xl rounded-2xl w-[95%] max-w-3xl relative animate-slide-up 
                 max-h-[85vh] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-6 flex flex-col gap-1">
              {/* Close Button */}
              <button
                onClick={() => setKelasModalData(null)}
                className="absolute top-5 right-6 text-gray-500 hover:text-gray-700 transition"
              >
                <AiOutlineClose size={24} />
              </button>

              <h2 className="text-xl font-semibold text-gray-800">
                Daftar Kelas
              </h2>
              <p className="text-sm text-gray-500">
                Tryout:{" "}
                <span className="font-medium">{kelasModalData.judul}</span>
              </p>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Cari kelas..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 mt-3
                     focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                onChange={(e) => setSearchKelas(e.target.value)}
              />
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {kelasModalData.nama_kelas
                  ?.filter(Boolean)
                  ?.filter((kls) =>
                    kls.toLowerCase().includes(searchKelas.toLowerCase())
                  )
                  ?.map((kls, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200"
                    >
                      {kls}
                    </div>
                  ))}

                {kelasModalData.nama_kelas?.filter(Boolean)?.length === 0 && (
                  <p className="text-gray-500 text-sm">Tidak ada data kelas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryoutPage;
