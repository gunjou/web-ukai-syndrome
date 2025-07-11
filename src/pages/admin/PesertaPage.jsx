import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

const PesertaPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await Api.get("/peserta");
      setUserData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = userData.filter((user) =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    setFormData({ nama: user.nama, email: user.email, password: "" });
    setSelectedId(user.id_user);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus peserta ini?")) return;
    try {
      await Api.delete(`/peserta/${id}`);
      alert("Peserta berhasil dihapus.");
      fetchUsers();
    } catch (error) {
      console.error("Gagal menghapus peserta:", error);
      alert("Gagal menghapus peserta.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Api.post("/peserta", formData);
      alert("Peserta berhasil ditambahkan.");
      setShowModal(false);
      setFormData({ nama: "", email: "", password: "" });
      fetchUsers();
    } catch (error) {
      console.error("Gagal menambahkan peserta:", error);
      alert("Gagal menambahkan peserta.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("ID tidak ditemukan.");
    try {
      const dataToSend = { ...formData };
      if (!formData.password) delete dataToSend.password;

      await Api.put(`/peserta/${selectedId}`, dataToSend);
      alert("Peserta berhasil diperbarui.");
      setShowModal(false);
      setEditMode(false);
      setFormData({ nama: "", email: "", password: "" });
      fetchUsers();
    } catch (error) {
      console.error("Gagal memperbarui peserta:", error);
      alert("Gagal memperbarui peserta.");
    }
  };

  const renderTableRows = () =>
    filteredData.map((user, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm border-b border-r border-l capitalize">
          {user.nama}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border-b border-r">
          {user.email}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border-b border-r">
          {user.kode_pemulihan || "-"}
        </td>
        <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleEdit(user)}
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
              onClick={() => handleDelete(user.id_user)}
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
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 z-0"
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
          <h1 className="text-xl font-bold text-center sm:text-left w-full sm:w-auto">
            Peserta Ukai Syndrome
          </h1>
          <div className="flex justify-end w-full sm:w-1/4">
            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setFormData({ nama: "", email: "", password: "" });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg transition shadow-md flex items-center gap-2"
            >
              <AiOutlinePlus size={18} />
              Tambah Peserta
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="min-w-full bg-white">
            <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-xs sm:text-sm">Nama</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Email</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Kode Pemulihan</th>
                <th className="px-4 py-2 text-xs sm:text-sm">Edit</th>
                <th className="px-4 py-2 text-xs sm:text-sm">Hapus</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => {
            setShowModal(false);
            setEditMode(false);
            setFormData({ nama: "", email: "", password: "" });
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
                setFormData({ nama: "", email: "", password: "" });
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              {editMode ? "Edit Data Peserta" : "Tambah Peserta Baru"}
            </h2>
            <form
              className="space-y-4"
              onSubmit={editMode ? handleUpdate : handleSubmit}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Peserta"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Peserta"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editMode
                      ? "Biarkan kosong jika tidak ingin diubah"
                      : "Password"
                  }
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required={!editMode}
                />
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PesertaPage;
