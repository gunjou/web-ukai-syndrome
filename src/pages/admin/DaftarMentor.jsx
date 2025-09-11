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

const DaftarMentor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    fetchMentorData();
  }, []);

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

  const renderTableRows = () =>
    filteredData.map((user, index) => (
      <tr key={user.id_user || index} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border capitalize">
          {user.nama}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.email}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.no_hp || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.nama_kelas || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.nama_paket || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-gray-800 border">
          {user.nama_batch || "-"}
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
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
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
                  <th className="px-4 py-2 border">Nama</th>
                  <th className="px-2 py-2 border">Email</th>
                  <th className="px-2 py-2 border">No HP</th>
                  <th className="px-2 py-2 border">Kelas</th>
                  <th className="px-2 py-2 border">Paket</th>
                  <th className="px-2 py-2 border">Batch</th>
                  <th className="px-4 py-2 border">Aksi</th>
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
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
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
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setEditModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
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
    </div>
  );
};

export default DaftarMentor;
