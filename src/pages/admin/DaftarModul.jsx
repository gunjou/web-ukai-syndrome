import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const DaftarModul = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modulData, setModulData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    urutan_modul: "",
    id_paketkelas: "",
  });

  const [kelasOptions, setKelasOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchModulData();
        await fetchKelasOptions();
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchModulData = async () => {
    try {
      const response = await Api.get("/modul");
      setModulData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data modul:", error);
    }
  };

  const fetchKelasOptions = async () => {
    try {
      const response = await Api.get("/paket-kelas");
      setKelasOptions(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = modulData.filter((modul) =>
    modul.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { judul, deskripsi, urutan_modul, id_paketkelas } = formData;
    if (!judul || !deskripsi || !urutan_modul || !id_paketkelas) {
      alert("Harap lengkapi semua field.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Api.post("/modul", formData);
      alert("Modul berhasil ditambahkan!");
      setShowModal(false);
      setFormData({
        judul: "",
        deskripsi: "",
        urutan_modul: "",
        id_paketkelas: "",
      });
      fetchModulData();
    } catch (error) {
      console.error("Gagal menambahkan modul:", error);
      alert("Gagal menambahkan modul.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (modul) => {
    setFormData({
      judul: modul.judul,
      deskripsi: modul.deskripsi,
      urutan_modul: modul.urutan_modul,
      id_paketkelas: modul.id_paketkelas,
    });
    setSelectedId(modul.id_modul);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { judul, deskripsi, urutan_modul, id_paketkelas } = formData;
    if (!judul || !deskripsi || !urutan_modul || !id_paketkelas) {
      alert("Harap lengkapi semua field.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Api.put(`/modul/${selectedId}`, formData);
      alert("Modul berhasil diperbarui!");
      setShowModal(false);
      setEditMode(false);
      setFormData({
        judul: "",
        deskripsi: "",
        urutan_modul: "",
        id_paketkelas: "",
      });
      fetchModulData();
    } catch (error) {
      console.error("Gagal memperbarui modul:", error);
      alert("Gagal memperbarui modul.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus modul ini?")) return;
    try {
      await Api.delete(`/modul/${id}`);
      alert("Modul berhasil dihapus.");
      fetchModulData();
    } catch (error) {
      console.error("Gagal menghapus modul:", error);
      alert("Gagal menghapus modul.");
    }
  };
  const handleVisibilityChange = async (id, newStatus) => {
    try {
      await Api.put(`/modul/${id}/visibility`, { visibility: newStatus });
      // Update lokal
      setModulData((prev) =>
        prev.map((modul) =>
          modul.id_modul === id ? { ...modul, visibility: newStatus } : modul
        )
      );
    } catch (error) {
      console.error("Gagal mengubah visibility:", error);
      alert("Gagal mengubah status modul.");
    }
  };

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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 relative">
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
            <h1 className="text-xl font-bold text-center">Daftar Modul</h1>
          </div>

          {/* Kolom kanan (Button) */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setFormData({
                  judul: "",
                  deskripsi: "",
                  urutan_modul: "",
                  id_paketkelas: "",
                });
              }}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Modul
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data modul...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-sm">Urutan</th>
                  <th className="px-4 py-2 text-sm capitalize">Judul</th>
                  <th className="px-4 py-2 text-sm capitalize">Deskripsi</th>
                  <th className="px-4 py-2 text-sm">Nama Kelas</th>
                  <th className="px-4 py-2 text-sm">Status</th>
                  <th className="px-4 py-2 text-sm">Edit</th>
                  <th className="px-4 py-2 text-sm">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((modul, index) => (
                  <tr key={index} className="bg-gray-100">
                    <td className="px-4 py-2 text-sm border">
                      {modul.urutan_modul}
                    </td>
                    <td className="px-4 py-2 text-sm border">{modul.judul}</td>
                    <td className="px-4 py-2 text-sm border">
                      {modul.deskripsi}
                    </td>
                    <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
                      <div
                        className={`inline-block px-3 py-1 text-white rounded-full
              ${
                modul.nama_kelas === "Premium"
                  ? "bg-[#CD7F32]"
                  : modul.nama_kelas === "Gold"
                  ? "bg-yellow-500"
                  : modul.nama_kelas === "Silver"
                  ? "bg-gray-400"
                  : modul.nama_kelas === "Diamond"
                  ? "bg-blue-700"
                  : "bg-gray-300"
              }`}
                      >
                        {modul.nama_kelas}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm border flex justify-center">
                      <select
                        value={modul.visibility}
                        onChange={(e) =>
                          handleVisibilityChange(modul.id_modul, e.target.value)
                        }
                        className={`capitalize font-semibold rounded-md px-2 py-1
      ${
        modul.visibility === "open"
          ? "text-green-600"
          : modul.visibility === "hold"
          ? "text-yellow-600"
          : modul.visibility === "close"
          ? "text-red-600"
          : "text-gray-600"
      }
    `}
                      >
                        <option className="text-green-600" value="open">
                          Open
                        </option>
                        <option className="text-yellow-600" value="hold">
                          Hold
                        </option>
                        <option className="text-red-600" value="close">
                          Close
                        </option>
                      </select>
                    </td>

                    <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(modul)}
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
                          onClick={() => handleDelete(modul.id_modul)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {editMode ? "Edit Modul" : "Tambah Modul Baru"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setFormData({
                    judul: "",
                    deskripsi: "",
                    urutan_modul: "",
                    id_paketkelas: "",
                  });
                }}
              >
                <AiOutlineClose size={20} />
              </button>
            </div>
            <form
              onSubmit={editMode ? handleUpdate : handleSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                name="judul"
                placeholder="Judul Modul"
                value={formData.judul}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <textarea
                name="deskripsi"
                placeholder="Deskripsi Modul"
                value={formData.deskripsi}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="number"
                name="urutan_modul"
                placeholder="Urutan Modul"
                value={formData.urutan_modul}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <select
                name="id_paketkelas"
                value={formData.id_paketkelas}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasOptions.map((kelas) => (
                  <option key={kelas.id_paketkelas} value={kelas.id_paketkelas}>
                    {kelas.nama_kelas}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarModul;
