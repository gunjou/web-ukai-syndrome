// src/pages/mentor/PrivateMateri.jsx

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  FileText,
  Eye,
} from "lucide-react";
import Api from "../../utils/Api";
import ModalEditPrivateMateri from "./modal/ModalEditPrivateMateri";
import toast from "react-hot-toast";
import ModalCreatePrivateMateri from "./modal/ModalCreatePrivateMateri";

const PrivateMateri = () => {
  const { selectedClass } = useOutletContext();

  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedMateri, setSelectedMateri] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* =========================
     FETCH MATERI
  ========================= */
  const fetchMateri = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);

      const response = await Api.get(
        `/kelas-private/${selectedClass.id_mentorship}/materi`,
      );

      setMateriList(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil materi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  /* =========================
     EMPTY STATE
  ========================= */
  if (!selectedClass) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-5">
          <BookOpen size={32} className="text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Pilih Mentorship
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Pilih kelas private dari sidebar untuk mulai mengelola materi
          mentorship.
        </p>
      </div>
    );
  }

  /* =========================
    DELETE MATERI
    ========================= */
  const handleDeleteMateri = async (materi) => {
    const confirmed = window.confirm(`Hapus materi "${materi.judul}"?`);

    if (!confirmed) return;

    try {
      await Api.delete(`/kelas-private/materi/${materi.id_materi_private}`);

      toast.success("Materi berhasil dihapus");

      fetchMateri();
    } catch (error) {
      console.error("Gagal menghapus materi:", error);

      toast.error("Gagal menghapus materi");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="border-b dark:border-slate-800 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          {/* LEFT */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">
              {selectedClass.nama_mentorship}
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Kelas private bersama{" "}
              <span className="font-semibold">
                {selectedClass.nama_peserta}
              </span>
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="
              flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-gradient-to-r
              from-[#a11d1d]
              to-[#531d1d]
              text-white
              text-sm
              font-medium
              shadow-md
              hover:opacity-90
              transition
            "
          >
            <Plus size={18} />
            Tambah Materi
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="text-sm text-gray-500">Memuat materi...</div>
        ) : materiList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-5">
              <BookOpen size={30} className="text-gray-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Belum Ada Materi
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
              Tambahkan materi pertama untuk mentorship private ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {materiList.map((materi) => {
              const isVideo = materi.tipe_materi === "video";

              return (
                <div
                  key={materi.id_materi_private}
                  className="
        group
        rounded-xl
        border
        border-gray-100
        dark:border-slate-800
        bg-white
        dark:bg-slate-900
        px-3
        py-3
        hover:bg-gray-50
        dark:hover:bg-slate-800/60
        transition
      "
                >
                  <div className="flex items-center gap-3">
                    {/* ICON */}
                    <div
                      className={`
            min-w-[38px]
            h-[38px]
            rounded-lg
            flex
            items-center
            justify-center
            ${
              isVideo
                ? "bg-red-100 dark:bg-red-500/10"
                : "bg-blue-100 dark:bg-blue-500/10"
            }
          `}
                    >
                      {isVideo ? (
                        <PlayCircle size={16} className="text-red-500" />
                      ) : (
                        <FileText size={16} className="text-blue-600" />
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      {/* TITLE */}
                      <h2 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {materi.judul}
                      </h2>

                      {/* META */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* TYPE */}
                        <span
                          className={`
                text-[10px]
                px-1.5
                py-0.5
                rounded-md
                font-medium
                ${
                  isVideo
                    ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                }
              `}
                        >
                          {materi.tipe_materi}
                        </span>

                        {/* VISIBILITY */}
                        <span
                          className="
                text-[10px]
                px-1.5
                py-0.5
                rounded-md
                bg-teal-100
                text-teal-600
                dark:bg-teal-500/10
                dark:text-teal-400
                font-medium
              "
                        >
                          {materi.visibility}
                        </span>

                        {/* DOWNLOAD */}
                        {materi.is_downloadable === 1 && (
                          <span
                            className="
                  text-[10px]
                  px-1.5
                  py-0.5
                  rounded-md
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-400
                  font-medium
                "
                          >
                            downloadable
                          </span>
                        )}

                        {/* OWNER */}
                        <span className="text-[11px] text-gray-400 truncate">
                          • {materi.nama_owner}
                        </span>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        opacity-0
                        group-hover:opacity-100
                        transition
                      "
                    >
                      {/* PREVIEW BUTTON */}
                      <button
                        onClick={() => {
                          window.open(materi.url_file, "_blank");
                        }}
                        className="
                          w-8
                          h-8
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          hover:bg-blue-100
                          dark:hover:bg-blue-900/20
                          transition
                        "
                        title="Preview Materi"
                      >
                        {/* Menggunakan ikon Eye dari package icon Anda (Lucide / AiOutlineEye) */}
                        <Eye
                          size={15}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </button>

                      {/* EDIT */}
                      <button
                        onClick={() => {
                          setSelectedMateri(materi);
                          setShowEditModal(true);
                        }}
                        className="
                          w-8
                          h-8
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          hover:bg-gray-200
                          dark:hover:bg-slate-700
                          transition
                        "
                        title="Edit Materi"
                      >
                        <Pencil
                          size={15}
                          className="text-gray-600 dark:text-gray-300"
                        />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDeleteMateri(materi)}
                        className="
                          w-8
                          h-8
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          hover:bg-red-100
                          dark:hover:bg-red-900/20
                          transition
                        "
                        title="Hapus Materi"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING BUTTON MOBILE */}
      <button
        className="
          md:hidden
          fixed
          bottom-5
          right-5
          w-14
          h-14
          rounded-full
          bg-gradient-to-r
          from-[#a11d1d]
          to-[#531d1d]
          text-white
          shadow-xl
          flex
          items-center
          justify-center
          z-30
        "
      >
        <Plus size={24} />
      </button>

      <ModalCreatePrivateMateri
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        mentorshipId={selectedClass?.id_mentorship}
        onSuccess={fetchMateri}
      />

      <ModalEditPrivateMateri
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        materi={selectedMateri}
        onSuccess={fetchMateri}
      />
    </div>
  );
};

export default PrivateMateri;
