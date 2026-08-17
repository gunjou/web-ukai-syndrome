import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import debounce from "lodash/debounce";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { toast } from "react-toastify";
import Header from "../../../components/admin/Header.jsx";

import { ConfirmToast } from "../modal/ConfirmToast.jsx";
import Api, { CDN_ASSET_URL } from "../../../utils/Api.jsx";
import TambahJadwalForm from "./modal/TambahJadwalForm.jsx";
import EditJadwalForm from "./modal/EditJadwalForm.jsx";
import RescheduleJadwalModal from "./modal/RescheduleJadwalModal.jsx";

const DaftarJadwal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [jadwalData, setJadwalData] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE PAGINATION & META ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [limit, setLimit] = useState(20);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  // 1. Fetch Jadwal Data dengan filter
  const fetchJadwalData = useCallback(
    async (page = 1, search = "", kelasId = "", currentLimit = 20) => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", page);
        params.set("limit", currentLimit);

        const trimmedSearch = search.trim();

        if (trimmedSearch.length > 0) {
          params.set("search", trimmedSearch);
        }

        if (kelasId) {
          params.set("id_paketkelas", kelasId);
        }

        const response = await Api.get(`/jadwal?${params.toString()}`);

        const result = response.data;

        setJadwalData(result?.data || []);
        setTotalData(result?.meta?.total || 0);
        setTotalPage(result?.meta?.total_page || 1);
      } catch (error) {
        console.error("Gagal mengambil data jadwal:", error);

        setJadwalData([]);
        setTotalData(0);
        setTotalPage(1);
        setError("Gagal memuat data jadwal.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2. Fetch Kelas untuk dropdown filter
  const fetchKelasOptions = useCallback(async () => {
    try {
      const response = await Api.get("/paket-kelas?limit=999");
      const result = response.data;
      setKelasOptions(result.data || []);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    }
  }, []);

  // 3. Debounce Search & Filter
  const debouncedFetch = useMemo(
    () =>
      debounce((nextSearch, nextKelas, nextLimit) => {
        fetchJadwalData(1, nextSearch, nextKelas, nextLimit);
      }, 500),
    [fetchJadwalData]
  );

  // 4. Fetch kelas hanya sekali
  useEffect(() => {
    fetchKelasOptions();
  }, [fetchKelasOptions]);

  // 5. Fetch data saat search / filter / limit berubah
  useEffect(() => {
    setCurrentPage(1);

    debouncedFetch(searchTerm, filterKelas, limit);

    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, filterKelas, limit, debouncedFetch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setCurrentPage(newPage);
      fetchJadwalData(newPage, searchTerm, filterKelas, limit);
    }
  };

  const handleRefreshFetch = () =>
    fetchJadwalData(currentPage, searchTerm, filterKelas, limit);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterKelasChange = (e) => setFilterKelas(e.target.value);

  const handleEditClick = (jadwal) => {
    setSelectedId(jadwal.id_jadwal);
    setSelectedData(jadwal);
    setShowEditModal(true);
  };

  const handleRescheduleClick = (jadwal) => {
    setSelectedId(jadwal.id_jadwal);
    setSelectedData(jadwal);
    setShowRescheduleModal(true);
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus jadwal ini?", async () => {
      try {
        await Api.delete(`/jadwal/${id}`);
        toast.success("Jadwal berhasil dihapus.");
        fetchJadwalData(currentPage, searchTerm, filterKelas, limit);
      } catch (error) {
        toast.error("Gagal menghapus jadwal.");
      }
    });
  };

  const getStatusBadge = (status) => {
    if (status === 1) {
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
          Aktif
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
        Nonaktif
      </span>
    );
  };

  const getTypePertemuanBadge = (type) => {
    if (type === "ONLINE") {
      return (
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
          ONLINE
        </span>
      );
    }
    return (
      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
        OFFLINE
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5);
  };

  const renderTableRows = () =>
    jadwalData.map((jadwal, index) => (
      <tr
        key={jadwal.id_jadwal || index}
        className="bg-gray-100 hover:bg-gray-300"
      >
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {(currentPage - 1) * limit + (index + 1)}
        </td>
        <td className="px-4 py-2 text-sm border font-semibold">
          {jadwal.nama_kelas}
        </td>
        <td className="px-4 py-2 text-sm border">
          {jadwal.nama_mentor || "-"}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {formatDate(jadwal.tanggal_efektif || jadwal.tanggal)}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {formatTime(jadwal.waktu_mulai_efektif || jadwal.waktu_mulai)} -{" "}
          {formatTime(jadwal.waktu_selesai_efektif || jadwal.waktu_selesai)}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {getTypePertemuanBadge(jadwal.type_pertemuan)}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {getStatusBadge(jadwal.status)}
        </td>

        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border">
          <div className="flex justify-center gap-2">
            {/* Edit Button */}
            <div className="relative group">
              <button
                onClick={() => handleEditClick(jadwal)}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
              >
                <LuPencil className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Edit jadwal
              </span>
            </div>

            {/* Reschedule Button */}
            <div className="relative group">
              <button
                onClick={() => handleRescheduleClick(jadwal)}
                className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition"
              >
                <LuPencil className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Reschedule
              </span>
            </div>

            {/* Delete Button */}
            <div className="relative group">
              <button
                onClick={() => handleDelete(jadwal.id_jadwal)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
              >
                <BsTrash3 className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Hapus jadwal
              </span>
            </div>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="user bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 max-h-screen relative">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 px-4 md:px-8 gap-4">
          {/* Bagian Kiri (Judul) */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-start">
            <h1 className="text-xl font-bold">Daftar Jadwal</h1>
          </div>

          {/* Bagian Kanan (Search, Filter, dan Tombol) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">
            {/* Search Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari kelas/mentor..."
              className="w-full sm:w-48 md:w-56 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />

            {/* Filter Kelas */}
            <select
              value={filterKelas}
              onChange={handleFilterKelasChange}
              className="w-full sm:w-40 md:w-48 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              <option value="">Semua Kelas</option>
              {kelasOptions.map((kelas) => (
                <option key={kelas.id_paketkelas} value={kelas.id_paketkelas}>
                  {kelas.nama_kelas}
                </option>
              ))}
            </select>

            {/* Button Tambah Jadwal */}
            <button
              onClick={() => {
                setShowTambahModal(true);
              }}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition"
            >
              <AiOutlinePlus /> Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Loading / Error / Table Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : jadwalData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>

            {searchTerm.trim() || filterKelas ? (
              <>
                <p className="text-gray-700 font-semibold text-sm">
                  Data tidak ditemukan
                </p>

                <p className="text-gray-500 text-xs mt-1 text-center">
                  Tidak ada jadwal yang sesuai dengan pencarian
                  {searchTerm.trim() && (
                    <>
                      {" "}
                      <span className="font-semibold text-gray-700">
                        "{searchTerm}"
                      </span>
                    </>
                  )}
                  {filterKelas && " dan filter kelas yang dipilih"}.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterKelas("");
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  Reset Pencarian
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-semibold text-sm">
                  Belum ada data jadwal
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  Data jadwal belum tersedia.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[66vh]">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-xs uppercase text-gray-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Kelas</th>
                    <th className="px-4 py-3">Mentor</th>
                    <th className="px-4 py-3 text-center">Tanggal Efektif</th>
                    <th className="px-4 py-3 text-center">Jam</th>
                    <th className="px-4 py-3 text-center">Tipe Pertemuan</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            </div>

            {/* --- PAGINATION & LIMIT CONTROL --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-8 mt-4 gap-4">
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
                  Jadwal | Hal{" "}
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

      {/* 🔹 Modal Tambah Jadwal */}
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
            <TambahJadwalForm
              setShowModal={setShowTambahModal}
              fetchJadwal={fetchJadwalData}
              currentPage={currentPage}
              searchTerm={searchTerm}
              filterKelas={filterKelas}
              limit={limit}
            />
          </div>
        </div>
      )}

      {/* 🔹 Modal Edit Jadwal */}
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
            <EditJadwalForm
              setShowModal={setShowEditModal}
              fetchJadwal={fetchJadwalData}
              selectedId={selectedId}
              initialData={selectedData}
              currentPage={currentPage}
              searchTerm={searchTerm}
              filterKelas={filterKelas}
              limit={limit}
            />
          </div>
        </div>
      )}

      {/* 🔹 Modal Reschedule Jadwal */}
      {showRescheduleModal && selectedData && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowRescheduleModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <RescheduleJadwalModal
              setShowModal={setShowRescheduleModal}
              fetchJadwal={fetchJadwalData}
              selectedId={selectedId}
              initialData={selectedData}
              currentPage={currentPage}
              searchTerm={searchTerm}
              filterKelas={filterKelas}
              limit={limit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarJadwal;
