import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { AiOutlinePlayCircle, AiOutlineFile } from "react-icons/ai";

import Header from "../../components/admin/Header.jsx";
import TambahMateriForm from "./modal/TambahMateriModal.jsx";
import EditMateriForm from "./modal/EditMateriForm.jsx";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";

import Api, { CDN_ASSET_URL } from "../../utils/Api.jsx";

const DaftarMateri = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [materiData, setMateriData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE PAGINATION & META ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [limit, setLimit] = useState(20);

  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [showAddMateriModal, setShowAddMateriModal] = useState(false);
  const [showEditMateriModal, setShowEditMateriModal] = useState(false);

  // 1. Fungsi Fetch Server-Side
  const fetchMateriData = useCallback(
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

        const response = await Api.get(`/materi?${params.toString()}`);
        const result = response.data;

        // Sesuai JSON: result.data dan result.meta
        setMateriData(result.data || []);
        setTotalData(result.meta?.total || 0);
        setTotalPage(result.meta?.total_page || 1);
      } catch (err) {
        console.error("Gagal mengambil data materi:", err);
        setError("Gagal memuat data materi.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 2. Debounce Search
  const debouncedFetch = useRef(
    debounce((nextSearch, nextLimit) => {
      fetchMateriData(1, nextSearch, nextLimit);
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
      fetchMateriData(newPage, searchTerm, limit);
    }
  };

  const handleRefreshFetch = () =>
    fetchMateriData(currentPage, searchTerm, limit);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleEditClick = (materi) => {
    setSelectedMateri(materi);
    setShowEditMateriModal(true);
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus materi ini?", async () => {
      await Api.delete(`/materi/${id}`);
      toast.success("Materi berhasil dihapus.");
      fetchMateriData();
    });
  };

  const handleVisibilityChange = async (id, newStatus) => {
    setLoadingVisibility(true); // tampilkan overlay

    try {
      await Api.put(`/materi/${id}/visibility`, { visibility: newStatus });
      // Update lokal
      setMateriData((prev) =>
        prev.map((materi) =>
          materi.id_materi === id
            ? { ...materi, visibility: newStatus }
            : materi,
        ),
      );
    } catch (error) {
      console.error("Gagal mengubah visibility:", error);
      toast.error("Gagal mengubah status materi.");
    } finally {
      toast.success("Status materi berhasil diubah.");
      setLoadingVisibility(false); // sembunyikan overlay
    }
  };

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const renderTableRows = () =>
    materiData.map((materi, index) => (
      <tr
        key={materi.id_materi || index}
        className="bg-gray-100 hover:bg-gray-300"
      >
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border">
          {(currentPage - 1) * limit + (index + 1)}
        </td>
        <td className="px-4 py-2 text-sm border font-medium">{materi.judul}</td>
        <td className="px-4 py-2 text-sm border text-gray-700">
          {toTitleCase(materi.owner)}
        </td>
        <td className="px-4 py-2 text-sm border text-blue-600 font-semibold">
          {materi.judul_modul}
        </td>

        {/* Kolom Tipe/Preview */}
        <td className="px-1 py-2 text-xs sm:text-sm border text-center">
          <div className="flex justify-center">
            <a
              href={materi.url_file}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between gap-2 w-[130px] rounded-full overflow-hidden transition-all shadow-sm
                ${
                  materi.tipe_materi === "video"
                    ? "bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200"
                    : "bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-200"
                }`}
            >
              <span className="flex-1 text-[10px] uppercase tracking-wider text-center px-2 py-1 font-bold">
                <span className="group-hover:hidden">{materi.tipe_materi}</span>
                <span className="hidden group-hover:inline font-extrabold">
                  Preview
                </span>
              </span>
              <div
                className={`flex items-center justify-center p-2 ${materi.tipe_materi === "video" ? "bg-red-500" : "bg-blue-500"} group-hover:bg-transparent`}
              >
                {materi.tipe_materi === "video" ? (
                  <AiOutlinePlayCircle className="text-white" />
                ) : (
                  <AiOutlineFile className="text-white" />
                )}
              </div>
            </a>
          </div>
        </td>

        <td className="px-4 py-2 text-sm border text-center">
          {materi.is_downloadable === 1 ? (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-green-100 text-green-700 border border-green-200 uppercase">
              Yes
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 text-red-700 border border-red-200 uppercase">
              No
            </span>
          )}
        </td>

        <td className="px-4 py-2 text-sm border text-center">
          <select
            value={materi.visibility}
            onChange={(e) =>
              handleVisibilityChange(materi.id_materi, e.target.value)
            }
            className={`capitalize font-bold rounded-md px-2 py-1 text-xs border focus:outline-none
              ${
                materi.visibility === "open"
                  ? "text-green-600 border-green-200 bg-green-50"
                  : materi.visibility === "hold"
                    ? "text-yellow-600 border-yellow-200 bg-yellow-50"
                    : "text-red-600 border-red-200 bg-red-50"
              }
            `}
          >
            <option value="open">Open</option>
            <option value="hold">Hold</option>
            <option value="close">Close</option>
          </select>
        </td>

        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[100px]">
          <div className="flex justify-center gap-2">
            <div className="relative group">
              <button
                onClick={() => handleEditClick(materi)}
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
                onClick={() => handleDelete(materi.id_materi)}
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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        <div className="grid grid-cols-3 items-center py-2 px-8 gap-4">
          {/* Kolom kiri (Search) */}
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari materi atau modul..."
              className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Kolom tengah (Judul) */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">Daftar Materi</h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddMateriModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Materi
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[66vh]">
              <table className="min-w-full bg-white border-collapse">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-xs uppercase text-gray-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Modul</th>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Download</th>
                    <th className="px-4 py-3 text-center">Status</th>
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
                  <span className="font-bold text-gray-400">LIMIT:</span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-transparent focus:outline-none font-bold text-blue-600 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <p className="text-[11px] font-semibold text-gray-500">
                  Total: <span className="text-red-600">{totalData}</span>{" "}
                  Materi | Hal{" "}
                  <span className="text-red-600">{currentPage}</span> dari{" "}
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
                      : "bg-white border border-red-500 text-red-500 hover:bg-red-50"
                  }`}
                >
                  Prev
                </button>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-sm">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentPage === totalPage
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white border border-red-500 text-red-500 hover:bg-red-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah Materi */}
      {showAddMateriModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowAddMateriModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowAddMateriModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Form Tambah Materi */}
            <TambahMateriForm
              onClose={() => setShowAddMateriModal(false)}
              onRefresh={handleRefreshFetch}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Materi */}
      {showEditMateriModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowEditMateriModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowEditMateriModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Form Tambah Materi */}
            <EditMateriForm
              materi={selectedMateri}
              onClose={() => setShowEditMateriModal(false)}
              onRefresh={handleRefreshFetch}
            />
          </div>
        </div>
      )}

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

export default DaftarMateri;
