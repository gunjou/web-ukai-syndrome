// ListModulModal.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { BsTrash3 } from "react-icons/bs";
import { AiOutlineSearch, AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";
import AssignModulModal from "./AssignModulModal.jsx";

const KelasModulModal = ({ idTarget, namaTarget, onRefresh }) => {
  const [modulData, setModulData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // --- STATE FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllRef = useRef(null);

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
      setSelectedIds([]);
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

  // --- LOGIKA FILTERING ---
  const filteredData = useMemo(() => {
    return modulData.filter((m) => {
      const matchSearch = m.judul
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchStatus =
        selectedStatus === "" || m.visibility === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [modulData, searchTerm, selectedStatus]);

  // --- LOGIKA STATUS OPTIONS ---
  const statusOptions = useMemo(() => {
    const statuses = modulData.map((m) => m.visibility);
    return [...new Set(statuses)].sort();
  }, [modulData]);

  // --- SELECT LOGIC (FILTERED) ---
  const isAllFilteredSelected =
    filteredData.length > 0 &&
    filteredData.every((m) => selectedIds.includes(m.id_modulkelas));

  const isIndeterminate = selectedIds.length > 0 && !isAllFilteredSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredData.map((m) => m.id_modulkelas);
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
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
      `Yakin ingin menghapus ${selectedIds.length} modul terpilih?`,
      async () => {
        try {
          await Promise.all(
            selectedIds.map((id) => Api.delete(`/paket-kelas/modul/${id}`))
          );
          toast.success("Modul berhasil dihapus.");
          setSelectedIds([]);
          fetchKelas();
          onRefresh?.();
        } catch (err) {
          toast.error("Gagal menghapus beberapa modul.");
        }
      }
    );
  };

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

  const handleSaveAssign = async (idModulList) => {
    if (!idTarget) return;
    try {
      await Api.post(`/modul/assign-modul/${idTarget}`, {
        id_modul: idModulList,
      });
      toast.success("Modul berhasil di-assign.");
      setShowAssignModal(false);
      fetchKelas();
      onRefresh?.();
    } catch (err) {
      toast.error("Gagal assign modul.");
    }
  };

  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-bold">Daftar Modul Kelas - {namaTarget}</h2>

        {/* --- FILTER BAR --- */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <AiOutlineSearch className="absolute left-2.5 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul modul..."
              className="pl-8 pr-3 py-1.5 border rounded-lg text-xs w-full outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg py-1.5 px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white capitalize"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : modulData.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
          Tidak ada kelas.
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
                  <th className="px-3 py-3 text-left">Judul</th>
                  <th className="px-3 py-3 text-center">Owner</th>
                  <th className="px-3 py-3 text-left">Deskripsi</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredData.map((modul, index) => {
                  const id = modul.id_modulkelas;
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
                        {toTitleCase(modul.judul)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-center capitalize text-gray-600 ${
                          modul.owner === "admin" ? "font-bold" : "font-normal"
                        }`}
                      >
                        {modul.owner}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {modul.deskripsi}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`capitalize font-semibold text-[11px] px-2 py-1 rounded-md ${
                            modul.visibility === "open"
                              ? "text-green-600 bg-green-50"
                              : modul.visibility === "hold"
                              ? "text-yellow-600 bg-yellow-50"
                              : modul.visibility === "close"
                              ? "text-red-600 bg-red-50"
                              : "text-gray-600 bg-gray-50"
                          }`}
                        >
                          {modul.visibility}
                        </span>
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
          Total: {filteredData.length} Modul Kelas
        </p>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-transform hover:scale-105"
        >
          <AiOutlinePlus size={16} /> Assign Modul
        </button>
      </div>

      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
            <AssignModulModal
              onClose={() => setShowAssignModal(false)}
              onSave={handleSaveAssign}
              excludedIds={modulData.map((m) => m.id_modul)}
              excludedTitles={modulData.map((m) => m.judul)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KelasModulModal;
