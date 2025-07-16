import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Api from "../../utils/Api";
import { MdClose } from "react-icons/md";

const VideoListContent = () => {
  const { folder } = useParams();
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setVideoList([]);
          setError("Modul tidak ditemukan.");
          setLoading(false);
          return;
        }

        const filtered = materiData.filter(
          (item) =>
            item.id_modul === selectedModul.id_modul &&
            item.tipe_materi === "video"
        );

        setVideoList(filtered);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat video.");
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
      <h2 className="text-2xl font-semibold mb-2 capitalize">
        {folder?.replace(/-/g, " ")}
      </h2>
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : videoList.length > 0 ? (
          videoList.map((video) => (
            <div
              key={video.id_materi}
              onClick={() => setSelectedVideo(video)}
              className="flex flex-col sm:flex-row gap-4 bg-white shadow rounded-lg overflow-hidden max-h-[180px] cursor-pointer hover:bg-gray-50 transition"
            >
              <img
                src="https://i3.ytimg.com/vi/uNhI52RWwDk/hqdefault.jpg"
                alt={video.judul}
                className="w-full sm:w-60 h-40 object-cover rounded-lg"
              />
              <div className="flex flex-col p-4 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {video.judul}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Klik untuk menonton video
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Belum ada video untuk folder ini.</p>
        )}
      </div>

      {/* Modal Video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-3xl shadow-lg relative select-none">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedVideo.judul}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-600 hover:text-red-600"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div
              className="border rounded-lg overflow-hidden select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                title={selectedVideo.judul}
                src={getEmbedUrl(selectedVideo.url_file)}
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

export default VideoListContent;
