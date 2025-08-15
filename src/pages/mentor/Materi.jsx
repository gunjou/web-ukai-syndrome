import React, { useEffect, useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import icon_folder from "../../assets/icon_folder.png";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import MateriListContent from "./MateriListContent";
import Api from "../../utils/Api"; // menggunakan instance axios
import { Map } from "mapbox-gl";

// Komponen untuk daftar folder modul
const MateriList = ({
  onFolderClick,
  onEditClick,
  onUpdate,

  onChangeVisibility,
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
  }, [onUpdate]); // Depend on onUpdate to trigger re-fetch when data is updated

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
          <div className="mt-2 text-center px-2 flex-1 flex items-center justify-center ">
            <span className="text-gray-700 font-medium text-base capitalize ">
              {modul.judul}
            </span>
          </div>
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the onClick for the folder
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
              className={`text-sm px-2 py-1 rounded-md font-medium border
      ${
        modul.visibility === "open"
          ? "text-green-600 border-green-400"
          : modul.visibility === "hold"
          ? "text-yellow-600 border-yellow-400"
          : "text-red-600 border-red-400"
      }`}
            >
              <option value="open" className="text-green-600">
                Open
              </option>
              <option value="hold" className="text-yellow-600">
                Hold
              </option>
              <option value="close" className="text-red-600">
                Close
              </option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

// Komponen untuk menampilkan konten materi
const FolderContent = () => {
  return <MateriListContent />;
};

// Komponen utama
const Materi = () => {
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const [modulItems, setModulItems] = useState([]); // state untuk modul
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // state untuk error
  const [editFolder, setEditFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { folder } = useParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [kelasOptions, setKelasOptions] = useState([]);

  const basePath = "/mentor-dashboard/materi";
  const pathSegments = location.pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);

  useEffect(() => {
    const fetchKelasOptions = async () => {
      try {
        const response = await Api.get("/paket-kelas");
        setKelasOptions(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil daftar kelas:", error);
      }
    };

    fetchKelasOptions();
  }, []);

  const handleFolderClick = (folderName) => {
    const slug = folderName.toLowerCase().replace(/\s+/g, "-");
    setBackStack((prev) => [...prev, location.pathname]);
    setForwardStack([]);
    navigate(`${basePath}/${slug}`);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      navigate(basePath);
    } else {
      const to = `${basePath}/${pathSegments.slice(0, index + 1).join("/")}`;
      navigate(to);
    }
  };

  // Handle Edit Folder Button Click
  const handleEditClick = (folder) => {
    setEditFolder(folder);
    setNewFolderName(folder.judul);
    setNewDescription(folder.deskripsi || "");
    setNewOrder(folder.urutan_modul || 0);
  };

  // Handle Edit Form Submit with loading state
  const handleModulUpdate = async () => {
    setLoading(true);
    try {
      const response = await Api.get("/modul"); // Mengambil ulang data modul
      setModulItems(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat modul.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (newFolderName.trim() === "") return; // Validate the name

    setLoading(true); // Set loading to true before API call

    const payload = {
      id_paketkelas: editFolder.id_paketkelas,
      judul: newFolderName,
      deskripsi: newDescription,
      urutan_modul: newOrder,
    };

    try {
      const response = await Api.put(`/modul/${editFolder.id_modul}`, payload); // Update folder
      console.log("Folder updated successfully:", response.data);

      // After successful edit, update the list
      handleModulUpdate();

      // Reset form state
      setEditFolder(null);
      setNewFolderName("");
      setNewDescription("");
      setNewOrder(0);
    } catch (err) {
      console.error("Failed to update folder:", err);
    } finally {
      setLoading(false); // Set loading to false after the request is complete
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
      console.error("Gagal mengubah visibility:", error);
      alert("Gagal mengubah status modul.");
    }
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !newFolderName ||
      !newDescription ||
      !newOrder ||
      !editFolder?.id_paketkelas
    ) {
      alert("Harap lengkapi semua field.");
      return;
    }

    const payload = {
      judul: newFolderName,
      deskripsi: newDescription,
      urutan_modul: newOrder,
      id_paketkelas: editFolder.id_paketkelas,
    };

    setLoading(true);
    try {
      await Api.post("/modul", payload);
      await handleModulUpdate(); // refresh modul
      setShowAddModal(false);
      setNewFolderName("");
      setNewDescription("");
      setNewOrder(0);
      setEditFolder(null);
    } catch (error) {
      console.error("Gagal menambah modul:", error);
      alert("Gagal menambah modul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full h-auto h-p-6">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Materi Explorer</h1>
          {/* Tombol Navigasi */}
          <div className="flex items-center gap-3">
            {location.pathname === basePath && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                Tambah Modul
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
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] transition ${
                backStack.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
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
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] transition ${
                forwardStack.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Forward
              <HiArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Breadcrumb Path */}
        <div className="text-sm text-gray-700 mb-6 flex items-center flex-wrap">
          <span className="font-semibold mr-2">Path:</span>
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-blue-600 hover:underline mr-1"
          >
            Materi
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

        {/* Konten berdasarkan Route */}
        <Routes>
          <Route
            path="/"
            element={
              <MateriList
                onFolderClick={handleFolderClick}
                onEditClick={handleEditClick}
                onUpdate={handleModulUpdate}
                modulItems={modulItems}
                onChangeVisibility={handleVisibilityChange}
              />
            }
          />
          <Route path=":folder" element={<FolderContent />} />
        </Routes>
      </div>

      {/* Edit Modal */}
      {editFolder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Folder</h3>
            <form onSubmit={handleEditSubmit}>
              {/* Folder Name Input */}
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter new folder name"
              />
              {/* Description Input */}
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter folder description"
              />
              {/* Order Input */}
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter module order"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditFolder(null)}
                  className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading} // Disable button when loading is true
                  className={`px-4 py-2 rounded-md ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {loading ? (
                    <span className="flex justify-center items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Tambah Modul</h3>
            <form onSubmit={handleAddSubmit}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Judul Modul"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Deskripsi"
              />
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Urutan Modul"
              />
              <select
                value={editFolder?.id_paketkelas || ""}
                onChange={(e) =>
                  setEditFolder({
                    ...editFolder,
                    id_paketkelas: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasOptions.map((kelas) => (
                  <option key={kelas.id_paketkelas} value={kelas.id_paketkelas}>
                    {kelas.nama_kelas}
                  </option>
                ))}
              </select>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {loading ? "Loading..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Materi;
