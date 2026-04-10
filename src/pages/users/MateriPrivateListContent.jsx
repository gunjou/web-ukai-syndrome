// src/pages/users/MateriPrivateListContent.jsx
import React, { useEffect, useState } from "react";
import { HiDocumentText } from "react-icons/hi";
import { IoMdDownload } from "react-icons/io";
import { MdClose } from "react-icons/md";
import Api from "../../utils/Api";

const MateriPrivateListContent = ({ tipe = "document" }) => {
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [userName, setUserName] = useState("User");

  // Ambil nama user untuk Watermark
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.nama) setUserName(user.nama);
  }, []);

  // Ambil data materi private berdasarkan tipe
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Menggunakan parameter tipe (document / video)
        const response = await Api.get(
          `/kelas-private/materi-saya?tipe=${tipe}`,
        );
        setMateriList(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat materi private.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipe]);

  const getEmbedUrl = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const getDirectDownloadUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([^/]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  };

  return (
    <div className="relative text-gray-900 dark:text-gray-100 animate-fadeIn">
      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-700/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 italic text-sm">
            Menyiapkan materi eksklusif...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>
      ) : materiList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
          {materiList.map((materi) => (
            <div
              key={materi.id_materi_private}
              className="group flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm hover:border-red-500 transition-all cursor-pointer"
              onClick={() => {
                if (tipe === "document") {
                  setSelectedMateri(materi);
                  setPdfUrl(getEmbedUrl(materi.url_file));
                } else {
                  window.open(materi.url_file, "_blank");
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${tipe === "video" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
                >
                  {/* Gunakan icon yang sesuai tipe */}
                  {tipe === "video" ? (
                    <HiDocumentText className="text-blue-600 text-2xl" />
                  ) : (
                    <HiDocumentText className="text-red-600 text-2xl" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight group-hover:text-red-600 transition-colors">
                    {materi.judul}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter opacity-70">
                    Mentorship: {materi.nama_mentorship}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {materi.is_downloadable === 1 && (
                  <span className="hidden md:block text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-black uppercase">
                    Download
                  </span>
                )}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
                  <IoMdDownload size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Belum ada {tipe} private yang tersedia untuk Anda.
          </p>
        </div>
      )}

      {/* Modal PDF Viewer (Hanya untuk Document) */}
      {selectedMateri && tipe === "document" && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col animate-fadeIn"
          onContextMenu={(e) => e.preventDefault()}
          tabIndex={0}
        >
          {/* Top Bar Modal */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <div className="flex items-center gap-3">
              <HiDocumentText className="text-red-500 text-2xl" />
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate max-w-[50vw]">
                  {selectedMateri.judul}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Eksklusif Mentorship Content
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedMateri.is_downloadable === 1 && (
                <button
                  onClick={() =>
                    window.open(
                      getDirectDownloadUrl(selectedMateri.url_file),
                      "_blank",
                    )
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  <IoMdDownload size={18} /> Download
                </button>
              )}
              <button
                onClick={() => setSelectedMateri(null)}
                className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition"
              >
                <MdClose size={28} />
              </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="relative flex-1 overflow-hidden select-none bg-gray-200">
            {/* Watermark Overlay */}
            <div
              className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none opacity-[0.08] z-10"
              style={{ transform: "rotate(-25deg)" }}
            >
              {Array.from({ length: 80 }, (_, i) => (
                <span
                  key={i}
                  className="text-black font-black m-10 text-2xl whitespace-nowrap"
                >
                  {userName} - PRIVATE
                </span>
              ))}
            </div>

            {pdfUrl && (
              <iframe
                title={selectedMateri.judul}
                src={pdfUrl}
                className="w-full h-full border-none z-0"
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            )}

            {/* Block Gdrive Tools */}
            <div className="absolute top-0 right-0 w-40 h-20 bg-transparent z-20" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriPrivateListContent;
