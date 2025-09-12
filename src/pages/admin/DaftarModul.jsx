import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/admin/Header.jsx";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import TambahModulForm from "./modal/TambahModulForm.jsx";
import EditModulForm from "./modal/EditModalForm.jsx";
import ListKelasModal from "./modal/ListKelasModal.jsx";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import { toast } from "react-toastify";

const DaftarModul = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modulData, setModulData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedModul, setSelectedModul] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showListKelasModal, setShowListKelasModal] = useState(false);
  const [showAddModulModal, setShowAddModulModal] = useState(false);
  const [showEditModulModal, setShowEditModulModal] = useState(false);
  const [loadingVisibility, setLoadingVisibility] = useState(false); // ⬅️ state global loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchModulData();
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchModulData = async () => {
    try {
      const response = await Api.get("/modul");
      let data = response.data.data || [];

      // 🔹 Sort data
      data.sort((a, b) => {
        // 1️⃣ Prioritas: admin dulu
        if (a.owner === "admin" && b.owner !== "admin") return -1;
        if (a.owner !== "admin" && b.owner === "admin") return 1;

        // 2️⃣ Kalau sama-sama admin atau sama-sama bukan admin → sort A-Z
        return a.judul.localeCompare(b.judul, "id", { sensitivity: "base" });
      });

      setModulData(data);
    } catch (error) {
      console.error("Gagal mengambil data modul:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return [...modulData] // copy array biar ga mutasi state asli
      .filter((modul) =>
        [modul.judul, modul.owner, modul.deskripsi].some((v) =>
          (v ?? "").toLowerCase().includes(k)
        )
      );
  }, [modulData, searchTerm]);

  const handleEditClick = (modul) => {
    setSelectedModul(modul);
    setShowEditModulModal(true);
  };

  const handleVisibilityChange = async (id, newStatus) => {
    setLoadingVisibility(true); // tampilkan overlay

    try {
      await Api.put(`/modul/${id}/visibility`, { visibility: newStatus });
      // Update lokal
      setModulData((prev) =>
        prev.map((modul) =>
          modul.id_modul === id ? { ...modul, visibility: newStatus } : modul
        )
      );
    } catch (error) {
      console.error("Gagal mengubah visibility:", error);
      toast.error("Gagal mengubah status modul.");
    } finally {
      toast.success("Status modul berhasil diubah.");
      setLoadingVisibility(false); // sembunyikan overlay
    }
  };

  const handleRefreshFetch = async () => fetchModulData();

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus modul ini?", async () => {
      await Api.delete(`/modul/${id}`);
      toast.success("Modul berhasil dihapus.");
      fetchModulData();
    });
  };

  const getBadgeColor = (total) => {
    if (total < 1) return "bg-blue-500/20";
    if (total <= 5) return "bg-blue-500/40";
    if (total <= 10) return "bg-blue-500/70";
    if (total <= 20) return "bg-blue-500/90";
    return "bg-blue-600"; // full solid
  };

  const handleOpenListKelasModal = (id) => {
    setSelectedId(id);
    setShowListKelasModal(true);
  };

  const renderTableRows = () =>
    filteredData.map((modul, index) => (
      <tr
        key={filteredData.id_modul || index}
        className="bg-gray-100 hover:bg-gray-300"
      >
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-sm border">{modul.judul}</td>
        <td className="px-4 py-2 text-sm border">{modul.owner}</td>
        <td className="px-4 py-2 text-sm border">{modul.deskripsi}</td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
          {modul.owner === "admin" ? (
            <button
              onClick={() => handleOpenListKelasModal(modul.id_modul)}
              className={`inline-block px-3 py-1 text-white rounded-full hover:bg-yellow-500 ${getBadgeColor(
                modul.total_kelas
              )}`}
            >
              {modul.total_kelas} Kelas
            </button>
          ) : (
            <p className="text-sm">
              {modul.paketkelas?.[0]?.nama_kelas || "-"}
            </p>
          )}
        </td>
        <td className="px-4 py-2 text-sm border flex justify-center">
          <select
            value={modul.visibility}
            onChange={(e) =>
              handleVisibilityChange(modul.id_modul, e.target.value)
            }
            className={`capitalize font-semibold rounded-md px-2 py-1
                    ${
                      modul.visibility === "open"
                        ? "text-green-600"
                        : modul.visibility === "hold"
                        ? "text-yellow-600"
                        : modul.visibility === "close"
                        ? "text-red-600"
                        : "text-gray-600"
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
                onClick={() => handleEditClick(modul)}
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
                onClick={() => handleDelete(modul.id_modul)}
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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 relative">
        <div className="grid grid-cols-3 items-center py-2 px-8 gap-4">
          {/* Kolom kiri (Search) */}
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
              className="border rounded-lg px-4 py-2 w-full sm:w-48"
            />
          </div>

          {/* Kolom tengah (Judul) */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">Daftar Modul</h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModulModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Modul
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data modul...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-sm">No</th>
                  <th className="px-4 py-2 text-sm capitalize">Judul</th>
                  <th className="px-4 py-2 text-sm capitalize">Owner</th>
                  <th className="px-4 py-2 text-sm capitalize">Deskripsi</th>
                  <th className="px-4 py-2 text-sm">List Kelas</th>
                  <th className="px-4 py-2 text-sm">Status</th>
                  <th className="px-4 py-2 text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Modul */}
      {showAddModulModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowAddModulModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowAddModulModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Form */}
            <TambahModulForm
              onClose={() => setShowAddModulModal(false)}
              onRefresh={handleRefreshFetch}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Modul */}
      {showEditModulModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowEditModulModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowEditModulModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Form */}
            <EditModulForm
              modul={selectedModul}
              onClose={() => setShowEditModulModal(false)}
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

      {/* Modal List Kelas */}
      {showListKelasModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowListKelasModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowListKelasModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <ListKelasModal
              idModul={selectedId}
              onClose={() => setShowListKelasModal(false)}
              onRefresh={() => handleRefreshFetch()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarModul;
