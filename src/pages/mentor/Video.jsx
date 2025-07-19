import React, { useEffect, useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import icon_folder from "../../assets/icon_folder.svg";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import VideoListContent from "./VideoListContent";
import Api from "../../utils/Api";

// Komponen daftar folder
const VideoList = ({
  onFolderClick,
  onEditClick,
  onChangeVisibility,
  onUpdate,
}) => {
  const [modulItems, setModulItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModul = async () => {
      try {
        const response = await Api.get("/modul");
        setModulItems(response.data.data || []);
      } catch (err) {
        setError("Gagal memuat modul.");
      } finally {
        setLoading(false);
      }
    };
    fetchModul();
  }, [onUpdate]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-wrap gap-6 p-4">
      {modulItems.map((modul, idx) => (
        <div
          key={idx}
          className="relative bg-white w-[160px] h-[120px] shadow border border-gray-200 rounded-lg cursor-pointer flex flex-col items-center pt-10 capitalize"
          onClick={() => onFolderClick(modul.judul)}
        >
          <img
            src={icon_folder}
            alt="Folder Icon"
            className="w-auto h-[5rem] absolute -top-5 left-1/2 transform -translate-x-1/2"
          />
          <div className="mt-2 text-center px-2 flex-1 flex items-center justify-center">
            <span className="text-gray-700 font-medium text-base capitalize">
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

          <div className="mt-1">
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
  const [modulItems, setModulItems] = useState([]);
  const [editFolder, setEditFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { folder } = useParams();
  const basePath = "/mentor-dashboard/video";
  const pathSegments = location.pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);

  const handleFolderClick = (folderName) => {
    const slug = folderName.toLowerCase().replace(/\s+/g, "-");
    setBackStack((prev) => [...prev, location.pathname]);
    setForwardStack([]);
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
    setNewOrder(folder.urutan_modul || 0);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;

    setLoading(true);
    const payload = {
      id_paketkelas: editFolder.id_paketkelas,
      judul: newFolderName,
      deskripsi: newDescription,
      urutan_modul: newOrder,
    };

    try {
      await Api.put(`/modul/${editFolder.id_modul}`, payload);
      await handleModulUpdate();
      setEditFolder(null);
      setNewFolderName("");
      setNewDescription("");
      setNewOrder(0);
    } catch (err) {
      console.error("Gagal update modul.");
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
    } catch (error) {
      console.error("Gagal mengubah visibility.");
    }
  };

  return (
    <div className="bg-white w-full h-auto h-p-6">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Video Explorer</h1>

          <div className="flex items-center gap-3">
            {location.pathname === basePath && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                + Tambah Modul
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
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
                  : "bg-blue-500 text-white hover:bg-blue-600"
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

        <Routes>
          <Route
            path="/"
            element={
              <VideoList
                onFolderClick={handleFolderClick}
                onEditClick={handleEditClick}
                onChangeVisibility={handleVisibilityChange}
                onUpdate={handleModulUpdate}
              />
            }
          />
          <Route path=":folder" element={<FolderContent />} />
        </Routes>
      </div>

      {/* Modal Edit */}
      {editFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Modul</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2 border mb-4 rounded"
                placeholder="Judul"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border mb-4 rounded"
                placeholder="Deskripsi"
              />
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(parseInt(e.target.value))}
                className="w-full p-2 border mb-4 rounded"
                placeholder="Urutan"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditFolder(null)}
                  className="px-4 py-2 bg-gray-200 rounded mr-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah (opsional jika dibutuhkan nanti) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Tambah Modul</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2 border mb-4 rounded"
                placeholder="Judul"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border mb-4 rounded"
                placeholder="Deskripsi"
              />
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(parseInt(e.target.value))}
                className="w-full p-2 border mb-4 rounded"
                placeholder="Urutan"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded mr-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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

export default Video;
