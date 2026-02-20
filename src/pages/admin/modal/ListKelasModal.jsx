// ListKelasModal.jsx
import { useEffect, useState, useRef } from "react";
import { BsTrash3 } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import Api from "../../../utils/Api";
import AssignKelasModal from "./AssignKelasModal.jsx";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";

const ListKelasModal = ({ mode, idTarget, title, onRefresh }) => {
  const [kelasData, setKelasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllRef = useRef(null);

  const prefix = mode === "mentor" ? "mentor-kelas" : "modul";

  const fetchKelas = async () => {
    if (!idTarget) return;
    setLoading(true);
    try {
      const res = await Api.get(`/${prefix}/list-kelas/${idTarget}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setKelasData(list);
      setSelectedIds([]); // reset selection setiap fetch
    } catch (err) {
      console.error("Gagal fetch list kelas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKelas();
    // eslint-disable-next-line
  }, [idTarget]);

  // SELECT LOGIC

  const isAllSelected =
    kelasData.length > 0 && selectedIds.length === kelasData.length;

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < kelasData.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const getId = (kelas) =>
    mode === "mentor" ? kelas.id_mentorkelas : kelas.id_modulkelas;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(kelasData.map((kelas) => getId(kelas)));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // BULK DELETE

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn("Pilih minimal satu data.");
      return;
    }

    ConfirmToast(
      `Yakin ingin menghapus ${selectedIds.length} data?`,
      async () => {
        try {
          await Promise.all(
            selectedIds.map((id) => Api.delete(`/${prefix}/kelas/${id}`))
          );

          toast.success("Data berhasil dihapus.");
          setSelectedIds([]);
          fetchKelas();
          onRefresh?.();
        } catch (err) {
          toast.error("Gagal menghapus beberapa data.");
        }
      }
    );
  };

  const handleDelete = (id) => {
    ConfirmToast(`Yakin ingin menghapus data ini?`, async () => {
      try {
        await Api.delete(`/${prefix}/kelas/${id}`);
        toast.success("Data berhasil dihapus.");
        fetchKelas();
        onRefresh?.();
      } catch (err) {
        toast.error("Gagal menghapus data.");
      }
    });
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat data kelas...</p>
        </div>
      ) : kelasData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <p className="text-center text-gray-500">Tidak ada kelas.</p>
        </div>
      ) : (
        <>
          {/* BULK ACTION BAR */}
          {selectedIds.length > 0 && (
            <div className="flex justify-between items-center mb-3 bg-red-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedIds.length} data terpilih
              </span>

              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm"
              >
                Hapus Terpilih
              </button>
            </div>
          )}

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse border text-sm">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr className="bg-white">
                  <th className="border px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border px-3 py-2">No</th>
                  <th className="border px-3 py-2">Nama Kelas</th>
                  <th className="border px-3 py-2">Paket</th>
                  <th className="border px-3 py-2">Batch</th>
                  <th className="border px-3 py-2">Total Modul</th>
                  <th className="border px-3 py-2">Total Peserta</th>
                  <th className="border px-3 py-2">Total Mentor</th>
                  <th className="border px-3 py-2">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {kelasData.map((kelas, index) => {
                  const id = getId(kelas);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={index}
                      className={`text-center transition ${
                        isSelected
                          ? "bg-red-100"
                          : "bg-gray-100 hover:bg-gray-300"
                      }`}
                    >
                      <td className="border px-3 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(id)}
                        />
                      </td>

                      <td className="px-2 py-2 border">{index + 1}</td>
                      <td className="border px-3 py-2">{kelas.nama_kelas}</td>
                      <td className="border px-3 py-2">{kelas.nama_paket}</td>
                      <td className="border px-3 py-2">{kelas.nama_batch}</td>
                      <td className="border px-3 py-2">{kelas.total_modul}</td>
                      <td className="border px-3 py-2">
                        {kelas.total_peserta}
                      </td>
                      <td className="border px-3 py-2">{kelas.total_mentor}</td>

                      <td className="border px-3 py-2">
                        <button
                          onClick={() => handleDelete(id)}
                          className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          <BsTrash3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* BUTTON ASSIGN */}
      <div className="flex justify-end pt-3">
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-1 rounded-xl flex items-center gap-2"
        >
          <AiOutlinePlus /> Assign Kelas
        </button>
      </div>

      {/* MODAL ASSIGN */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-5 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
            >
              <AiOutlineClose size={24} />
            </button>

            <AssignKelasModal
              show={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              {...(mode === "mentor"
                ? { idMentor: idTarget }
                : { idModul: idTarget })}
              mode={mode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListKelasModal;
