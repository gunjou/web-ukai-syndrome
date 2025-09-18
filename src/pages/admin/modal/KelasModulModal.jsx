// ListModulModal.jsx
import { useEffect, useState } from "react";
import { BsTrash3 } from "react-icons/bs";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";

const KelasModulModal = ({ idTarget, namaTarget, onRefresh }) => {
  const [modulData, setModulData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKelas = async () => {
    if (!idTarget) return;
    setLoading(true);
    try {
      const res = await Api.get(`/paket-kelas/modul/${idTarget}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setModulData(list);
    } catch (err) {
      console.error("Gagal fetch list modul:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKelas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTarget]);

  const handleDelete = (id_modulkelas) => {
    ConfirmToast(`Yakin ingin menghapus modul untuk kelas ini?`, async () => {
      try {
        await Api.delete(`/paket-kelas/modul/${id_modulkelas}`);
        toast.success(`Modul untuk kelas ini berhasil dihapus.`);
        fetchKelas();
        onRefresh?.();
      } catch (err) {
        toast.error(`Gagal menghapus modul.`);
        console.error(err);
      }
    });
  };

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Daftar Modul Kelas - {namaTarget}</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat data kelas...</p>
        </div>
      ) : modulData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <p className="text-center text-gray-500">Tidak ada kelas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
              <tr className="bg-white">
                <th className="border px-3 py-2">No</th>
                <th className="border px-3 py-2">Judul</th>
                <th className="border px-3 py-2">Owner</th>
                <th className="border px-3 py-2">Deskripsi</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {modulData.map((modul, index) => (
                <tr key={index} className="bg-gray-100 hover:bg-gray-300">
                  <td className="px-2 py-2 text-xs sm:text-sm border text-center">
                    {index + 1}
                  </td>
                  <td className="border px-3 py-2 whitespace-nowrap">
                    {toTitleCase(modul.judul)}
                  </td>
                  <td
                    className={`border px-3 py-2 text-center capitalize ${
                      modul.owner === "admin" ? "font-bold" : "font-normal"
                    }`}
                  >
                    {modul.owner}
                  </td>
                  <td className="border px-3 py-2">{modul.deskripsi}</td>
                  {/* <td className="border px-3 py-2">{modul.visibility}</td> */}
                  <td
                    className={`capitalize font-semibold text-center border rounded-md px-2 py-1
                    ${
                      modul.visibility === "open"
                        ? "text-green-600"
                        : modul.visibility === "hold"
                        ? "text-yellow-600"
                        : modul.visibility === "close"
                        ? "text-red-600"
                        : "text-gray-600"
                    }
                  `}
                  >
                    {modul.visibility}
                  </td>
                  <td className="border px-3 py-2 text-xs sm:text-sm">
                    <div className="relative group text-center">
                      <button
                        onClick={() => handleDelete(modul.id_modulkelas)}
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

export default KelasModulModal;
