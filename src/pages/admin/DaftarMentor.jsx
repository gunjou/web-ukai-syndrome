import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

const DaftarMentor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const response = await Api.get("/mentor");
      setUserData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = userData.filter((user) =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Api.post("/mentor", formData);
      alert("Mentor berhasil ditambahkan!");
      setShowModal(false);
      setFormData({ nama: "", email: "", password: "" });
      fetchMentorData();
    } catch (error) {
      console.error("Gagal menambahkan mentor:", error);
      alert("Gagal menambahkan mentor. Silakan coba lagi.");
    }
  };

  const handleEdit = (mentor) => {
    setFormData({
      nama: mentor.nama,
      email: mentor.email,
      password: "", // kosongkan password saat edit
    });
    setSelectedId(mentor.id_user); // gunakan id_user
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (!formData.password) {
        delete dataToSend.password; // jangan kirim password jika kosong
      }

      await Api.put(`/mentor/${selectedId}`, dataToSend);
      alert("Data mentor berhasil diperbarui!");
      setShowModal(false);
      setEditMode(false);
      setFormData({ nama: "", email: "", password: "" });
      fetchMentorData();
    } catch (error) {
      console.error("Gagal memperbarui mentor:", error);
      alert("Gagal memperbarui mentor.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus mentor ini?")) return;
    try {
      await Api.delete(`/mentor/${id}`);
      alert("Mentor berhasil dihapus.");
      fetchMentorData();
    } catch (error) {
      console.error("Gagal menghapus mentor:", error);
      alert("Gagal menghapus mentor.");
    }
  };

  const renderTableRows = () =>
    filteredData.map((user, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border-b border-r border-l capitalize">
          {user.nama}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-left text-gray-800 border-b border-r">
          {user.email}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-left text-gray-800 border-b border-r">
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
          <h1 className="flex justify-center items-center text-xl font-bold sm:text-left w-full sm:w-auto">
            Mentor Ukai Syndrome
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
              Tambah Mentor
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
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
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
              {editMode ? "Edit Mentor" : "Tambah Mentor Baru"}
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
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Nama Mentor"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Mentor"
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
                  required={!editMode}
                  placeholder={
                    editMode
                      ? "Biarkan kosong jika tidak ingin diubah"
                      : "Password"
                  }
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

export default DaftarMentor;
