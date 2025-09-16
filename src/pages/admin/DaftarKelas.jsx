import React, { useState, useEffect, useMemo } from "react";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import Header from "../../components/admin/Header.jsx";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import TambahKelasForm from "./modal/TambahKelasForm.jsx";
import EditKelasForm from "./modal/EditKelasForm.jsx";

const DaftarKelas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasData, setKelasData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchKelasData();
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchKelasData = async () => {
    try {
      const response = await Api.get("/paket-kelas");
      setKelasData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    }
  };

  // 🔎 Search lebih luas (nama_kelas, nama_paket, nama_batch, deskripsi)
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return kelasData.filter((kelas) =>
      [
        kelas.nama_kelas,
        kelas.nama_paket,
        kelas.nama_batch,
        kelas.deskripsi,
      ].some((v) => (v ?? "").toLowerCase().includes(k))
    );
  }, [kelasData, searchTerm]);

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

  const renderTableRows = () =>
    filteredData.map((kelas, index) => (
      <tr key={index} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.nama_kelas}
        </td>
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.nama_paket}
        </td>
        <td className="px-4 py-2 text-sm border">{kelas.nama_batch}</td>
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.deskripsi}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {kelas.total_peserta}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {kelas.total_mentor}
        </td>
        <td className="px-4 py-2 text-sm border text-center">
          {kelas.total_modul}
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
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data kelas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-sm ">No</th>
                  <th className="px-4 py-2 text-sm ">Nama Kelas</th>
                  <th className="px-4 py-2 text-sm ">Paket</th>
                  <th className="px-4 py-2 text-sm ">Batch</th>
                  <th className="px-4 py-2 text-sm ">Deskripsi</th>
                  <th className="px-4 py-2 text-sm ">Total Peserta</th>
                  <th className="px-4 py-2 text-sm ">Total Mentor</th>
                  <th className="px-4 py-2 text-sm ">Total Modul</th>
                  <th className="px-4 py-2 text-sm ">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
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
    </div>
  );
};

export default DaftarKelas;
