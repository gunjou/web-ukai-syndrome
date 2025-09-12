import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import TambahBatchForm from "./modal/TambahBatchForm.jsx";
import EditBatchForm from "./modal/EditBatchForm.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";

const DaftarBatch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);

  useEffect(() => {
    fetchBatchData();
  }, []);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const response = await Api.get("/batch");
      setBatchData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = batchData
    .filter((batch) =>
      batch.nama_batch.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.tanggal_mulai.localeCompare(b.tanggal_mulai));

  const handleEditClick = (batch) => {
    setSelectedBatch(batch);
    setShowEditBatchModal(true);
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus batch ini?", async () => {
      await Api.delete(`/batch/${id}`);
      toast.success("Batch berhasil dihapus.");
      fetchBatchData();
    });
  };

  const renderTableRows = () =>
    filteredData.map((batch, index) => (
      <tr key={index} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border-b border-r border-l capitalize">
          {batch.nama_batch}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border text-center">
          {batch.total_peserta}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border text-center">
          {batch.tanggal_mulai}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border text-center">
          {batch.tanggal_selesai}
        </td>

        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[100px]">
          <div className="flex justify-center gap-2">
            <div className="relative group">
              <button
                onClick={() => handleEditClick(batch)}
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
                onClick={() => handleDelete(batch.id_batch)}
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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 max-h-screen relative">
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
            <h1 className="text-xl font-bold text-center">Daftar Batch</h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus size={18} />
              Tambah Batch
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data batch...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 border">No</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Nama Batch</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">
                    Total Peserta
                  </th>
                  <th className="px-2 py-2 text-xs sm:text-sm">
                    Tanggal Mulai
                  </th>
                  <th className="px-2 py-2 text-xs sm:text-sm">
                    Tanggal Selesai
                  </th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Modul */}
      {showAddBatchModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowAddBatchModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowAddBatchModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Form */}
            <TambahBatchForm
              onClose={() => setShowAddBatchModal(false)}
              onRefresh={fetchBatchData}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Batch */}
      {showEditBatchModal && selectedBatch && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowEditBatchModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowEditBatchModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Form */}
            <EditBatchForm
              selectedBatch={selectedBatch}
              onClose={() => setShowEditBatchModal(false)}
              onRefresh={fetchBatchData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarBatch;
