import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

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
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      alert("Gagal mengambil data batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = batchData.filter((batch) =>
    batch.nama_batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      alert("Batch berhasil ditambahkan!");
      setShowModal(false);
      setFormData({ nama_batch: "", tanggal_mulai: "", tanggal_selesai: "" });
      fetchBatchData();
    } catch (error) {
      console.error("Gagal menambahkan batch:", error);
      alert("Gagal menambahkan batch. Silakan coba lagi.");
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
      alert("Batch berhasil diperbarui!");
      setShowModal(false);
      setEditMode(false);
      setFormData({ nama_batch: "", tanggal_mulai: "", tanggal_selesai: "" });
      fetchBatchData();
    } catch (error) {
      console.error("Gagal memperbarui batch:", error);
      alert("Gagal memperbarui batch.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus batch ini?")) return;
    try {
      await Api.delete(`/batch/${id}`);
      alert("Batch berhasil dihapus.");
      fetchBatchData();
    } catch (error) {
      console.error("Gagal menghapus batch:", error);
      alert("Gagal menghapus batch.");
    }
  };

  const renderTableRows = () =>
    filteredData.map((batch, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border-b border-r border-l capitalize">
          {batch.nama_batch}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-left text-gray-800 border-b border-r">
          {batch.tanggal_mulai}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-left text-gray-800 border-b border-r">
          {batch.tanggal_selesai}
        </td>

        <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleEdit(batch)}
              className="flex justify-center bg-gray-200 pl-2 rounded-full hover:bg-blue-500 hover:text-white items-center gap-2"
            >
              Edit
              <div className="bg-blue-500 rounded-r-full px-2 py-2">
                <LuPencil className="text-white font-extrabold" />
              </div>
            </button>
          </div>
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleDelete(batch.id_batch)}
              className="bg-gray-200 pl-2 rounded-full hover:bg-red-500 hover:text-white flex items-center gap-2"
            >
              Hapus
              <div className="bg-red-500 rounded-r-full px-2 py-2">
                <MdClose className="text-white font-extrabold" />
              </div>
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="user bg-custom-bg min-h-screen relative px-4">
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
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center py-2 px-8 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            className="border rounded-lg px-4 py-2 w-2/5 sm:w-1/6"
          />
          <h1 className="text-xl font-bold sm:text-left w-full sm:w-auto">
            Daftar Batch
          </h1>
          <div className="flex justify-end w-full sm:w-1/4">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <AiOutlinePlus size={18} />
              Tambah Batch
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading data...</div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-xs sm:text-sm">Nama Batch</th>
                  <th className="px-2 py-2 text-xs sm:text-sm">
                    Tanggal Mulai
                  </th>
                  <th className="px-2 py-2 text-xs sm:text-sm">
                    Tanggal Selesai
                  </th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Edit</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Hapus</th>
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
