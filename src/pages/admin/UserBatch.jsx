import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const UserBatch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [pesertaList, setPesertaList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [formData, setFormData] = useState({
    id_user: "",
    id_batch: "",
    tanggal_join: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPeserta();
    fetchBatch();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await Api.get("/user-batch");
      setUserData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data user-batch", err);
      setError("Gagal mengambil data peserta batch.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeserta = async () => {
    try {
      const res = await Api.get("/peserta");
      setPesertaList(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data peserta", err);
    }
  };

  const fetchBatch = async () => {
    try {
      const res = await Api.get("/batch");
      setBatchList(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data batch", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const validateForm = () => {
    const { id_user, id_batch, tanggal_join } = formData;
    if (!id_user || !id_batch || !tanggal_join) return "Harap isi semua field.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return alert(error);

    setIsSubmitting(true);
    try {
      if (isEdit && selectedId) {
        await Api.put(`/user-batch/${selectedId}`, formData);
        alert("Peserta batch berhasil diperbarui.");
      } else {
        await Api.post("/user-batch", formData);
        alert("Peserta batch berhasil ditambahkan.");
      }
      setShowModal(false);
      setFormData({ id_user: "", id_batch: "", tanggal_join: "" });
      setIsEdit(false);
      setSelectedId(null);
      fetchUsers();
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id_user: item.id_user,
      id_batch: item.id_batch,
      tanggal_join: item.tanggal_join,
    });
    setSelectedId(item.id_userbatch);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus peserta dari batch ini?"))
      return;
    try {
      await Api.delete(`/user-batch/${id}`);
      alert("Data berhasil dihapus.");
      fetchUsers();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      alert("Gagal menghapus data.");
    }
  };

  const filteredData = userData.filter((item) =>
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTableRows = () =>
    filteredData.map((item, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm border">{item.nama}</td>
        <td className="px-4 py-2 text-xs sm:text-sm border">{item.email}</td>
        <td className="px-4 py-2 text-xs sm:text-sm border">
          {item.nama_batch}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border">
          {item.tanggal_join}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() => handleEdit(item)}
            className="flex justify-center bg-gray-200 pl-2 rounded-full hover:bg-blue-500 hover:text-white items-center gap-2"
          >
            Edit
            <div className="bg-blue-500 rounded-r-full px-2 py-2">
              <LuPencil className="text-white font-extrabold" />
            </div>
          </button>
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() => handleDelete(item.id_userbatch)}
            className="bg-gray-200 pl-2 rounded-full hover:bg-red-500 hover:text-white flex items-center gap-2"
          >
            Hapus
            <div className="bg-red-500 rounded-r-full px-2 py-2">
              <MdClose className="text-white font-extrabold" />
            </div>
          </button>
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
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 z-0"
        alt=""
      />
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 relative">
        <div className="flex flex-col sm:flex-row justify-between items-center py-2 px-8 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari peserta..."
            className="border rounded-lg px-4 py-2 w-2/5 sm:w-1/6"
          />
          <h1 className="text-xl font-bold text-center sm:text-left">
            Peserta Batch
          </h1>
          <button
            onClick={() => {
              setFormData({ id_user: "", id_batch: "", tanggal_join: "" });
              setIsEdit(false);
              setSelectedId(null);
              setShowModal(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded-xl shadow-md flex items-center gap-2"
          >
            <AiOutlinePlus size={18} /> Tambah Peserta
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 mt-4">Memuat data...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">{error}</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-sm">Nama</th>
                  <th className="px-4 py-2 text-sm">Email</th>
                  <th className="px-4 py-2 text-sm">Batch</th>
                  <th className="px-4 py-2 text-sm">Tanggal Join</th>
                  <th className="px-4 py-2 text-sm">Edit</th>
                  <th className="px-4 py-2 text-sm">Hapus</th>
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
            setFormData({ id_user: "", id_batch: "", tanggal_join: "" });
            setIsEdit(false);
            setSelectedId(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({ id_user: "", id_batch: "", tanggal_join: "" });
                setIsEdit(false);
                setSelectedId(null);
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              {isEdit ? "Edit Peserta Batch" : "Tambah Peserta Batch"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Nama Peserta
                </label>
                <select
                  name="id_user"
                  value={formData.id_user}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                >
                  <option value="">Pilih Peserta</option>
                  {pesertaList.map((user) => (
                    <option key={user.id_user} value={user.id_user}>
                      {user.nama} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium">Batch</label>
                <select
                  name="id_batch"
                  value={formData.id_batch}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                >
                  <option value="">Pilih Batch</option>
                  {batchList.map((batch) => (
                    <option key={batch.id_batch} value={batch.id_batch}>
                      {batch.nama_batch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Tanggal Join
                </label>
                <input
                  type="date"
                  name="tanggal_join"
                  value={formData.tanggal_join}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitting
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
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

export default UserBatch;
