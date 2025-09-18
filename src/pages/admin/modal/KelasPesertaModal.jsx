// ListPesertaModal.jsx
import { useEffect, useState } from "react";
import { BsTrash3 } from "react-icons/bs";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";

const KelasPesertaModal = ({ idTarget, namaTarget, onRefresh }) => {
  const [pesertaData, setPesertaData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKelas = async () => {
    if (!idTarget) return;
    setLoading(true);
    try {
      const res = await Api.get(`/paket-kelas/peserta/${idTarget}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setPesertaData(list);
    } catch (err) {
      console.error("Gagal fetch list peserta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKelas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTarget]);

  const handleDelete = (id_pesertakelas) => {
    ConfirmToast(
      `Yakin ingin menghapus peserta untuk peserta ini?`,
      async () => {
        try {
          await Api.delete(`/paket-kelas/peserta/${id_pesertakelas}`);
          toast.success(`Peserta untuk kelas ini berhasil dihapus.`);
          fetchKelas();
          onRefresh?.();
        } catch (err) {
          toast.error(`Gagal menghapus peserta.`);
          console.error(err);
        }
      }
    );
  };

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (dateStr) => {
    if (!dateStr) return "-"; // kalau kosong

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">
          Daftar Peserta Kelas - {namaTarget}
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat data kelas...</p>
        </div>
      ) : pesertaData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <p className="text-center text-gray-500">Tidak ada kelas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
              <tr className="bg-white">
                <th className="border px-3 py-2">No</th>
                <th className="border px-3 py-2">Nama</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">No Hp</th>
                <th className="border px-3 py-2">Tanggal Join</th>
                <th className="border px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pesertaData.map((peserta, index) => (
                <tr key={index} className="bg-gray-100 hover:bg-gray-300">
                  <td className="px-2 py-2 text-xs sm:text-sm border text-center">
                    {index + 1}
                  </td>
                  <td className="border px-3 py-2 whitespace-nowrap">
                    {toTitleCase(peserta.nama)}
                  </td>
                  <td className="border px-3 py-2 ">{peserta.email}</td>
                  <td className="border px-3 py-2">{peserta.no_hp}</td>
                  <td className="border px-3 py-2 whitespace-nowrap">
                    {formatDate(peserta.tanggal_join)}
                  </td>
                  <td className="border px-3 py-2 text-xs sm:text-sm">
                    <div className="relative group text-center">
                      <button
                        onClick={() => handleDelete(peserta.id_pesertakelas)}
                        className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <BsTrash3 className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                        Hapus data
                      </span>
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

export default KelasPesertaModal;
