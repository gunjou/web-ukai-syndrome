// untuk mentor
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Api from "../../utils/Api";
import thumbnailDefault from "../../assets/logo-1.svg";

// helper untuk format url Google Drive
const formatDriveUrl = (url) => {
  if (!url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/([^/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url.replace("/view", "/preview");
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

const VideoListContent = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = storedUser?.id_user;

  const { folder } = useParams();
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [openReplies, setOpenReplies] = useState({});
  const commentRefs = useRef({});

  // cek apakah komentar masih bisa diedit (<= 5 menit)
  const canEditComment = (createdAt) => {
    const timeLimit = 5 * 60 * 1000;
    const currentTime = Date.now();
    return currentTime - new Date(createdAt).getTime() <= timeLimit;
  };

  useEffect(() => {
    const id = localStorage.getItem("kelas");
    if (id) fetchData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const fetchData = async (id_paketkelas) => {
    try {
      setLoading(true);
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
        setVideoList([]);
        setError("Modul tidak ditemukan.");
        setLoading(false);
        return;
      }

      const filtered = materiData.filter(
        (item) =>
          item.id_modul === selectedModul.id_modul &&
          item.tipe_materi === "video" &&
          isValidVideoUrl(item.url_file)
      );

      setVideoList(filtered);
      setSelectedVideo(null);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat video.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    commentRefs.current = {};
  }, [comments]);

  const fetchKomentar = async (id_materi, id_paketkelas) => {
    try {
      const res = await Api.get(
        `/komentar/${id_materi}/komentar/${id_paketkelas}`
      );
      const rawKomentar = res.data.data || [];

      // urutkan komentar terbaru paling atas
      rawKomentar.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      const komentarMap = {};
      const rootKomentar = [];

      rawKomentar.forEach((item) => {
        komentarMap[item.id_komentarmateri] = { ...item, replies: [] };
      });

      rawKomentar.forEach((item) => {
        if (item.parent_id) {
          komentarMap[item.parent_id]?.replies.push(
            komentarMap[item.id_komentarmateri]
          );
        } else {
          rootKomentar.push(komentarMap[item.id_komentarmateri]);
        }
      });

      setComments(rootKomentar);
    } catch (err) {
      console.error("Gagal memuat komentar:", err);
    }
  };

  const getTotalKomentar = () =>
    comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);

  const handleReplyToComment = (comment) => {
    setReplyingTo(comment);
    setNewComment("");

    const el = commentRefs.current[comment.id_komentarmateri];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const toggleReplies = (id) => {
    setOpenReplies((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.isi_komentar);
  };

  const handleDeleteComment = async (id_komentarmateri) => {
    if (!window.confirm("Yakin ingin menghapus komentar ini?")) return;

    try {
      await Api.delete(`/komentar/${id_komentarmateri}`);
      selectedVideo &&
        fetchKomentar(selectedVideo.id_materi, selectedVideo.id_paketkelas);
    } catch (err) {
      console.error("Gagal menghapus komentar:", err);
      alert("Terjadi kesalahan saat menghapus komentar.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedVideo) return;

    try {
      const payload = {
        isi_komentar: newComment,
        parent_id: replyingTo?.id_komentarmateri || null,
        id_materi: selectedVideo.id_materi,
      };

      await Api.post(
        `/komentar/${selectedVideo.id_materi}/komentar/${selectedVideo.id_paketkelas}`,
        payload
      );
      setNewComment("");
      setReplyingTo(null);
      fetchKomentar(selectedVideo.id_materi, selectedVideo.id_paketkelas);
    } catch (err) {
      console.error("Gagal menambahkan komentar:", err);
      alert("Gagal menambahkan komentar.");
    }
  };

  const handleEditComment = async (e) => {
    e.preventDefault();

    try {
      await Api.put(`/komentar/${editingComment.id_komentarmateri}`, {
        isi_komentar: newComment,
      });

      setNewComment("");
      setEditingComment(null);
      fetchKomentar(selectedVideo.id_materi, selectedVideo.id_paketkelas);
    } catch (err) {
      console.error("Gagal mengedit komentar:", err);
      alert("Terjadi kesalahan saat mengedit komentar.");
    }
  };

  const renderComment = (comment, isReply = false) => (
    <li
      key={comment.id_komentarmateri}
      ref={(el) => (commentRefs.current[comment.id_komentarmateri] = el)}
      className={`${isReply ? "" : ""} px-2 py-1 rounded`}
    >
      <p className="font-semibold text-sm capitalize text-gray-900 dark:text-white">
        {comment.nama || "Pengguna"}
      </p>
      <p
        className={`text-sm ${
          comment.is_deleted
            ? "italic text-gray-400"
            : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {comment.isi_komentar}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        {new Date(comment.created_at).toLocaleString()}
      </p>

      {!comment.is_deleted && (
        <div className="flex gap-2 mt-2 text-xs">
          <button
            onClick={() => handleReplyToComment(comment)}
            className="text-blue-600 hover:underline"
          >
            Balas
          </button>
          {comment.id_user === currentUserId &&
            canEditComment(comment.created_at) && (
              <button
                onClick={() => handleEdit(comment)}
                className="text-yellow-600 hover:underline"
              >
                Edit
              </button>
            )}
          <button
            onClick={() => handleDeleteComment(comment.id_komentarmateri)}
            className="text-red-600 hover:underline"
          >
            Hapus
          </button>
        </div>
      )}

      {(editingComment?.id_komentarmateri === comment.id_komentarmateri ||
        replyingTo?.id_komentarmateri === comment.id_komentarmateri) && (
        <form
          onSubmit={editingComment ? handleEditComment : handleAddComment}
          className="mt-3"
        >
          <textarea
            rows={1}
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring"
            placeholder="Tulis balasan..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-0.5 rounded-lg"
            >
              Kirim
            </button>
            <button
              type="button"
              onClick={() => {
                setNewComment("");
                setEditingComment(null);
                setReplyingTo(null);
              }}
              className="text-gray-600 dark:text-gray-400 hover:underline text-sm"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="ml-1 mt-2">
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => toggleReplies(comment.id_komentarmateri)}
          >
            {openReplies[comment.id_komentarmateri]
              ? `Sembunyikan balasan (${comment.replies.length})`
              : `Lihat balasan (${comment.replies.length})`}
          </button>
          {openReplies[comment.id_komentarmateri] && (
            <ul className="ml-6 mt-3 space-y-2">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </ul>
          )}
        </div>
      )}
    </li>
  );

  if (selectedVideo) {
    return (
      <div className="p-4 min-h-screen bg-gray-100 dark:bg-gray-900 rounded-lg">
        <button
          onClick={() => setSelectedVideo(null)}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-black"
        >
          <HiArrowLeft size={20} />
          <span>Kembali ke daftar</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video Player & Komentar */}
          <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            {/* Video Player & Watermark */}
            <div className="aspect-video w-full mb-4 rounded overflow-hidden bg-black relative">
              {selectedVideo.url_file.includes("drive.google.com") ? (
                <>
                  <iframe
                    title="Video Player"
                    src={formatDriveUrl(selectedVideo.url_file)}
                    width="100%"
                    height="100%"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>

                  {/* overlay transparan di pojok kanan atas (blokir tombol popup GDrive) */}
                  <div className="absolute top-0 right-0 w-16 h-12 z-10 bg-transparent"></div>
                </>
              ) : (
                <video
                  key={selectedVideo.id_materi}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  className="w-full h-full"
                  src={selectedVideo.url_file}
                >
                  Browser Anda tidak mendukung pemutar video.
                </video>
              )}

              {/* Watermark overlay */}
              <div
                className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none select-none capitalize"
                style={{ transform: "rotate(-25deg)", opacity: 0.25 }}
              >
                {Array.from({ length: 50 }, (_, i) => (
                  <span
                    key={i}
                    className="text-white font-bold select-none m-6 whitespace-nowrap"
                    style={{ fontSize: "2rem" }}
                  >
                    {storedUser?.nama || "User"}
                  </span>
                ))}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2 capitalize text-gray-900 dark:text-white">
              {selectedVideo.judul}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {selectedVideo.des}
            </p>

            {/* Komentar */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold dark:text-white mb-1">
                Komentar
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                💬 {getTotalKomentar()} Komentar
              </p>

              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  className="w-full border rounded p-2 focus:outline-none focus:ring
bg-white dark:bg-gray-700
text-gray-900 dark:text-gray-100
border-gray-300 dark:border-gray-600"
                  rows={2}
                  placeholder="Tulis komentar..."
                  value={replyingTo || editingComment ? "" : newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => {
                    setEditingComment(null);
                    setReplyingTo(null);
                  }}
                />
                <button
                  type="submit"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg"
                >
                  Kirim
                </button>
              </form>

              {comments.length === 0 ? (
                <p className="text-gray-500">Belum ada komentar.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => renderComment(c))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar Video */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 shadow rounded-lg p-4 overflow-y-auto h-full">
            <h3 className="text-lg font-semibold dark:text-white mb-3">
              Daftar Video
            </h3>
            {videoList.length > 0 ? (
              videoList.map((video) => (
                <div
                  key={video.id_materi}
                  onClick={() => {
                    setSelectedVideo(video);
                    fetchKomentar(video.id_materi, video.id_paketkelas);
                  }}
                  className={`flex gap-3 mb-3 p-2 rounded border dark:border-gray-700 cursor-pointer
hover:bg-gray-100 dark:hover:bg-gray-700
${
  selectedVideo?.id_materi === video.id_materi
    ? "bg-gray-200 dark:bg-gray-700"
    : ""
}`}
                >
                  <div className="flex gap-3">
                    <img
                      src={thumbnailDefault}
                      alt={video.judul}
                      className="w-28 h-16 object-contain rounded"
                    />

                    <div className="flex-1 flex flex-col justify-center">
                      <p
                        className="font-medium text-gray-800 dark:text-gray-200 capitalize overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2, // maksimal 2 baris
                          WebkitBoxOrient: "vertical",
                        }}
                        title={video.judul} // tooltip untuk judul lengkap saat hover
                      >
                        {video.judul}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Klik untuk putar
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada video.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-2 relative">
      <h2 className="text-2xl font-semibold mb-2 capitalize">
        {folder?.replace(/-/g, " ")}
      </h2>
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
        {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : videoList.length > 0 ? (
          videoList.map((video) => (
            <div
              key={video.id_materi}
              onClick={() => {
                setSelectedVideo(video);
                fetchKomentar(video.id_materi, video.id_paketkelas);
              }}
              className="
flex flex-col sm:flex-row gap-3 p-2
bg-white dark:bg-gray-800
shadow rounded-lg
border border-gray-200 dark:border-gray-700
hover:bg-gray-50 dark:hover:bg-gray-700
transition
"
            >
              <img
                src={thumbnailDefault}
                alt={video.judul}
                className="w-28 h-16 object-contain rounded"
              />

              <div className="flex flex-col p-4 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 truncate capitalize">
                  {video.judul}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  Klik untuk menonton video
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Belum ada video untuk folder ini.</p>
        )}
      </div>
    </div>
  );
};

export default VideoListContent;
