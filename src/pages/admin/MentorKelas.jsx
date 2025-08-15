import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const MentorKelas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [formData, setFormData] = useState({ id_user: "", id_paketkelas: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMentor();
    fetchKelas();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await Api.get("/mentor-kelas");
      setUserData(response.data.data);
    } catch (err) {
      setError("Gagal mengambil data mentor kelas.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMentor = async () => {
    try {
      const res = await Api.get("/mentor");
      setMentorList(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data mentor", err);
      setMentorList([]);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await Api.get("/paket-kelas");
      setKelasList(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data kelas", err);
      setKelasList([]);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = userData.filter((user) =>
    user.nama_mentor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { id_user, id_paketkelas } = formData;
    if (!id_user || !id_paketkelas) return "Harap isi semua field.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return alert(validationError);

    setIsSubmitting(true);
    try {
      if (isEdit && selectedId) {
        await Api.put(`/mentor-kelas/${selectedId}`, formData);
        alert("Mentor kelas berhasil diperbarui.");
      } else {
        await Api.post("/mentor-kelas", formData);
        alert("Mentor kelas berhasil ditambahkan.");
      }
      setShowModal(false);
      setFormData({ id_user: "", id_paketkelas: "" });
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

  const handleEdit = (user) => {
    setFormData({
      id_user: user.id_user,
      id_paketkelas: user.id_paketkelas,
    });
    setSelectedId(user.id_mentorkelas);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Yakin ingin menghapus mentor ini?");
    if (!confirm) return;

    try {
      await Api.delete(`/mentor-kelas/${id}`);
      alert("Mentor berhasil dihapus.");
      fetchUsers();
    } catch (err) {
      console.error("Gagal menghapus mentor:", err);
      alert("Gagal menghapus mentor.");
    }
  };

  const renderTableRows = () =>
    filteredData.map((user, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm border capitalize">
          {user.nama_mentor}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border">{user.email}</td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border">
          <div
            className={`inline-block px-3 py-1 text-white rounded-full
              ${
                user.nama_kelas === "Premium"
                  ? "bg-[#CD7F32]"
                  : user.nama_kelas === "Gold"
                  ? "bg-yellow-500"
                  : user.nama_kelas === "Silver"
                  ? "bg-gray-400"
                  : user.nama_kelas === "Diamond"
                  ? "bg-blue-700"
                  : "bg-gray-300"
              }`}
          >
            {user.nama_kelas}
          </div>
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
              onClick={() => handleDelete(user.id_mentorkelas)}
              className="bg-gray-200 pl-2 rounded-full hover:bg-red-500 hover:text-white flex items-center gap-2"
            >
              Hapus
              <div className="bg-red-500 rounded-r-full px-2 py-2">
                <MdClose className="text-white font-extrabold" />
              </div>
            </button>
          </div>
        </td>
        {/* <td className="px-4 py-2 text-xs sm:text-sm text-center border">
          <button
            onClick={() => handleEdit(user)}
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
            onClick={() => handleDelete(user.id_mentorkelas)}
            className="bg-gray-200 pl-2 rounded-full hover:bg-red-500 hover:text-white flex items-center gap-2"
          >
            Hapus
            <div className="bg-red-500 rounded-r-full px-2 py-2">
              <MdClose className="text-white font-extrabold" />
            </div>
          </button>
        </td> */}
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
            placeholder="Cari mentor..."
            className="border rounded-lg px-4 py-2 w-2/5 sm:w-1/6"
          />
          <h1 className="text-xl font-bold text-center sm:text-left">
            Mentor Kelas
          </h1>
          <button
            onClick={() => {
              setFormData({ id_user: "", id_paketkelas: "" });
              setIsEdit(false);
              setSelectedId(null);
              setShowModal(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded-xl shadow-md flex items-center gap-2"
          >
            <AiOutlinePlus size={18} /> Tambah Mentor
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 mt-4">Memuat data...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">{error}</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-xs sm:text-sm">Nama Mentor</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Email</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Kelas</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Edit</th>
                  <th className="px-4 py-2 text-xs sm:text-sm">Hapus</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah/Edit */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => {
            setShowModal(false);
            setFormData({ id_user: "", id_paketkelas: "" });
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
                setFormData({ id_user: "", id_paketkelas: "" });
                setIsEdit(false);
                setSelectedId(null);
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              {isEdit ? "Edit Mentor Kelas" : "Tambah Mentor Kelas"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Mentor
                </label>
                <select
                  name="id_user"
                  value={formData.id_user}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Pilih Mentor</option>
                  {mentorList.map((mentor) => (
                    <option key={mentor.id_user} value={mentor.id_user}>
                      {mentor.nama} ({mentor.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Kelas
                </label>
                <select
                  name="id_paketkelas"
                  value={formData.id_paketkelas}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((kelas) => (
                    <option
                      key={kelas.id_paketkelas}
                      value={kelas.id_paketkelas}
                    >
                      {kelas.nama_kelas}
                    </option>
                  ))}
                </select>
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

export default MentorKelas;
