import { useEffect, useState, useRef, useMemo } from "react"; // Tambah useMemo
import { BsTrash3 } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineClose, AiOutlineSearch } from "react-icons/ai"; // Tambah AiOutlineSearch
import Api from "../../../utils/Api";
import AssignKelasModal from "./AssignKelasModal.jsx";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";

const ListKelasModal = ({ mode, idTarget, title, onRefresh }) => {
  const [kelasData, setKelasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // --- STATE FILTER BARU ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

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
      setSelectedIds([]);
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

  // --- LOGIKA FILTERING ---
  const filteredData = useMemo(() => {
    return kelasData.filter((k) => {
      const matchSearch = k.nama_kelas
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchBatch = selectedBatch === "" || k.nama_batch === selectedBatch;
      return matchSearch && matchBatch;
    });
  }, [kelasData, searchTerm, selectedBatch]);

  // --- LOGIKA BATCH OPTIONS ---
  const batchOptions = useMemo(() => {
    const batches = kelasData.map((k) => k.nama_batch);
    return [...new Set(batches)].sort();
  }, [kelasData]);

  const getId = (kelas) =>
    mode === "mentor" ? kelas.id_mentorkelas : kelas.id_modulkelas;

  // --- SELECT LOGIC (FILTERED) ---
  const isAllFilteredSelected =
    filteredData.length > 0 &&
    filteredData.every((k) => selectedIds.includes(getId(k)));

  const isIndeterminate = selectedIds.length > 0 && !isAllFilteredSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredData.map((k) => getId(k));
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // BULK DELETE
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn("Pilih minimal satu data.");
      return;
    }

    ConfirmToast(
      `Yakin ingin menghapus ${selectedIds.length} data terassign?`,
      async () => {
        try {
          await Promise.all(
            selectedIds.map((id) => Api.delete(`/${prefix}/kelas/${id}`)),
          );
          toast.success("Data berhasil dihapus.");
          setSelectedIds([]);
          fetchKelas();
          onRefresh?.();
        } catch (err) {
          toast.error("Gagal menghapus beberapa data.");
        }
      },
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

  const handleSaveAssign = async (ids) => {
    if (!idTarget) return;
    try {
      await Api.post(`/${prefix}/assign-kelas/${idTarget}`, {
        id_paketkelas: ids,
      });
      toast.success(`Kelas berhasil di-assign.`);
      setShowAssignModal(false);
      fetchKelas();
      onRefresh?.();
    } catch (err) {
      toast.error(`Gagal assign kelas.`);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-bold">{title}</h2>

        {/* --- FILTER BAR --- */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <AiOutlineSearch className="absolute left-2.5 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelas..."
              className="pl-8 pr-3 py-1.5 border rounded-lg text-xs w-full outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg py-1.5 px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">Semua Batch</option>
            {batchOptions.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : kelasData.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
          Tidak ada kelas yang ter-assign.
        </div>
      ) : (
        <>
          {/* BULK ACTION BAR */}
          <div className="flex justify-between items-center mb-3 h-10">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-3 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 w-full justify-between animate-fadeIn">
                <span className="text-xs font-bold text-red-700">
                  {selectedIds.length} data terpilih
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm"
                >
                  Hapus Terpilih
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-gray-400 font-medium italic">
                * Gunakan checkbox untuk menghapus banyak data sekaligus
              </div>
            )}
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-xl shadow-sm">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                <tr className="text-gray-600">
                  <th className="px-3 py-3 text-center w-10">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={isAllFilteredSelected}
                      onChange={handleSelectAllFiltered}
                      className="w-3.5 h-3.5"
                    />
                  </th>
                  <th className="px-3 py-3 text-center">No</th>
                  <th className="px-3 py-3 text-left">Nama Kelas</th>
                  <th className="px-3 py-3 text-left">Paket</th>
                  <th className="px-3 py-3 text-left font-bold">Batch</th>
                  <th className="px-3 py-3 text-center">Modul</th>
                  <th className="px-3 py-3 text-center">Peserta</th>
                  <th className="px-3 py-3 text-center">Mentor</th>
                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredData.map((kelas, index) => {
                  const id = getId(kelas);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={index}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? "bg-red-50" : "hover:bg-blue-50/30"
                      }`}
                      onClick={() => handleCheckboxChange(id)}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handle lewat row click
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800">
                        {kelas.nama_kelas}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {kelas.nama_paket}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-blue-600">
                        {kelas.nama_batch}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium">
                        {kelas.total_modul}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium">
                        {kelas.total_peserta}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium">
                        {kelas.total_mentor}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(id);
                          }}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <BsTrash3 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="py-10 text-center text-gray-400 italic">
                Data tidak ditemukan.
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-between items-center pt-5">
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          Total: {filteredData.length} Kelas Ter-assign
        </p>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-transform hover:scale-105"
        >
          <AiOutlinePlus size={16} /> Assign Kelas
        </button>
      </div>

      {/* MODAL ASSIGN TETAP SAMA */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
            <AssignKelasModal
              show={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              onSave={handleSaveAssign}
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
