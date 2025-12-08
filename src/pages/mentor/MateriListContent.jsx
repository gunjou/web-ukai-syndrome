import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { HiDocumentText } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import Api from "../../utils/Api";
import { pdfjs } from "react-pdf";

const MateriListContent = () => {
  const { folder } = useParams();
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [loadingChange, setLoadingChange] = useState(null); // id_materi yang sedang diproses
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState("");
  const [userName, setUserName] = useState("User"); // default

  // Ambil nama user dari localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.nama) setUserName(user.nama);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("kelas");
    if (!id) return;

    fetchData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const fetchData = async (id_paketkelas) => {
    try {
      const [materiRes, modulRes] = await Promise.all([
        Api.get(`/materi/mentor/${id_paketkelas}`), // ✅ pakai id_paketkelas
        Api.get("/modul"),
      ]);

      const materiData = materiRes.data.data || [];
      const modulData = modulRes.data.data || [];

      const selectedModul = modulData.find((modul) => {
        const slug = modul.judul.toLowerCase().replace(/\s+/g, "-");
        return slug === folder;
      });

      if (!selectedModul) {
        setMateriList([]);
        setError("Modul tidak ditemukan.");
        setLoading(false);
        return;
      }

      const filtered = materiData.filter(
        (item) =>
          item.id_modul === selectedModul.id_modul &&
          item.tipe_materi === "document"
      );

      setMateriList(filtered);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat materi.");
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const loadPdf = (url) => {
    setPdfUrl(getEmbedUrl(url));
  };

  const handleVisibilityChange = async (id_materi, newVisibility) => {
    const confirm = window.confirm(
      `Ubah status materi menjadi "${newVisibility}"?`
    );
    if (!confirm) return;

    try {
      setLoadingChange(id_materi);
      await Api.put(`/materi/${id_materi}/visibility`, {
        visibility: newVisibility,
      });

      setMateriList((prev) =>
        prev.map((m) =>
          m.id_materi === id_materi ? { ...m, visibility: newVisibility } : m
        )
      );

      toast.success("Status materi diperbarui ✓");
    } catch (err) {
      toast.error("Gagal memperbarui status");
      console.error(err);
    } finally {
      setLoadingChange(null);
    }
  };

  const handleDownloadableChange = async (id_materi, value) => {
    const teks = value === "1" ? "Bisa di-download" : "Tidak bisa";

    const confirm = window.confirm(`Ubah menjadi: ${teks}?`);
    if (!confirm) return;

    try {
      setLoadingChange(id_materi);
      await Api.put(`/materi/${id_materi}/downloadable`, {
        is_downloadable: Number(value),
      });

      setMateriList((prev) =>
        prev.map((m) =>
          m.id_materi === id_materi
            ? { ...m, is_downloadable: Number(value) }
            : m
        )
      );

      toast.success("Downloadable diperbarui ✓");
    } catch (err) {
      toast.error("Gagal memperbarui downloadable");
      console.error(err);
    } finally {
      setLoadingChange(null);
    }
  };

  return (
    <div className="p-2 relative">
      <h2 className="text-2xl font-semibold mb-4 capitalize">
        {folder?.replace(/-/g, " ")}
      </h2>

      {loading ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : materiList.length > 0 ? (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {materiList.map((materi) => (
            <div
              key={materi.id_materi}
              onClick={() => {
                setSelectedMateri(materi);
                loadPdf(materi.url_file);
              }}
              className="flex items-start gap-4 bg-white p-4 shadow rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
            >
              <HiDocumentText className="text-red-500 text-3xl flex-shrink-0 mt-1" />
              <div className="flex flex-col flex-1">
                <h3
                  className="text-lg font-semibold text-gray-800 mb-1 capitalize"
                  title={materi.judul}
                >
                  {materi.judul}
                </h3>

                {/* Row Dropdown → dibuat sejajar */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Visibility */}
                  <select
                    value={materi.visibility}
                    disabled={loadingChange === materi.id_materi}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleVisibilityChange(materi.id_materi, e.target.value)
                    }
                    className={`text-sm px-2 py-1 rounded-md font-medium border
      ${
        materi.visibility === "open"
          ? "text-green-600 border-green-400"
          : materi.visibility === "hold"
          ? "text-yellow-600 border-yellow-400"
          : "text-red-600 border-red-400"
      }
      ${
        loadingChange === materi.id_materi
          ? "opacity-50 cursor-not-allowed"
          : ""
      }
    `}
                  >
                    <option value="open">Open</option>
                    <option value="hold">Hold</option>
                    <option value="close">Close</option>
                  </select>

                  {/* Downloadable */}
                  <select
                    value={materi.is_downloadable ? 1 : 0}
                    disabled={loadingChange === materi.id_materi}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleDownloadableChange(materi.id_materi, e.target.value)
                    }
                    className={`text-sm px-2 py-1 rounded-md font-medium border
      ${
        materi.is_downloadable === 1
          ? "text-green-600 border-green-400"
          : "text-red-600 border-red-400"
      }
      ${
        loadingChange === materi.id_materi
          ? "opacity-50 cursor-not-allowed"
          : ""
      }
    `}
                  >
                    <option value={1}>Download</option>
                    <option value={0}>No Download</option>
                  </select>

                  {/* Spinner kecil */}
                  {loadingChange === materi.id_materi && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Belum ada materi untuk folder ini.</p>
      )}

      {/* Modal */}
      {selectedMateri && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center"
          onContextMenu={(e) => e.preventDefault()} // Blok klik kanan di seluruh layar
        >
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-3xl shadow-lg relative select-none">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-800 capitalize">
                {selectedMateri.judul}
              </h3>
              <button
                onClick={() => setSelectedMateri(null)}
                className="text-gray-600 hover:text-red-600"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* PDF.js Document Viewer */}
            <div
              className="relative border rounded-lg overflow-hidden select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Watermark overlay */}
              <div
                className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none capitalize"
                style={{
                  transform: "rotate(-25deg)",
                  opacity: 0.25,
                  zIndex: 10,
                }}
              >
                {Array.from({ length: 40 }, (_, i) => (
                  <span
                    key={i}
                    className="text-gray-400 font-bold select-none m-8 whitespace-nowrap"
                    style={{ fontSize: "2rem" }}
                  >
                    {userName}
                  </span>
                ))}
              </div>
              {pdfUrl && (
                <div className="relative w-full h-[500px]">
                  <iframe
                    title={selectedMateri.judul}
                    src={pdfUrl}
                    className="w-full h-[500px] border-none"
                    allow="autoplay"
                    sandbox="allow-same-origin allow-scripts allow-popups"
                    referrerPolicy="no-referrer"
                  />

                  {/* overlay transparan untuk blok tombol popup gdrive */}
                  <div className="absolute top-0 right-0 w-16 h-12 bg-transparent z-10"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriListContent;
