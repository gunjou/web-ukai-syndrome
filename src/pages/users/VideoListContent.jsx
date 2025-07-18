import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Api from "../../utils/Api";

const VideoListContent = () => {
  const { folder } = useParams();
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk komentar
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiRes, modulRes] = await Promise.all([
          Api.get("/materi/peserta"),
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
        setSelectedVideo(null);
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

  const fetchKomentar = async (id_materi) => {
    try {
      const res = await Api.get(`/komentar/${id_materi}/komentar`);
      const rawKomentar = res.data.data || [];

      const komentarMap = {};
      const rootKomentar = [];

      rawKomentar.forEach((item) => {
        komentarMap[item.id_komentarmateri] = { ...item, replies: [] };
      });

      rawKomentar.forEach((item) => {
        if (item.parent_id) {
          if (komentarMap[item.parent_id]) {
            komentarMap[item.parent_id].replies.push(
              komentarMap[item.id_komentarmateri]
            );
          }
        } else {
          rootKomentar.push(komentarMap[item.id_komentarmateri]);
        }
      });

      setComments(rootKomentar);
    } catch (err) {
      console.error("Gagal memuat komentar:", err);
    }
  };

  const getTotalKomentar = () => {
    let total = 0;
    comments.forEach((comment) => {
      total += 1 + comment.replies.length;
    });
    return total;
  };

  const handleReplyToComment = (comment) => {
    setReplyingTo(comment);
    setNewComment("");
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.isi_komentar);
  };

  const handleDeleteComment = async (id_komentarmateri) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus komentar ini?");
    if (!konfirmasi) return;

    try {
      await Api.delete(`/komentar/${id_komentarmateri}`);
      if (selectedVideo) {
        await fetchKomentar(selectedVideo.id_materi); // Reload komentar
      }
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
        parent_id: replyingTo ? replyingTo.id_komentarmateri : null,
        id_materi: selectedVideo.id_materi,
      };

      const response = await Api.post(
        `/komentar/${selectedVideo.id_materi}/komentar`,
        payload
      );

      const newKomentar = response.data.data;

      if (replyingTo) {
        // Tambahkan reply ke parent
        const updated = comments.map((c) =>
          c.id_komentarmateri === replyingTo.id_komentarmateri
            ? { ...c, replies: [...c.replies, newKomentar] }
            : c
        );
        setComments(updated);
      } else {
        // Komentar utama
        setComments([{ ...newKomentar, replies: [] }, ...comments]);
      }

      setNewComment("");
      setReplyingTo(null);
      await fetchKomentar(selectedVideo.id_materi);
    } catch (err) {
      console.error("Gagal menambahkan komentar:", err);
      alert("Gagal menambahkan komentar.");
    }
  };

  const handleEditComment = (e) => {
    e.preventDefault();

    const updated = comments.map((comment) => {
      if (comment.id_komentarmateri === editingComment.id_komentarmateri) {
        return { ...comment, isi_komentar: newComment };
      }
      return {
        ...comment,
        replies: comment.replies.map((reply) =>
          reply.id_komentarmateri === editingComment.id_komentarmateri
            ? { ...reply, isi_komentar: newComment }
            : reply
        ),
      };
    });

    setComments(updated);
    setNewComment("");
    setEditingComment(null);
  };

  if (selectedVideo) {
    return (
      <div className="p-4 min-h-screen bg-gray-100">
        <button
          onClick={() => setSelectedVideo(null)}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-black"
        >
          <HiArrowLeft size={20} />
          <span>Kembali ke daftar</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video Player & Komentar */}
          <div className="flex-1 bg-white shadow rounded-lg p-4">
            <div className="aspect-video w-full mb-4 rounded overflow-hidden">
              <iframe
                title={selectedVideo.judul}
                src={getEmbedUrl(selectedVideo.url_file)}
                className="w-full h-full border-none"
                allow="autoplay"
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2 capitalize">
              {selectedVideo.judul}
            </h2>
            <p>{selectedVideo.des}</p>
            {/* <p className="text-gray-600 mb-4">
              Pemutaran video dari modul:{" "}
              <strong>{folder.replace(/-/g, " ")}</strong>
            </p> */}

            {/* Kolom Komentar */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-1">Komentar</h3>
              <p className="text-sm text-gray-500 mb-3">
                💬 {getTotalKomentar()} Komentar
              </p>

              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  className="w-full border rounded p-2 focus:outline-none focus:ring"
                  rows={2}
                  placeholder="Tulis komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editingComment ? "Simpan Perubahan" : "Kirim"}
                </button>
              </form>

              {comments.length === 0 ? (
                <p className="text-gray-500">Belum ada komentar.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((comment) => (
                    <li
                      key={comment.id_komentarmateri}
                      className="bg-gray-100 p-3 rounded shadow-sm"
                    >
                      <p className="font-semibold text-sm capitalize">
                        {comment.nama}
                      </p>
                      <p
                        className={`text-sm ${
                          comment.is_deleted
                            ? "italic text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {comment.is_deleted
                          ? "Komentar telah dihapus"
                          : comment.isi_komentar}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>

                      {!comment.is_deleted && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <button
                            onClick={() => handleReplyToComment(comment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Balas
                          </button>
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteComment(comment.id_komentarmateri)
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      {/* Textarea edit/reply komentar utama */}
                      {(editingComment?.id_komentarmateri ===
                        comment.id_komentarmateri ||
                        replyingTo?.id_komentarmateri ===
                          comment.id_komentarmateri) && (
                        <form
                          onSubmit={
                            editingComment
                              ? handleEditComment
                              : handleAddComment
                          }
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
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
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
                              className="text-gray-600 hover:underline text-sm"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <ul className="ml-6 mt-3 space-y-2">
                          {comment.replies.map((reply) => (
                            <li
                              key={reply.id_komentarmateri}
                              className="bg-gray-50 p-2 rounded"
                            >
                              <p className="font-semibold text-sm capitalize">
                                {reply.nama}
                              </p>
                              <p
                                className={`text-sm ${
                                  reply.is_deleted
                                    ? "italic text-gray-400"
                                    : "text-gray-800"
                                }`}
                              >
                                {reply.is_deleted
                                  ? "Komentar telah dihapus"
                                  : reply.isi_komentar}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(reply.created_at).toLocaleString()}
                              </p>
                              {!reply.is_deleted && (
                                <div className="flex gap-2 mt-1 text-xs">
                                  <button
                                    onClick={() => handleReplyToComment(reply)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Balas
                                  </button>
                                  <button
                                    onClick={() => handleEdit(reply)}
                                    className="text-yellow-600 hover:text-yellow-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(
                                        reply.id_komentarmateri
                                      )
                                    }
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}

                              {/* Textarea edit/reply reply */}
                              {(editingComment?.id_komentarmateri ===
                                reply.id_komentarmateri ||
                                replyingTo?.id_komentarmateri ===
                                  reply.id_komentarmateri) && (
                                <form
                                  onSubmit={
                                    editingComment
                                      ? handleEditComment
                                      : handleAddComment
                                  }
                                  className="mt-2"
                                >
                                  <textarea
                                    rows={1}
                                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring"
                                    placeholder="Tulis komentar..."
                                    value={newComment}
                                    onChange={(e) =>
                                      setNewComment(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      type="submit"
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
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
                                      className="text-gray-600 hover:underline text-sm"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </form>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar Daftar Video */}
          <div className="w-full lg:w-1/3 bg-white shadow rounded-lg p-4 overflow-y-auto h-full">
            <h3 className="text-lg font-semibold mb-3">Daftar Video</h3>
            {videoList.length > 0 ? (
              videoList.map((video) => (
                <div
                  key={video.id_materi}
                  onClick={() => {
                    setSelectedVideo(video);
                    fetchKomentar(video.id_materi);
                  }}
                  className={`flex gap-3 mb-3 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedVideo?.id_materi === video.id_materi
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  <img
                    src="https://i3.ytimg.com/vi/uNhI52RWwDk/hqdefault.jpg"
                    alt={video.judul}
                    className="w-28 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 truncate capitalize">
                      {video.judul}
                    </p>
                    <p className="text-xs text-gray-500">Klik untuk putar</p>
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
          <p className="text-gray-500">Memuat...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : videoList.length > 0 ? (
          videoList.map((video) => (
            <div
              key={video.id_materi}
              onClick={() => {
                setSelectedVideo(video);
                fetchKomentar(video.id_materi);
              }}
              className="flex flex-col sm:flex-row gap-4 bg-white shadow rounded-lg overflow-hidden max-h-[180px] cursor-pointer hover:bg-gray-50 transition"
            >
              <img
                src="https://i3.ytimg.com/vi/uNhI52RWwDk/hqdefault.jpg"
                alt={video.judul}
                className="w-full sm:w-60 h-40 object-cover rounded-lg"
              />
              <div className="flex flex-col p-4 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate capitalize">
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
    </div>
  );
};

export default VideoListContent;
