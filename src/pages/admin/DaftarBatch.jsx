import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { LuPencil } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";

const DaftarBatch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [batchData, setBatchData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_batch: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  useEffect(() => {
    fetchBatchData();
  }, []);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const response = await Api.get("/batch");
      setBatchData(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      // alert("Gagal mengambil data batch.");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    return (
      formData.nama_batch.trim() &&
      formData.tanggal_mulai.trim() &&
      formData.tanggal_selesai.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Semua field wajib diisi!");
      return;
    }

    setFormLoading(true);
    try {
      await Api.post("/batch", formData);
      toast.success("Batch berhasil ditambahkan!");
      setShowModal(false);
      setFormData({ nama_batch: "", tanggal_mulai: "", tanggal_selesai: "" });
      fetchBatchData();
    } catch (error) {
      console.error("Gagal menambahkan batch:", error);
      toast.error("Gagal menambahkan batch. Silakan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (batch) => {
    setFormData({
      nama_batch: batch.nama_batch,
      tanggal_mulai: batch.tanggal_mulai,
      tanggal_selesai: batch.tanggal_selesai,
    });
    setSelectedId(batch.id_batch);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Semua field wajib diisi!");
      return;
    }

    setFormLoading(true);
    try {
      await Api.put(`/batch/${selectedId}`, formData);
      toast.success("Batch berhasil diperbarui!");
      setShowModal(false);
      setEditMode(false);
      setFormData({ nama_batch: "", tanggal_mulai: "", tanggal_selesai: "" });
      fetchBatchData();
    } catch (error) {
      console.error("Gagal memperbarui batch:", error);
      toast.error("Gagal memperbarui batch.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus batch ini?", async () => {
      await Api.delete(`/batch/${id}`);
      toast.success("Batch berhasil dihapus.");
      fetchBatchData();
    });
  };

  const renderTableRows = () =>
    // filteredData.map((batch, index) => (
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
                onClick={() => handleEdit(batch)}
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
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setFormData({
                  nama_batch: "",
                  tanggal_mulai: "",
                  tanggal_selesai: "",
                });
              }}
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => {
            setShowModal(false);
            setEditMode(false);
            setFormData({
              nama_batch: "",
              tanggal_mulai: "",
              tanggal_selesai: "",
            });
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setEditMode(false);
                setFormData({
                  nama_batch: "",
                  tanggal_mulai: "",
                  tanggal_selesai: "",
                });
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              {editMode ? "Edit Batch" : "Tambah Batch Baru"}
            </h2>
            <form
              className="space-y-4"
              onSubmit={editMode ? handleUpdate : handleSubmit}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Batch
                </label>
                <input
                  type="text"
                  name="nama_batch"
                  value={formData.nama_batch}
                  onChange={handleChange}
                  required
                  placeholder="Nama Batch"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`px-4 py-2 rounded-lg text-white ${
                    formLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {formLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarBatch;
