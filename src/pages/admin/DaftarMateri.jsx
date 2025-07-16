import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { AiOutlinePlus, AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { AiOutlinePlayCircle, AiOutlineFile } from "react-icons/ai";

import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx";

const DaftarMateri = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [materiData, setMateriData] = useState([]);
  const [modulOptions, setModulOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    judul: "",
    tipe_materi: "",
    url_file: "",
    id_modul: "",
    viewer_only: false, // Field viewer_only
  });

  useEffect(() => {
    fetchMateriData();
    fetchModulOptions();
  }, []);

  const fetchMateriData = async () => {
    try {
      const response = await Api.get("/materi");
      setMateriData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data materi:", error);
    }
  };

  const fetchModulOptions = async () => {
    try {
      const response = await Api.get("/modul");
      setModulOptions(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data modul:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = materiData.filter((materi) =>
    materi.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { judul, tipe_materi, url_file, id_modul, viewer_only } = formData;
    if (!judul || !tipe_materi || !url_file || !id_modul) {
      alert("Harap lengkapi semua field.");
      return;
    }
    setIsSubmitting(true);
    try {
      const postData = {
        judul,
        tipe_materi,
        url_file,
        id_modul,
        viewer_only, // Pastikan field viewer_only dikirim
      };
      await Api.post("/materi", postData);
      alert("Materi berhasil ditambahkan!");
      setShowModal(false);
      setFormData({
        judul: "",
        tipe_materi: "",
        url_file: "",
        id_modul: "",
        viewer_only: false,
      });
      fetchMateriData();
    } catch (error) {
      console.error("Gagal menambahkan materi:", error);
      alert("Gagal menambahkan materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (materi) => {
    setFormData({
      judul: materi.judul,
      tipe_materi: materi.tipe_materi,
      url_file: materi.url_file,
      id_modul: materi.id_modul,
      viewer_only: materi.viewer_only || false, // Mengambil data viewer_only dari materi yang akan diedit
    });
    setSelectedId(materi.id_materi);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { judul, tipe_materi, url_file, id_modul, viewer_only } = formData;
    if (!judul || !tipe_materi || !url_file || !id_modul) {
      alert("Harap lengkapi semua field.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedData = {
        judul,
        tipe_materi,
        url_file,
        id_modul,
        viewer_only,
      };
      await Api.put(`/materi/${selectedId}`, updatedData);
      alert("Materi berhasil diperbarui!");
      setShowModal(false);
      setEditMode(false);
      setFormData({
        judul: "",
        tipe_materi: "",
        url_file: "",
        id_modul: "",
        viewer_only: false,
      });
      fetchMateriData();
    } catch (error) {
      console.error("Gagal memperbarui materi:", error);
      alert("Gagal memperbarui materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus materi ini?")) return;
    try {
      await Api.delete(`/materi/${id}`);
      alert("Materi berhasil dihapus.");
      fetchMateriData();
    } catch (error) {
      console.error("Gagal menghapus materi:", error);
      alert("Gagal menghapus materi.");
    }
  };

  const handleVisibilityChange = async (id, newStatus) => {
    try {
      await Api.put(`/materi/${id}/visibility`, { visibility: newStatus });
      // Update lokal
      setMateriData((prev) =>
        prev.map((materi) =>
          materi.id_materi === id
            ? { ...materi, visibility: newStatus }
            : materi
        )
      );
    } catch (error) {
      console.error("Gagal mengubah visibility:", error);
      alert("Gagal mengubah status modul.");
    }
  };

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
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 relative">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center py-2 px-8 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            className="border rounded-lg px-4 py-2 w-2/5 sm:w-1/6"
          />
          <h1 className="text-xl font-bold sm:text-left w-full sm:w-auto">
            Daftar Materi
          </h1>
          <div className="flex justify-end w-full sm:w-1/4">
            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setFormData({
                  judul: "",
                  tipe_materi: "",
                  url_file: "",
                  id_modul: "",
                  viewer_only: false, // Reset viewer_only saat menambahkan materi baru
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
            >
              <AiOutlinePlus /> Tambah Materi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="min-w-full bg-white">
            <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-sm">Judul</th>
                <th className="px-4 py-2 text-sm">Tipe</th>
                <th className="px-4 py-2 text-sm">URL</th>
                <th className="px-4 py-2 text-sm">Modul</th>
                <th className="px-4 py-2 text-sm">Status</th>
                <th className="px-4 py-2 text-sm">Edit</th>
                <th className="px-4 py-2 text-sm">Hapus</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((materi, index) => (
                <tr key={index} className="bg-gray-100">
                  <td className="px-4 py-2 text-sm border">{materi.judul}</td>
                  <td className="px-4 py-2 text-sm border">
                    {materi.tipe_materi}
                  </td>
                  {/* <td className="px-4 py-2 text-sm border">
                    <div className="flex justify-center gap-2">
                      <a
                        href={materi.url_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center bg-gray-200 pl-2 rounded-full hover:bg-blue-500 hover:text-white items-center gap-2 py-1 px-3"
                      >
                        <div className="bg-blue-500 rounded-full px-2 py-2">
                          <AiOutlineEye className="text-white font-extrabold" />
                        </div>
                        Lihat File
                      </a>
                    </div>
                  </td> */}
                  <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
                    <div className="flex justify-center gap-2">
                      <a
                        href={materi.url_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex justify-center bg-gray-200 pl-2 rounded-full items-center gap-2 
                        ${
                          materi.tipe_materi === "video"
                            ? "hover:bg-red-500 hover:text-white"
                            : "hover:bg-blue-500 hover:text-white"
                        }`}
                      >
                        Lihat
                        <div
                          className={`rounded-r-full px-2 py-2 ${
                            materi.tipe_materi === "video"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {/* Kondisi untuk menentukan ikon berdasarkan tipe materi */}
                          {materi.tipe_materi === "video" ? (
                            <AiOutlinePlayCircle className="text-white" />
                          ) : (
                            <AiOutlineFile className="text-white" />
                          )}
                        </div>
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm border">
                    {materi.judul_modul}
                  </td>
                  <td className="px-4 py-2 text-sm border flex justify-center">
                    <select
                      value={materi.visibility}
                      onChange={(e) =>
                        handleVisibilityChange(materi.id_materi, e.target.value)
                      }
                      className={`capitalize font-semibold rounded-md px-2 py-1
      ${
        materi.visibility === "open"
          ? "text-green-600"
          : materi.visibility === "hold"
          ? "text-yellow-600"
          : materi.visibility === "close"
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
                        onClick={() => handleEdit(materi)}
                        className="flex justify-center bg-gray-200 pl-2 rounded-full hover:bg-blue-500 hover:text-white items-center gap-2"
                      >
                        Edit
                        <div className="bg-blue-500 rounded-r-full px-2 py-2">
                          <LuPencil className="text-white" />
                        </div>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(materi.id_materi)}
                        className="flex justify-center bg-gray-200 pl-2 rounded-full hover:bg-red-500 hover:text-white items-center gap-2"
                      >
                        Hapus
                        <div className="bg-red-500 rounded-r-full px-2 py-2">
                          <AiOutlineClose className="text-white" />
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-full sm:w-3/4 md:w-1/2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editMode ? "Edit Materi" : "Tambah Materi"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>
            <form
              onSubmit={editMode ? handleUpdate : handleSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                name="judul"
                placeholder="Judul Materi"
                value={formData.judul}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <select
                name="tipe_materi"
                value={formData.tipe_materi}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">-- Pilih Tipe Materi --</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
              <input
                type="text"
                name="url_file"
                placeholder="URL File"
                value={formData.url_file}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <select
                name="id_modul"
                value={formData.id_modul}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">-- Pilih Modul --</option>
                {modulOptions.map((modul) => (
                  <option key={modul.id_modul} value={modul.id_modul}>
                    {modul.judul}
                  </option>
                ))}
              </select>

              {/* Checkbox untuk viewer_only */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="viewer_only"
                    checked={formData.viewer_only}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Materi hanya untuk viewer
                </label>
              </div>

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

export default DaftarMateri;
