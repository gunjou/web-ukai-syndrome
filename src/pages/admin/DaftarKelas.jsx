import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const DaftarKelas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasData, setKelasData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama_kelas: "",
    deskripsi: "",
    id_batch: "",
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [batchLoading, setBatchLoading] = useState(true);
  const [batchError, setBatchError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchKelasData();
        await fetchBatchOptions();
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

  const fetchBatchOptions = async () => {
    setBatchLoading(true);
    setBatchError("");
    try {
      const response = await Api.get("/batch");
      setBatchOptions(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data batch:", error);
      setBatchError("Gagal mengambil data batch.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = kelasData.filter((kelas) =>
    kelas.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kelas || !formData.deskripsi || !formData.id_batch) {
      alert("Harap lengkapi semua field.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Api.post("/paket-kelas", formData);
      alert("Kelas berhasil ditambahkan!");
      setShowModal(false);
      setFormData({ nama_kelas: "", deskripsi: "", id_batch: "" });
      fetchKelasData();
    } catch (error) {
      console.error("Gagal menambahkan kelas:", error);
      alert("Gagal menambahkan kelas. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (kelas) => {
    setFormData({
      nama_kelas: kelas.nama_kelas,
      deskripsi: kelas.deskripsi,
      id_batch: kelas.id_batch,
    });
    setSelectedId(kelas.id_paketkelas);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.nama_kelas || !formData.deskripsi || !formData.id_batch) {
      alert("Harap lengkapi semua field.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Api.put(`/paket-kelas/${selectedId}`, formData);
      alert("Kelas berhasil diperbarui!");
      setShowModal(false);
      setEditMode(false);
      setFormData({ nama_kelas: "", deskripsi: "", id_batch: "" });
      fetchKelasData();
    } catch (error) {
      console.error("Gagal memperbarui kelas:", error);
      alert("Gagal memperbarui kelas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kelas ini?")) return;
    try {
      await Api.delete(`/paket-kelas/${id}`);
      alert("Kelas berhasil dihapus.");
      fetchKelasData();
    } catch (error) {
      console.error("Gagal menghapus kelas:", error);
      alert("Gagal menghapus kelas.");
    }
  };

  const renderTableRows = () =>
    filteredData.map((kelas, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.nama_kelas}
        </td>
        <td className="px-4 py-2 text-sm border capitalize">
          {kelas.deskripsi}
        </td>
        <td className="px-4 py-2 text-sm border">{kelas.nama_batch}</td>
        <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleEdit(kelas)}
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
              onClick={() => handleDelete(kelas.id_paketkelas)}
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
                setShowModal(true);
                setEditMode(false);
                setFormData({ nama_kelas: "", deskripsi: "", id_batch: "" });
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
                  <th className="px-4 py-2 text-sm ">Nama Kelas</th>
                  <th className="px-4 py-2 text-sm ">Deskripsi</th>
                  <th className="px-4 py-2 text-sm ">Batch</th>
                  <th className="px-4 py-2 text-sm ">Edit</th>
                  <th className="px-4 py-2 text-sm ">Hapus</th>
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
            setFormData({ nama_kelas: "", deskripsi: "", id_batch: "" });
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setEditMode(false);
                setFormData({ nama_kelas: "", deskripsi: "", id_batch: "" });
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              {editMode ? "Edit Kelas" : "Tambah Kelas Baru"}
            </h2>
            <form
              onSubmit={editMode ? handleUpdate : handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">Nama Kelas</label>
                <input
                  type="text"
                  name="nama_kelas"
                  placeholder="Masukkan nama kelas"
                  value={formData.nama_kelas}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  placeholder="Masukkan deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Batch</label>
                {batchLoading ? (
                  <div className="text-sm text-gray-500">Memuat batch...</div>
                ) : batchError ? (
                  <div className="text-sm text-red-500">{batchError}</div>
                ) : (
                  <select
                    name="id_batch"
                    value={formData.id_batch}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">-- Pilih Batch --</option>
                    {batchOptions.map((batch) => (
                      <option key={batch.id_batch} value={batch.id_batch}>
                        {batch.nama_batch}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarKelas;
