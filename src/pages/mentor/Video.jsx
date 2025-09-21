//untuk mentor
import React, { useEffect, useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import icon_folder from "../../assets/icon_folder.png";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { toast } from "react-toastify";
import VideoListContent from "./VideoListContent";
import Api from "../../utils/Api";

// Komponen daftar folder
const VideoList = ({
  modulItems,
  onFolderClick,
  onEditClick,
  onChangeVisibility,
}) => {
  if (!modulItems.length) return <div className="p-4">Belum ada modul.</div>;

  return (
    <div className="flex flex-wrap gap-6 p-4">
      {modulItems.map((modul, idx) => (
        <div
          key={idx}
          className="relative bg-white w-[165px] h-[135px] shadow border border-gray-200 rounded-lg cursor-pointer flex flex-col items-center pt-10 capitalize"
          onClick={() => onFolderClick(modul)}
        >
          <img
            src={icon_folder}
            alt="Folder Icon"
            className="w-auto h-[5rem] absolute -top-5 left-1/2 transform -translate-x-1/2"
          />
          <div className="mt-4 text-center px-2 flex-1 flex items-center justify-center">
            <span
              className="text-gray-700 font-bold text-sm capitalize line-clamp-2 overflow-hidden text-ellipsis"
              title={modul.judul}
            >
              {modul.judul}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(modul);
            }}
            className="absolute top-2 right-2 text-xs text-blue-500"
          >
            Edit
          </button>

          {/* Select visibility */}
          <div className="mt-1 pb-1">
            <select
              value={modul.visibility}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                onChangeVisibility(modul.id_modul, e.target.value)
              }
              className={`text-sm px-2 py-1 rounded-md font-medium border ${
                modul.visibility === "open"
                  ? "text-green-600 border-green-400"
                  : modul.visibility === "hold"
                  ? "text-yellow-600 border-yellow-400"
                  : "text-red-600 border-red-400"
              }`}
            >
              <option value="open">Open</option>
              <option value="hold">Hold</option>
              <option value="close">Close</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

const FolderContent = () => {
  return <VideoListContent />;
};

const Video = () => {
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const [error, setError] = useState("");
  const [modulItems, setModulItems] = useState([]);
  const [editFolder, setEditFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMateriModal, setShowAddMateriModal] = useState(false);

  const [judul, setJudul] = useState("");
  const [urlFile, setUrlFile] = useState("");
  const [visibility, setVisibility] = useState("hold");

  const navigate = useNavigate();
  const location = useLocation();
  const { folder } = useParams();
  const basePath = "/mentor-dashboard/video";
  const pathSegments = location.pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);

  useEffect(() => {
    const id = localStorage.getItem("kelas");
    if (id) {
      fetchModul(id);
    }
  }, []);

  const fetchModul = async (id_paketkelas) => {
    try {
      setLoading(true);
      const response = await Api.get(`/modul/mentor/${id_paketkelas}`);
      setModulItems(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat modul.");
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (modul) => {
    const slug = modul.judul.toLowerCase().replace(/\s+/g, "-");
    setBackStack((prev) => [...prev, location.pathname]);
    setForwardStack([]);
    // simpan modul id ke localStorage supaya VideoListContent bisa ambil
    localStorage.setItem("activeModulId", modul.id_modul);
    navigate(`${basePath}/${slug}`);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) navigate(basePath);
    else {
      const to = `${basePath}/${pathSegments.slice(0, index + 1).join("/")}`;
      navigate(to);
    }
  };

  const handleModulUpdate = async () => {
    try {
      const res = await Api.get("/modul");
      setModulItems(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat modul.");
    }
  };

  const handleEditClick = (folder) => {
    setEditFolder(folder);
    setNewFolderName(folder.judul);
    setNewDescription(folder.deskripsi || "");
    setVisibility(folder.visibility);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (newFolderName.trim() === "") {
      toast.warning("Judul modul tidak boleh kosong ⚠️", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    const payload = {
      id_paketkelas: editFolder.id_paketkelas,
      judul: newFolderName,
      deskripsi: newDescription,
      visibility,
    };

    try {
      await Api.put(`/modul/${editFolder.id_modul}`, payload);
      await handleModulUpdate();

      toast.success("Modul berhasil diperbarui ✅", {
        position: "top-right",
        autoClose: 3000,
      });

      setEditFolder(null);
      setNewFolderName("");
      setNewDescription("");
      setVisibility("");
    } catch (err) {
      console.error("Failed to update folder:", err);
      const msg = err?.response?.data?.message || "Gagal memperbarui modul ❌";
      toast.error(msg, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = async (id_modul, newVisibility) => {
    try {
      await Api.put(`/modul/${id_modul}/visibility`, {
        visibility: newVisibility,
      });

      setModulItems((prev) =>
        prev.map((modul) =>
          modul.id_modul === id_modul
            ? { ...modul, visibility: newVisibility }
            : modul
        )
      );

      toast.success(
        `Visibility berhasil diubah ke ${newVisibility.toUpperCase()}`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (error) {
      console.error("Gagal mengubah visibility:", error);
      toast.error("Gagal mengubah visibility", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.warning("Harap isi judul modul ⚠️", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const payload = {
      judul: newFolderName.trim(),
      deskripsi: newDescription?.trim() || "",
      visibility: "open",
    };

    setLoading(true);
    try {
      await Api.post("/modul/mentor", payload);
      await handleModulUpdate();
      toast.success("Modul berhasil ditambahkan ✅", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowAddModal(false);
      setNewFolderName("");
      setNewDescription("");
    } catch (error) {
      console.error("Gagal menambah modul:", error);
      const msg =
        error?.response?.data?.message ||
        "Gagal menambah modul. Silakan coba lagi.";
      toast.error(`❌ ${msg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // helper validasi video
  const isValidVideoUrl = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes("drive.google.com") ||
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg")
    );
  };

  const handleAddMateriSubmit = async (e) => {
    e.preventDefault();

    const activeModulId = localStorage.getItem("activeModulId");

    if (!judul.trim()) {
      toast.warning("Judul materi tidak boleh kosong ⚠️", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!isValidVideoUrl(urlFile)) {
      toast.error(
        "❌ URL tidak valid. Gunakan link .mp4, .webm, .ogg atau Google Drive",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
      return;
    }

    setLoading(true);

    const payload = {
      id_modul: activeModulId,
      judul,
      tipe_materi: "video",
      url_file: urlFile,
      visibility: "open",
    };

    try {
      await Api.post("/materi/mentor", payload);
      toast.success("Materi berhasil ditambahkan ✅", {
        position: "top-right",
        autoClose: 3000,
      });
      setJudul("");
      setUrlFile("");
      setShowAddMateriModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Gagal menambah materi:", error);
      toast.error("Gagal menambah materi ❌", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full h-auto h-p-6">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Video Explorer</h1>
          <div className="flex items-center gap-3">
            {location.pathname === basePath ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                Tambah Modul
              </button>
            ) : (
              <button
                onClick={() => setShowAddMateriModal(true)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                Tambah Materi
              </button>
            )}

            <button
              onClick={() => {
                if (backStack.length > 0) {
                  const last = backStack[backStack.length - 1];
                  setBackStack((prev) => prev.slice(0, -1));
                  setForwardStack((prev) => [location.pathname, ...prev]);
                  navigate(last);
                }
              }}
              disabled={backStack.length === 0}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] ${
                backStack.length === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <HiArrowLeft className="text-lg" />
              Back
            </button>

            <button
              onClick={() => {
                if (forwardStack.length > 0) {
                  const next = forwardStack[0];
                  setForwardStack((prev) => prev.slice(1));
                  setBackStack((prev) => [...prev, location.pathname]);
                  navigate(next);
                }
              }}
              disabled={forwardStack.length === 0}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] ${
                forwardStack.length === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Forward
              <HiArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-700 mb-6 flex items-center flex-wrap">
          <span className="font-semibold mr-2">Path:</span>
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-blue-600 hover:underline mr-1"
          >
            Video
          </button>
          {pathSegments.map((seg, index) => (
            <span key={index} className="flex items-center">
              <span className="mx-1">/</span>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-blue-600 hover:underline"
              >
                {seg
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </button>
            </span>
          ))}
        </div>

        {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <VideoList
                  onFolderClick={handleFolderClick}
                  onEditClick={handleEditClick}
                  onChangeVisibility={handleVisibilityChange}
                  modulItems={modulItems}
                />
              }
            />
            <Route path=":folder" element={<FolderContent />} />
          </Routes>
        )}
      </div>

      {/* Edit Modal */}
      {editFolder && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setEditFolder(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditFolder(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Modul</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <label className="text-gray-900 text-sm">
                Judul Modul
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  placeholder="Masukkan judul modul"
                  required
                />
              </label>
              <label className="text-gray-900 text-sm">
                Deskripsi
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  placeholder="Masukkan deskripsi modul"
                />
              </label>
              <label className="text-gray-900 text-sm">
                Visibility
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className={`w-full p-2 rounded-md mt-1 border font-medium ${
                    visibility === "open"
                      ? "text-green-600 border-green-400"
                      : visibility === "hold"
                      ? "text-yellow-600 border-yellow-400"
                      : "text-red-600 border-red-400"
                  }`}
                >
                  <option value="open">Open</option>
                  <option value="hold">Hold</option>
                  <option value="close">Close</option>
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditFolder(null)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Modul */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Tambah Modul</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Judul Modul"
                required
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Deskripsi Modul"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Materi */}
      {showAddMateriModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowAddMateriModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddMateriModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Tambah Materi</h3>
            <form onSubmit={handleAddMateriSubmit} className="space-y-4">
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Judul Materi"
                required
              />
              <input
                type="text"
                value={urlFile}
                onChange={(e) => setUrlFile(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="URL atau Path File"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMateriModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
