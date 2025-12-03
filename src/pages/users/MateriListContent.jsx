// src/pages/users/MateriListContent.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HiDocumentText } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import Api from "../../utils/Api";

const MateriListContent = () => {
  const { folder } = useParams();
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [userName, setUserName] = useState("User"); // default

  // Ambil nama user dari localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.nama) setUserName(user.nama);
  }, []);

  // Ambil data materi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiRes, modulRes] = await Promise.all([
          Api.get("/materi/web/peserta"),
          Api.get("/modul/user"),
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

    fetchData();
  }, [folder]);

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

  return (
    <div className="p-2 relative">
      <h2 className="text-2xl font-semibold mb-4 capitalize">
        {folder?.replace(/-/g, " ")}
      </h2>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
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
              <div className="flex flex-col">
                <h3
                  className="text-lg font-semibold text-gray-800 mb-1 capitalize"
                  title={materi.judul}
                >
                  {materi.judul}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Belum ada materi untuk folder ini.</p>
      )}

      {/* Modal PDF */}
      {selectedMateri && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex flex-col"
          onContextMenu={(e) => e.preventDefault()} // blok klik kanan
          onKeyDown={(e) => {
            // tutup modal dengan Escape
            if (e.key === "Escape") {
              setSelectedMateri(null);
              return;
            }

            if (
              (e.ctrlKey &&
                (e.key === "c" || e.key === "u" || e.key === "s")) || // copy, source, save
              (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || // inspect element
              e.key === "F12" || // devtools
              e.key === "PrintScreen"
            ) {
              e.preventDefault();
              alert("Tindakan ini tidak diizinkan!");
            }
          }}
          tabIndex={0} // supaya modal bisa menangkap keyboard
        >
          {/* Fullscreen content */}
          <div className="relative w-full h-full bg-white overflow-hidden select-none">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white z-20">
              <div className="flex items-center gap-3">
                <HiDocumentText className="text-red-500 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800 capitalize truncate max-w-[70vw]">
                  {selectedMateri.judul}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMateri(null);
                  }}
                  className="text-gray-600 hover:text-red-600 p-2 rounded-md"
                  aria-label="Tutup"
                >
                  <MdClose size={22} />
                </button>
              </div>
            </div>

            <div className="relative w-full h-[calc(100vh-64px)]">
              {" "}
              {/* full height minus top bar */}
              {/* Watermark overlay */}
              <div
                className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none capitalize"
                style={{
                  transform: "rotate(-25deg)",
                  opacity: 0.12,
                  zIndex: 10,
                }}
              >
                {Array.from({ length: 120 }, (_, i) => (
                  <span
                    key={i}
                    className="text-gray-400 font-bold select-none m-6 whitespace-nowrap"
                    style={{ fontSize: "1.6rem" }}
                  >
                    {userName}
                  </span>
                ))}
              </div>
              {pdfUrl && (
                <iframe
                  title={selectedMateri.judul}
                  src={pdfUrl}
                  className="absolute inset-0 w-full h-full border-none z-0"
                  allow="autoplay"
                  sandbox="allow-same-origin allow-scripts allow-popups"
                  referrerPolicy="no-referrer"
                />
              )}
              {/* overlay transparan untuk blok tombol popup gdrive */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-transparent z-20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriListContent;
