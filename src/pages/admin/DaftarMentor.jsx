import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/admin/Header.jsx";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import TambahMentorForm from "./modal/TambahMentorForm.jsx";
import EditMentorForm from "./modal/EditMentorForm.jsx";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import { toast } from "react-toastify";
import ListKelasModal from "./modal/ListKelasModal.jsx";

const DaftarMentor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showListKelasModal, setShowListKelasModal] = useState(false);

  useEffect(() => {
    fetchMentorData();
  }, []);

  const handleRefreshFetch = async () => fetchMentorData();

  // console.log(userData);

  const fetchMentorData = async () => {
    setFetchingData(true);
    try {
      const response = await Api.get("/mentor");
      setUserData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      // alert("Gagal mengambil data mentor.");
    } finally {
      setFetchingData(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return [...userData] // copy array biar ga mutasi state asli
      .filter((user) =>
        [
          user.nama,
          user.nickname,
          user.email,
          user.no_hp,
          user.nama_batch,
          user.nama_kelas,
          user.nama_paket,
        ].some((v) => (v ?? "").toLowerCase().includes(k))
      )
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [userData, searchTerm]);

  // contoh dipanggil dari tabel
  const handleEditClick = (mentor) => {
    setSelectedMentor(mentor);
    setEditModal(true);
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus mentor ini?", async () => {
      await Api.delete(`/mentor/${id}`);
      toast.success("Mentor berhasil dihapus.");
      fetchMentorData();
    });
  };

  const getBadgeColor = (total) => {
    if (total < 1) return "bg-blue-500/20";
    if (total <= 5) return "bg-blue-500/40";
    if (total <= 10) return "bg-blue-500/70";
    if (total <= 20) return "bg-blue-500/90";
    return "bg-blue-600"; // full solid
  };

  const handleOpenListKelasModal = (id) => {
    setSelectedId(id);
    setShowListKelasModal(true);
  };

  const renderTableRows = () =>
    filteredData.map((user, index) => (
      <tr key={user.id_user || index} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border capitalize">
          {user.nama}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border capitalize">
          {user.nickname}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.email}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.no_hp || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
          <button
            onClick={() => handleOpenListKelasModal(user.id_user)}
            className={`inline-block px-3 py-1 text-white rounded-full hover:bg-yellow-500 ${getBadgeColor(
              user.total_kelas
            )}`}
          >
            {user.total_kelas} Kelas
          </button>
        </td>
        {/* Kolom Aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[100px]">
          <div className="flex justify-center gap-2">
            <div className="relative group">
              <button
                onClick={() => handleEditClick(user)}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LuPencil className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-51 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Edit data
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => handleDelete(user.id_user)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <BsTrash3 className="w-4 h-4" />
              </button>
              <span className="absolute bottom-full z-51 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 max-h-screen relative">
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
            <h1 className="text-xl font-bold text-center">
              Mentor Ukai Syndrome
            </h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowModal(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <AiOutlinePlus size={18} />
              Tambah Mentor
            </button>
          </div>
        </div>

        {fetchingData ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data mentor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr className="text-xs sm:text-sm">
                  <th className="px-2 py-2 border">No</th>
                  <th className="px-4 py-2 border">Nama Lengkap</th>
                  <th className="px-4 py-2 border">Nama Panggilan</th>
                  <th className="px-2 py-2 border">Email</th>
                  <th className="px-2 py-2 border">No HP</th>
                  <th className="px-2 py-2 border">List Kelas</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
        <p className="pl-4 pt-2 text-xs font-semibold text-blue-600">
          <sup>*</sup>Jumlah mentor: {userData.length} orang
        </p>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <TambahMentorForm
              showModal={showModal}
              fetchMentorData={fetchMentorData}
              onSuccess={() => {
                fetchMentorData(); // refresh data mentor
                // setShowModal(false); // tutup modal
              }}
            />
          </div>
        </div>
      )}
      {editModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => setEditModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => setEditModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <EditMentorForm
              showModal={editModal}
              initialData={selectedMentor}
              fetchMentorData={fetchMentorData}
              onSuccess={() => {
                fetchMentorData(); // refresh data mentor
                setEditModal(false); // tutup modal
              }}
            />
          </div>
        </div>
      )}
      {/* Modal List Kelas */}
      {showListKelasModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowListKelasModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowListKelasModal(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <ListKelasModal
              mode="mentor"
              idTarget={selectedId}
              title="Daftar Kelas Mentor"
              onClose={() => setShowListKelasModal(false)}
              onRefresh={() => handleRefreshFetch()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarMentor;
