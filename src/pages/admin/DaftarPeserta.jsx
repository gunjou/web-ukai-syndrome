import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "../../components/admin/Header.jsx";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";
import TambahPesertaForm from "./modal/TambahPesertaForm.jsx";
import UploadPesertaBulk from "./modal/UploadPesertaBulk.jsx";
import EditPesertaForm from "./modal/EditPesertaForm.jsx";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";
import { toast } from "react-toastify";

const DaftarPeserta = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("single"); // tab aktif

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // state untuk sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return; // guard StrictMode (dev) agar hanya sekali
    didFetch.current = true;
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await Api.get("/peserta");
      // const { data } = await Api.get("/peserta/aktif");

      // SALIN dulu, baru sort (hindari mutasi)
      const sorted = [...data].sort((a, b) =>
        (a.nama ?? "").localeCompare(b.nama ?? "", "id", {
          sensitivity: "base",
        })
      );

      // (opsional) deduplicate berdasarkan id_user untuk amankan render
      const deduped = Array.from(
        new Map(sorted.map((u) => [u.id_user, u])).values()
      );

      setUserData(deduped);
    } catch (err) {
      setError("Gagal mengambil data peserta.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // fungsi handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // toggle asc <-> desc
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔎 Search lebih luas (nama, email, hp, batch, kelas)
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return userData.filter((user) =>
      [
        user.nama,
        user.email,
        user.no_hp,
        user.nama_batch,
        user.nama_kelas,
        user.nama_paket,
      ].some((v) => (v ?? "").toLowerCase().includes(k))
    );
  }, [userData, searchTerm]);

  // apply sort ke filteredData
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key] || "";
    const valB = b[sortConfig.key] || "";
    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB, "id", { sensitivity: "base" })
      : valB.localeCompare(valA, "id", { sensitivity: "base" });
  });

  const handleEdit = (user) => {
    setEditData(user);
    // setSelectedId(user.id_user);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    ConfirmToast("Yakin ingin menghapus peserta ini?", async () => {
      await Api.delete(`/peserta/${id}`);
      toast.success("Peserta berhasil dihapus.");
      fetchUsers();
    });
  };

  const renderTableRows = () =>
    sortedData.map((user, index) => (
      <tr key={user.id_user || index} className="bg-gray-100 hover:bg-gray-300">
        <td className="px-2 py-2 text-xs sm:text-sm border text-center">
          {index + 1}
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border capitalize">
          {user.nama}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border">{user.email}</td>
        <td className="px-2 py-2 text-xs sm:text-sm border">
          {user.kode_pemulihan}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border">
          {user.no_hp || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border">
          {user.nama_batch || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border">
          {user.nama_paket || "-"}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm border">
          {user.nama_kelas || "-"}
        </td>
        {/* Kolom aksi */}
        <td className="px-4 py-2 text-xs sm:text-sm border w-[80px]">
          <div className="flex justify-center gap-2">
            {/* Tombol Edit */}
            <div className="relative group">
              <button
                onClick={() => handleEdit(user)}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LuPencil className="w-4 h-4" />
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                Edit data
              </span>
            </div>

            {/* Tombol Hapus */}
            <div className="relative group">
              <button
                onClick={() => handleDelete(user.id_user)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <BsTrash3 className="w-4 h-4" />
              </button>
              {/* Tooltip */}
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
        className="absolute bottom-0 left-0 pt-[90px] h-full w-auto opacity-40 rotate-180 z-0"
        alt=""
      />
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        <div className="grid grid-cols-3 items-center py-2 px-8 gap-4">
          {/* Kolom kiri (Search) */}
          <div className="flex justify-start">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari peserta..."
              className="border rounded-lg px-4 py-2 w-full sm:w-48"
            />
          </div>

          {/* Kolom tengah (Judul) */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-center">
              Peserta Ukai Syndrome
            </h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                // setFormData({ nama: "", email: "", password: "" });
              }}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl shadow-md flex items-center gap-2"
            >
              <AiOutlinePlus size={18} /> Tambah Peserta
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data peserta...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">{error}</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white border">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="bg-gray-200 text-xs sm:text-sm">
                  <th className="px-2 py-2 border">No</th>
                  <th
                    onClick={() => handleSort("nama")}
                    className="px-4 py-2 border cursor-pointer"
                  >
                    Nama{" "}
                    {sortConfig.key === "nama"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    className="px-4 py-2 border cursor-pointer"
                  >
                    Email{" "}
                    {sortConfig.key === "email"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th className="px-4 py-2 border">Token</th>
                  <th className="px-4 py-2 border">No HP</th>
                  <th
                    onClick={() => handleSort("nama_batch")}
                    className="px-4 py-2 border cursor-pointer"
                  >
                    Batch{" "}
                    {sortConfig.key === "nama_batch"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("nama_paket")}
                    className="px-4 py-2 border cursor-pointer"
                  >
                    Paket{" "}
                    {sortConfig.key === "nama_paket"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("nama_kelas")}
                    className="px-4 py-2 border cursor-pointer"
                  >
                    Kelas{" "}
                    {sortConfig.key === "nama_kelas"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
        <p className="pl-4 pt-2 text-xs font-semibold text-blue-600">
          <sup>*</sup>Jumlah Peserta: {userData.length} orang
        </p>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          onClick={() => {
            setShowModal(false);
            setEditMode(false);
            // setFormData({ nama: "", email: "", password: "" });
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down my-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol close */}
            <button
              onClick={() => {
                setShowModal(false);
                setEditMode(false);
                // setFormData({ nama: "", email: "", password: "" });
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Kalau EDIT → langsung form edit */}
            {editMode && editData ? (
              <EditPesertaForm
                setShowModal={setShowModal}
                setEditMode={setEditMode}
                fetchUsers={fetchUsers}
                initialData={editData}
              />
            ) : (
              <>
                {/* Kalau TAMBAH → ada Tab */}
                <div className="flex border-b mb-4">
                  <button
                    className={`flex-1 py-2 text-center font-medium ${
                      activeTab === "single"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab("single")}
                  >
                    Tambah Peserta
                  </button>
                  <button
                    className={`flex-1 py-2 text-center font-medium ${
                      activeTab === "bulk"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab("bulk")}
                  >
                    Upload Bulk
                  </button>
                </div>

                {activeTab === "single" ? (
                  <TambahPesertaForm
                    setShowModal={setShowModal}
                    fetchUsers={fetchUsers}
                  />
                ) : (
                  <UploadPesertaBulk
                    setShowModal={setShowModal}
                    fetchUsers={fetchUsers}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPeserta;
