import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/admin/Header.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const TryoutPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tryoutData, setTryoutData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [showAddTryoutModal, setShowAddTryoutModal] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState(null);

  // 🔹 Ambil data tryout dari API
  const fetchTryoutData = async () => {
    try {
      const response = await Api.get("/tryout");
      setTryoutData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data tryout:", error);
      toast.error("Gagal memuat data tryout");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTryoutData();
  }, []);

  // 🔍 Filter berdasarkan pencarian
  const filteredData = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return tryoutData.filter(
      (t) =>
        t.nama_tryout?.toLowerCase().includes(k) ||
        t.kategori?.toLowerCase().includes(k)
    );
  }, [tryoutData, searchTerm]);

  // 🔹 Hapus Tryout
  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus tryout ini?", async () => {
      await Api.delete(`/admin/tryout/${id}`);
      toast.success("Tryout berhasil dihapus.");
      fetchTryoutData();
    });
  };

  // 🔹 Ubah status visibility
  const handleVisibilityChange = async (id_tryout, newStatus) => {
    setLoadingVisibility(true);
    try {
      await Api.patch(`/admin/tryout/${id_tryout}/visibility`, {
        visibility: newStatus,
      });
      toast.success("Status tryout berhasil diubah.");
      setTryoutData((prev) =>
        prev.map((t) =>
          t.id_tryout === id_tryout ? { ...t, visibility: newStatus } : t
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status tryout.");
    } finally {
      setLoadingVisibility(false);
    }
  };

  // 🔹 Render baris tabel
  const renderTableRows = () =>
    filteredData.map((t, index) => (
      <tr key={t.id_tryout} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs text-center border">{index + 1}</td>
        <td className="px-4 py-2 text-sm border">{t.nama_tryout}</td>
        <td className="px-4 py-2 text-sm border">{t.kategori || "-"}</td>
        <td className="px-4 py-2 text-sm border text-center">
          {t.total_soal || 0}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {t.durasi ? `${t.durasi} menit` : "-"}
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
            <option value="close">Close</option>
          </select>
        </td>
        <td className="px-4 py-2 text-sm border w-[100px]">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setSelectedTryout(t)}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <LuPencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(t.id_tryout)}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <BsTrash3 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
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
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tryout..."
              className="border rounded-lg px-4 py-2 w-full sm:w-48"
            />
          </div>
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">Daftar Tryout</h1>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddTryoutModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Tryout
            </button>
          </div>
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
                  <th className="px-4 py-2 text-sm">Nama Tryout</th>
                  <th className="px-4 py-2 text-sm">Kategori</th>
                  <th className="px-4 py-2 text-sm">Jumlah Soal</th>
                  <th className="px-4 py-2 text-sm">Durasi</th>
                  <th className="px-4 py-2 text-sm">Status</th>
                  <th className="px-4 py-2 text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}

        <p className="pl-4 pt-2 text-xs font-semibold text-blue-600">
          <sup>*</sup>Jumlah tryout: {tryoutData.length} data
        </p>
      </div>

      {/* Overlay Loading */}
      {loadingVisibility && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2 bg-white px-6 py-4 rounded-lg shadow-md">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <p className="text-sm font-medium text-gray-700">Menyimpan...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryoutPage;
