// src/components/mentor/modal/ModalCreatePrivateMateri.jsx

import { useState } from "react";

import { X, Save, FileText, PlayCircle } from "lucide-react";

import toast from "react-hot-toast";

import Api from "../../../utils/Api";

const ModalCreatePrivateMateri = ({
  isOpen,
  onClose,
  mentorshipId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    tipe_materi: "document",
    url_file: "",
    visibility: "hold",
    is_downloadable: 0,
  });

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setForm({
      judul: "",
      tipe_materi: "document",
      url_file: "",
      visibility: "hold",
      is_downloadable: 0,
    });
  };

  /* =========================
     HANDLE CLOSE
  ========================= */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.judul.trim()) {
      toast.error("Judul materi wajib diisi");

      return;
    }

    try {
      setLoading(true);

      await Api.post(`/kelas-private/${mentorshipId}/materi`, {
        judul: form.judul,
        tipe_materi: form.tipe_materi,
        url_file: form.url_file,
        visibility: form.visibility,
        is_downloadable: form.is_downloadable,
      });

      toast.success("Materi berhasil ditambahkan");

      onSuccess?.();

      handleClose();
    } catch (error) {
      console.error("Gagal menambahkan materi:", error);

      toast.error("Gagal menambahkan materi");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CLOSE
  ========================= */
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-xl
          rounded-3xl
          bg-white
          dark:bg-slate-900
          border
          border-gray-100
          dark:border-slate-800
          shadow-2xl
          overflow-hidden
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            dark:border-slate-800
          "
        >
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Tambah Materi
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Tambahkan materi baru ke mentorship private
            </p>
          </div>

          <button
            onClick={handleClose}
            className="
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
              hover:bg-gray-100
              dark:hover:bg-slate-800
              transition
            "
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* JUDUL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Judul Materi
            </label>

            <input
              type="text"
              value={form.judul}
              onChange={(e) => handleChange("judul", e.target.value)}
              placeholder="Masukkan judul materi"
              className="
                mt-2
                w-full
                rounded-2xl
                border
                border-gray-200
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                px-4
                py-3
                text-sm
                text-gray-800
                dark:text-white
                outline-none
                focus:border-yellow-500
              "
            />
          </div>

          {/* TIPE */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipe Materi
            </label>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* DOCUMENT */}
              <button
                type="button"
                onClick={() => handleChange("tipe_materi", "document")}
                className={`
                  rounded-2xl
                  border
                  p-4
                  flex
                  items-center
                  gap-3
                  transition
                  ${
                    form.tipe_materi === "document"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-slate-700"
                  }
                `}
              >
                <FileText size={20} className="text-blue-500" />

                <div className="text-left">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Document
                  </h2>

                  <p className="text-xs text-gray-500">PDF / Docs</p>
                </div>
              </button>

              {/* VIDEO */}
              <button
                type="button"
                onClick={() => handleChange("tipe_materi", "video")}
                className={`
                  rounded-2xl
                  border
                  p-4
                  flex
                  items-center
                  gap-3
                  transition
                  ${
                    form.tipe_materi === "video"
                      ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                      : "border-gray-200 dark:border-slate-700"
                  }
                `}
              >
                <PlayCircle size={20} className="text-red-500" />

                <div className="text-left">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Video
                  </h2>

                  <p className="text-xs text-gray-500">Youtube / Drive</p>
                </div>
              </button>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              URL File
            </label>

            <input
              type="text"
              value={form.url_file}
              onChange={(e) => handleChange("url_file", e.target.value)}
              placeholder="https://..."
              className="
                mt-2
                w-full
                rounded-2xl
                border
                border-gray-200
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                px-4
                py-3
                text-sm
                text-gray-800
                dark:text-white
                outline-none
                focus:border-yellow-500
              "
            />
          </div>

          {/* VISIBILITY */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Visibility
            </label>

            <select
              value={form.visibility}
              onChange={(e) => handleChange("visibility", e.target.value)}
              className="
                mt-2
                w-full
                rounded-2xl
                border
                border-gray-200
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                px-4
                py-3
                text-sm
                text-gray-800
                dark:text-white
                outline-none
                focus:border-yellow-500
              "
            >
              <option value="hold">Hold</option>

              <option value="open">Open</option>
            </select>
          </div>

          {/* DOWNLOADABLE */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-gray-200
              dark:border-slate-700
              px-4
              py-4
            "
          >
            <div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                Downloadable
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Izinkan peserta mengunduh materi
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleChange(
                  "is_downloadable",
                  form.is_downloadable === 1 ? 0 : 1,
                )
              }
              className={`
                w-12
                h-6
                rounded-full
                p-1
                transition
                ${form.is_downloadable === 1 ? "bg-green-500" : "bg-gray-300"}
              `}
            >
              <div
                className={`
                  w-4
                  h-4
                  rounded-full
                  bg-white
                  transition
                  ${form.is_downloadable === 1 ? "translate-x-6" : ""}
                `}
              />
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
            border-t
            dark:border-slate-800
            px-6
            py-5
            flex
            justify-end
            gap-3
          "
        >
          <button
            onClick={handleClose}
            className="
              px-5
              py-2.5
              rounded-2xl
              border
              border-gray-200
              dark:border-slate-700
              text-sm
              font-medium
              hover:bg-gray-100
              dark:hover:bg-slate-800
              transition
            "
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-5
              py-2.5
              rounded-2xl
              bg-gradient-to-r
              from-[#a11d1d]
              to-[#531d1d]
              text-white
              text-sm
              font-medium
              flex
              items-center
              gap-2
              shadow-md
              hover:opacity-90
              transition
            "
          >
            <Save size={16} />

            {loading ? "Menyimpan..." : "Tambah Materi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCreatePrivateMateri;
