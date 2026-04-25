import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { toast } from "react-toastify";

import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import Header from "../../components/admin/Header.jsx";
import Api, { CDN_ASSET_URL } from "../../utils/Api.jsx";
import TambahKelasForm from "./modal/TambahKelasForm.jsx";
import EditKelasForm from "./modal/EditKelasForm.jsx";
import KelasPesertaModal from "./modal/KelasPesertaModal.jsx";
import KelasModulModal from "./modal/KelasModulModal.jsx";
import KelasMentorModal from "./modal/KelasMentorModal.jsx";

const DaftarKelas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasData, setKelasData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE PAGINATION & META ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [limit, setLimit] = useState(20);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showListPesertaModal, setShowListPesertaModal] = useState(false);
  const [showListMentorModal, setShowListMentorModal] = useState(false);
  const [showListModulModal, setShowListModulModal] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedNamaKelas, setSelectedNamaKelas] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  // 1. Fungsi Fetch Server-Side
  const fetchKelasData = useCallback(
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

        const response = await Api.get(`/paket-kelas?${params.toString()}`);
        const result = response.data;

        // Sesuai struktur JSON: result.data dan result.meta
        setKelasData(result.data || []);
        setTotalData(result.meta?.total || 0);
        setTotalPage(result.meta?.total_page || 1);
      } catch (error) {
        console.error("Gagal mengambil data kelas:", error);
        setError("Gagal memuat data paket kelas.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 2. Debounce Search
  const debouncedFetch = useRef(
    debounce((nextSearch, nextLimit) => {
      fetchKelasData(1, nextSearch, nextLimit);
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
      fetchKelasData(newPage, searchTerm, limit);
    }
  };

  const handleRefreshFetch = () =>
    fetchKelasData(currentPage, searchTerm, limit);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleEditClick = (kelas) => {
    setSelectedId(kelas.id_paketkelas);
    setSelectedData(kelas);
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus kelas ini?", async () => {
      await Api.delete(`/paket-kelas/${id}`);
      toast.success("Kelas berhasil dihapus.");
      fetchKelasData();
    });
  };

  const handleOpenListPesertaModal = (id, nama) => {
    setShowListPesertaModal(true);
    setSelectedId(id);
    setSelectedNamaKelas(nama);
  };

  const handleOpenListMentorModal = (id, nama) => {
    setShowListMentorModal(true);
    setSelectedId(id);
    setSelectedNamaKelas(nama);
  };

  const handleOpenListModulModal = (id, nama) => {
    setShowListModulModal(true);
    setSelectedId(id);
    setSelectedNamaKelas(nama);
  };

  const getBadgeColor = (total) => {
    if (total < 1) return "bg-blue-500/20";
    if (total <= 5) return "bg-blue-500/40";
    if (total <= 10) return "bg-blue-500/70";
    if (total <= 20) return "bg-blue-500/90";
    return "bg-blue-600"; // full solid
  };

  const renderTableRows = () =>
    kelasData.map((kelas, index) => (
      <tr
        key={kelas.id_paketkelas || index}
        className="bg-gray-100 hover:bg-gray-300"
      >
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {(currentPage - 1) * limit + (index + 1)}
        </td>
        <td className="px-4 py-2 text-sm border capitalize font-semibold">
          {kelas.nama_kelas}
        </td>
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.wali_kelas || "-"}
        </td>
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.nama_paket}
        </td>
        <td className="px-4 py-2 text-sm border">{kelas.nama_batch}</td>
        <td className="px-4 py-2 text-sm border capitalize text-gray-600">
          {kelas.deskripsi}
        </td>
        {/* Tombol-tombol Badge List (Peserta, Mentor, Modul) */}
        <td className="px-2 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() =>
              handleOpenListPesertaModal(kelas.id_paketkelas, kelas.nama_kelas)
            }
            className={`px-3 py-1 text-white text-[10px] rounded-full hover:bg-yellow-500 whitespace-nowrap transition ${getBadgeColor(kelas.total_peserta)}`}
          >
            {kelas.total_peserta} Peserta
          </button>
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() =>
              handleOpenListMentorModal(kelas.id_paketkelas, kelas.nama_kelas)
            }
            className={`px-3 py-1 text-white text-[10px] rounded-full hover:bg-yellow-500 whitespace-nowrap transition ${getBadgeColor(kelas.total_mentor)}`}
          >
            {kelas.total_mentor} Mentor
          </button>
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() =>
              handleOpenListModulModal(kelas.id_paketkelas, kelas.nama_kelas)
            }
            className={`px-3 py-1 text-white text-[10px] rounded-full hover:bg-yellow-500 whitespace-nowrap transition ${getBadgeColor(kelas.total_modul)}`}
          >
            {kelas.total_modul} Modul
          </button>
        </td>

        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[100px]">
          <div className="flex justify-center gap-2">
            <div className="relative group">
              <button
                onClick={() => handleEditClick(kelas)}
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
                onClick={() => handleDelete(kelas.id_paketkelas)}
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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 max-h-screen relative">
        <div className="grid grid-cols-3 items-center py-2 px-8 gap-4">
          {/* Kolom kiri (Search) */}
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari kelas, paket, atau batch..."
              className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Kolom tengah (Judul) */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">Daftar Kelas</h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowTambahModal(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Kelas
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[66vh]">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-xs uppercase text-gray-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Kelas</th>
                    <th className="px-4 py-3">Wali Kelas</th>
                    <th className="px-4 py-3">Paket</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3 text-center">Peserta</th>
                    <th className="px-4 py-3 text-center">Mentor</th>
                    <th className="px-4 py-3 text-center">Modul</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            </div>

            {/* --- PAGINATION & LIMIT CONTROL --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-8 mt-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-lg bg-gray-50 text-xs">
                  <span className="font-bold text-gray-500">LIMIT:</span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-transparent focus:outline-none font-bold text-blue-600 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <p className="text-[11px] font-semibold text-gray-500">
                  Total: <span className="text-blue-600">{totalData}</span>{" "}
                  Kelas | Hal{" "}
                  <span className="text-blue-600">{currentPage}</span> dari{" "}
                  {totalPage}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white border border-blue-500 text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                    {currentPage}
                  </span>
                </div>
                <button
                  disabled={currentPage === totalPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentPage === totalPage
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white border border-blue-500 text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🔹 Modal Tambah Kelas */}
      {showTambahModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowTambahModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowTambahModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            {/* Form */}
            <TambahKelasForm
              setShowModal={setShowTambahModal}
              fetchKelas={fetchKelasData}
            />
          </div>
        </div>
      )}

      {/* 🔹 Modal Edit Kelas */}
      {showEditModal && selectedData && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <EditKelasForm
              setShowModal={setShowEditModal}
              fetchKelas={fetchKelasData}
              selectedId={selectedId}
              initialData={selectedData}
            />
          </div>
        </div>
      )}

      {/* Modal List Peserta */}
      {showListPesertaModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowListPesertaModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowListPesertaModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <KelasPesertaModal
              idTarget={selectedId}
              namaTarget={selectedNamaKelas}
              onClose={() => setShowListPesertaModal(false)}
              onRefresh={() => handleRefreshFetch()}
            />
          </div>
        </div>
      )}

      {/* Modal List Mentor */}
      {showListMentorModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowListMentorModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowListMentorModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <KelasMentorModal
              idTarget={selectedId}
              namaTarget={selectedNamaKelas}
              onClose={() => setShowListMentorModal(false)}
              onRefresh={() => handleRefreshFetch()}
            />
          </div>
        </div>
      )}

      {/* Modal List Modul */}
      {showListModulModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowListModulModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowListModulModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <KelasModulModal
              idTarget={selectedId}
              namaTarget={selectedNamaKelas}
              onClose={() => setShowListModulModal(false)}
              onRefresh={() => handleRefreshFetch()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarKelas;
