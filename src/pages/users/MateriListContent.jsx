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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiRes, modulRes] = await Promise.all([
          Api.get("/materi/user"),
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
            item.id_modul == selectedModul.id_modul &&
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
              onClick={() => setSelectedMateri(materi)}
              className="flex items-start gap-4 bg-white p-4 shadow rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
            >
              <HiDocumentText className="text-blue-500 text-3xl flex-shrink-0 mt-1" />
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 capitalize">
                  {materi.judul}
                </h3>
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
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
          onContextMenu={(e) => e.preventDefault()} // Blok klik kanan di seluruh layar
        >
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-3xl shadow-lg relative select-none">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedMateri.judul}
              </h3>
              <button
                onClick={() => setSelectedMateri(null)}
                className="text-gray-600 hover:text-red-600"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Dokumen tertanam, tanpa tombol link */}
            <div
              className="border rounded-lg overflow-hidden select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                title={selectedMateri.judul}
                src={getEmbedUrl(selectedMateri.url_file)}
                className="w-full h-[500px] border-none"
                allow="autoplay"
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriListContent;
