import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/admin/Header.jsx";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { AiOutlinePlayCircle, AiOutlineFile } from "react-icons/ai";
import TambahMateriForm from "./modal/TambahMateriModal.jsx";
import EditMateriForm from "./modal/EditMateriForm.jsx";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import { toast } from "react-toastify";

import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const DaftarMateri = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [materiData, setMateriData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(false);
  const [showAddMateriModal, setShowAddMateriModal] = useState(false);
  const [showEditMateriModal, setShowEditMateriModal] = useState(false);

  const handleRefreshFetch = async () => fetchMateriData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchMateriData();
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchMateriData = async () => {
    try {
      const response = await Api.get("/materi");
      setMateriData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data materi:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return [...materiData] // copy array biar ga mutasi state asli
      .filter((materi) =>
        [materi.judul, materi.judul_modul, materi.tipe_materi].some((v) =>
          (v ?? "").toLowerCase().includes(k)
        )
      );
  }, [materiData, searchTerm]);

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
            : materi
        )
      );
    } catch (error) {
      console.error("Gagal mengubah visibility:", error);
      toast.error("Gagal mengubah status materi.");
    } finally {
      toast.success("Status materi berhasil diubah.");
      setLoadingVisibility(false); // sembunyikan overlay
    }
  };

  const renderTableRows = () =>
    filteredData.map((materi, index) => (
      <tr
        key={filteredData.id_materi || index}
        className="bg-gray-100 hover:bg-gray-300"
      >
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-sm border">{materi.judul}</td>
        <td className="px-4 py-2 text-sm border">{materi.judul_modul}</td>
        <td className="px-1 py-2 text-xs sm:text-sm border text-center">
          <div className="flex justify-center">
            <a
              href={materi.url_file}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between gap-2 w-[140px] rounded-full overflow-hidden transition-colors
        ${
          materi.tipe_materi === "video"
            ? "bg-red-100 hover:bg-red-500 text-red-600 hover:text-white"
            : "bg-blue-100 hover:bg-blue-500 text-blue-600 hover:text-white"
        }`}
            >
              {/* Label berubah saat hover */}
              <span className="flex-1 text-center px-2 py-1 font-medium">
                <span className="group-hover:hidden">
                  {materi.tipe_materi === "video" ? "Video" : "Document"}
                </span>
                <span className="hidden group-hover:inline">Preview</span>
              </span>

              {/* Icon tetap */}
              <div
                className={`flex items-center justify-center px-2 py-2 
          ${materi.tipe_materi === "video" ? "bg-red-500" : "bg-blue-500"} 
          group-hover:bg-transparent`}
              >
                {materi.tipe_materi === "video" ? (
                  <AiOutlinePlayCircle className="text-white group-hover:text-current" />
                ) : (
                  <AiOutlineFile className="text-white group-hover:text-current" />
                )}
              </div>
            </a>
          </div>
        </td>

        <td className="px-4 py-2 text-sm border flex justify-center">
          <select
            value={materi.visibility}
            onChange={(e) =>
              handleVisibilityChange(materi.id_materi, e.target.value)
            }
            className={`capitalize font-semibold rounded-md px-2 py-1
      ${
        materi.visibility === "open"
          ? "text-green-600"
          : materi.visibility === "hold"
          ? "text-yellow-600"
          : materi.visibility === "close"
          ? "text-red-600"
          : "text-gray-600"
      }
    `}
          >
            <option className="text-green-600" value="open">
              Open
            </option>
            <option className="text-yellow-600" value="hold">
              Hold
            </option>
            <option className="text-red-600" value="close">
              Close
            </option>
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
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data materi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-sm">No</th>
                  <th className="px-4 py-2 text-sm">Judul</th>
                  <th className="px-4 py-2 text-sm">Modul</th>
                  <th className="px-4 py-2 text-sm">Tipe (Preview)</th>
                  <th className="px-4 py-2 text-sm">Status</th>
                  <th className="px-4 py-2 text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Materi */}
      {showAddMateriModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowAddMateriModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowAddMateriModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
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
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowEditMateriModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowEditMateriModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
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
