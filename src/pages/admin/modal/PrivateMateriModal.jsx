import { useEffect, useState } from "react";
import {
  AiOutlinePlayCircle,
  AiOutlineFile,
  AiOutlinePlus,
  AiOutlineClose,
} from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";

import TambahMateriPrivateForm from "./TambahMateriPrivateForm.jsx";
import EditMateriPrivateForm from "./EditMateriPrivateForm.jsx";
import { LuPencil } from "react-icons/lu";

// idMentorship di sini adalah idTarget yang dipassing dari luar
const PrivateMateriModal = ({
  idTarget: idMentorship,
  namaTarget,
  onRefresh,
}) => {
  const [materiData, setMateriData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMateri, setEditMateri] = useState(null);

  const fetchMateri = async () => {
    if (!idMentorship) return;
    setLoading(true);
    try {
      const res = await Api.get(`/kelas-private/${idMentorship}/materi`);
      const data = res.data.data;
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setMateriData(list);
    } catch (err) {
      console.error("Gagal fetch materi private:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idMentorship]);

  const handleDeleteMateri = (idMateriPrivate) => {
    ConfirmToast("Yakin ingin menghapus materi ini?", async () => {
      try {
        await Api.delete(`/kelas-private/materi/${idMateriPrivate}`);
        toast.success("Materi berhasil dihapus.");
        fetchMateri();
        onRefresh?.();
      } catch (err) {
        toast.error("Gagal menghapus materi.");
      }
    });
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Daftar Materi Private
          </h2>
          <p className="text-xs text-gray-500">
            Mentorship:{" "}
            <span className="font-semibold text-red-600">{namaTarget}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditMateri(null); // Tutup edit jika buka tambah
          }}
          className={`${showAddForm ? "bg-gray-500" : "bg-yellow-500 hover:bg-yellow-600"} text-white px-4 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-all`}
        >
          {showAddForm ? <AiOutlineClose /> : <AiOutlinePlus />}
          {showAddForm ? "Tutup Form" : "Tambah Materi"}
        </button>
      </div>

      {/* FORM TAMBAH */}
      {showAddForm && (
        <TambahMateriPrivateForm
          idMentorship={idMentorship}
          setShowForm={setShowAddForm}
          onRefresh={() => {
            fetchMateri();
            onRefresh?.();
          }}
        />
      )}

      {/* FORM EDIT */}
      {editMateri && (
        <EditMateriPrivateForm
          materi={editMateri}
          setEditMode={setEditMateri}
          onRefresh={() => {
            fetchMateri();
            onRefresh?.();
          }}
        />
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : materiData.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed italic">
          Belum ada materi yang diunggah untuk mentorship ini.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] border rounded-xl shadow-sm">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
              <tr className="text-gray-600">
                <th className="px-3 py-3 text-center w-12">No</th>
                <th className="px-3 py-3 text-left">Judul Materi</th>
                <th className="px-3 py-3 text-center">Tipe</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Preview</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {materiData.map((materi, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-3 py-3 text-center text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3 font-semibold text-gray-800">
                    {materi.judul}
                  </td>
                  <td className="px-3 py-3 text-center capitalize">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${materi.tipe_materi === "video" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      {materi.tipe_materi}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`font-bold uppercase text-[10px] ${materi.visibility === "open" ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {materi.visibility}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <a
                      href={materi.url_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full hover:bg-black transition-all text-[10px] font-bold"
                    >
                      {materi.tipe_materi === "video" ? (
                        <AiOutlinePlayCircle />
                      ) : (
                        <AiOutlineFile />
                      )}
                      Buka File
                    </a>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {/* TOMBOL EDIT */}
                      <button
                        onClick={() => {
                          setEditMateri(materi);
                          setShowAddForm(false); // Tutup tambah jika buka edit
                        }}
                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <LuPencil size={14} />
                      </button>
                      {/* TOMBOL DELETE */}
                      <button
                        onClick={() =>
                          handleDeleteMateri(materi.id_materi_private)
                        }
                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <BsTrash3 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrivateMateriModal;
