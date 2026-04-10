import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { toast } from "react-toastify";

import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import Header from "../../components/admin/Header.jsx";
import Api, { CDN_ASSET_URL } from "../../utils/Api.jsx";

import TambahPrivateForm from "./modal/TambahPrivateForm.jsx";
import PrivateMateriModal from "./modal/PrivateMateriModal.jsx";
import EditPrivateForm from "./modal/EditPrivateForm.jsx";

const DaftarPrivate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [privateData, setPrivateData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE PAGINATION & META ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [limit, setLimit] = useState(20);

  // --- MODAL STATES (DUMMY) ---
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showMateriModal, setShowMateriModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNama, setSelectedNama] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // 1. Fungsi Fetch Server-Side
  const fetchPrivateData = useCallback(
    async (page = 1, search = "", currentLimit = 20) => {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", currentLimit);

        if (search && search.trim() !== "") {
          params.append("search", search);
        }

        const response = await Api.get(`/kelas-private?${params.toString()}`);
        const result = response.data;

        setPrivateData(result.data || []);
        setTotalData(result.meta?.total || 0);
        setTotalPage(result.meta?.total_page || 1);
      } catch (error) {
        console.error("Gagal mengambil data kelas private:", error);
        setError("Gagal memuat data kelas private.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 2. Debounce Search
  const debouncedFetch = useRef(
    debounce((nextSearch, nextLimit) => {
      fetchPrivateData(1, nextSearch, nextLimit);
    }, 500),
  ).current;

  // 3. Effect untuk memantau perubahan search dan limit
  useEffect(() => {
    setCurrentPage(1);
    debouncedFetch(searchTerm, limit);
    return () => debouncedFetch.cancel();
  }, [searchTerm, limit, debouncedFetch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setCurrentPage(newPage);
      fetchPrivateData(newPage, searchTerm, limit);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleRefreshFetch = () => {
    fetchPrivateData(currentPage, searchTerm, limit);
  };

  // --- ACTIONS (DUMMY) ---
  const handleEditClick = (data) => {
    setSelectedData(data);
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    // Memanggil ConfirmToast untuk konfirmasi
    ConfirmToast("Yakin ingin menghapus kelas private ini?", async () => {
      try {
        // Melakukan request ke endpoint /kelas-private/{id} dengan method DELETE
        await Api.delete(`/kelas-private/${id}`);

        // Menampilkan notifikasi sukses
        toast.success("Kelas Private berhasil dihapus.");

        // Refresh data tabel tanpa memindahkan halaman (menggunakan fungsi refresh yang sudah dibuat)
        handleRefreshFetch();
      } catch (error) {
        // Menangani error jika ada (misal: data masih terhubung dengan relasi lain)
        const msg =
          error.response?.data?.message || "Gagal menghapus kelas private.";
        toast.error(msg);
        console.error("Delete error:", error);
      }
    });
  };

  const handleOpenDetail = (item) => {
    setSelectedId(item.id_mentorship);
    setSelectedNama(item.nama_mentorship);
    setShowMateriModal(true);
  };

  const renderTableRows = () =>
    privateData.map((item, index) => (
      <tr
        key={item.id_mentorship || index}
        className="bg-gray-100 hover:bg-gray-300"
      >
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {(currentPage - 1) * limit + (index + 1)}
        </td>
        <td className="px-4 py-2 text-sm border font-semibold">
          {item.nama_mentorship}
        </td>
        <td className="px-4 py-2 text-sm border capitalize font-medium text-gray-800">
          {item.nama_mentor}
        </td>
        {/* Peserta + Email Peserta */}
        <td className="px-4 py-3 border capitalize">
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-gray-800 leading-tight">
              {item.nama_peserta}
            </span>
            <span className="text-[10px] text-gray-500 lowercase mt-0.5">
              {item.email_peserta}
            </span>
          </div>
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() => handleOpenDetail(item)}
            className="px-4 py-1 text-white text-[10px] rounded-full bg-blue-600 hover:bg-blue-700 transition shadow-sm font-bold"
          >
            {item.total_materi} Materi
          </button>
        </td>

        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[100px]">
          <div className="flex justify-center gap-2">
            <div className="relative group">
              <button
                onClick={() => handleEditClick(item)}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LuPencil className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Edit data
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => handleDelete(item.id_mentorship)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <BsTrash3 className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Hapus data
              </span>
            </div>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="user bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      <img
        src={`${CDN_ASSET_URL}/garis-kanan.png`}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto opacity-40 z-0"
        alt=""
      />
      <img
        src={`${CDN_ASSET_URL}/garis-kanan.png`}
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 transform z-0"
        alt=""
      />
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 max-h-screen relative">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center py-4 px-8 gap-4">
          {/* Kolom kiri (Search) */}
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari mentor, peserta, atau mentorship..."
              className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>

          {/* Kolom tengah (Judul) */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center text-gray-800 tracking-tight">
              Daftar Kelas Private
            </h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowTambahModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md transition-transform hover:scale-105"
            >
              <AiOutlinePlus /> Tambah Private
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[66vh]">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-xs uppercase text-gray-600 tracking-widest font-extrabold">
                    <th className="px-4 py-4 w-16">No</th>
                    <th className="px-4 py-4 text-left">Nama Mentorship</th>
                    <th className="px-4 py-4 text-left">Mentor</th>
                    <th className="px-4 py-4 text-left">Peserta</th>
                    <th className="px-4 py-4 text-center">List Materi</th>
                    <th className="px-4 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {privateData.length > 0 ? (
                    renderTableRows()
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-20 text-gray-400 italic"
                      >
                        Belum ada data kelas private yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION & LIMIT CONTROL --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-8 mt-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-lg bg-gray-50 text-xs font-bold">
                  <span className="text-gray-400 uppercase">Limit:</span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-transparent focus:outline-none text-blue-600 cursor-pointer"
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-red-500 text-red-500 hover:bg-red-50 shadow-sm"
                  }`}
                >
                  Prev
                </button>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage === totalPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === totalPage
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white border border-red-500 text-red-500 hover:bg-red-50 shadow-sm"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Integrasi Modal Tambah Private */}
      {showTambahModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTambahModal(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl relative w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTambahModal(false)}
              className="absolute top-2 right-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 z-[70] flex items-center justify-center"
              title="Tutup"
            >
              <AiOutlineClose size={24} strokeWidth={20} />
            </button>

            {/* Masukkan Form Tambah di sini */}
            <TambahPrivateForm
              setShowModal={setShowTambahModal}
              fetchPrivateData={() =>
                fetchPrivateData(currentPage, searchTerm, limit)
              }
            />
          </div>
        </div>
      )}

      {/* MODAL LIST MATERI PRIVATE */}
      {showMateriModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMateriModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMateriModal(false)}
              className="absolute top-2 right-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 z-[70]"
            >
              <AiOutlineClose size={24} />
            </button>

            <PrivateMateriModal
              idTarget={selectedId}
              namaTarget={selectedNama}
              onRefresh={handleRefreshFetch}
            />
          </div>
        </div>
      )}

      {/* MODAL EDIT PRIVATE */}
      {showEditModal && selectedData && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-2xl relative w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 right-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-[70]"
            >
              <AiOutlineClose size={24} />
            </button>

            <EditPrivateForm
              initialData={selectedData}
              setShowModal={setShowEditModal}
              fetchPrivateData={handleRefreshFetch} // Menggunakan fungsi refresh yang sudah dibuat
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPrivate;
