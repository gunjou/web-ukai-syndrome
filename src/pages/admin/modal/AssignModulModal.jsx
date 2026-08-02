// AssignModulModal.jsx
import { useEffect, useState, useMemo } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const AssignModulModal = ({
  onClose,
  onSave,
  excludedIds = [],
  excludedTitles = [],
}) => {
  const [modulList, setModulList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchModul = async () => {
    setLoading(true);
    try {
      // NOTE: asumsi endpoint list semua modul. Sesuaikan jika berbeda.
      const res = await Api.get(`/modul`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setModulList(list);
    } catch (err) {
      console.error("Gagal fetch daftar modul:", err);
      toast.error("Gagal memuat daftar modul.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModul();
  }, []);

  const excludedTitleSet = useMemo(
    () => new Set(excludedTitles.map((t) => t?.toLowerCase().trim())),
    [excludedTitles]
  );

  const availableModul = useMemo(() => {
    return modulList.filter((m) => {
      const excludedById =
        m.id_modul != null && excludedIds.includes(m.id_modul);
      const excludedByTitle = excludedTitleSet.has(
        m.judul?.toLowerCase().trim()
      );
      return !excludedById && !excludedByTitle;
    });
  }, [modulList, excludedIds, excludedTitleSet]);

  const filteredModul = useMemo(() => {
    return availableModul.filter((m) =>
      m.judul?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableModul, searchTerm]);

  const isAllSelected =
    filteredModul.length > 0 &&
    filteredModul.every((m) => selectedIds.includes(m.id_modul));

  const handleSelectAll = () => {
    const ids = filteredModul.map((m) => m.id_modul);
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      toast.warn("Pilih minimal satu modul.");
      return;
    }
    setSaving(true);
    try {
      await onSave(selectedIds);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col max-h-[75vh]">
      <h2 className="text-lg font-bold mb-4">Assign Modul</h2>

      <div className="relative mb-3">
        <AiOutlineSearch className="absolute left-2.5 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari judul modul..."
          className="pl-8 pr-3 py-2 border rounded-lg text-xs w-full outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : filteredModul.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
          Tidak ada modul yang bisa di-assign.
        </div>
      ) : (
        <div className="overflow-y-auto border rounded-xl shadow-sm flex-1">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
              <tr className="text-gray-600">
                <th className="px-3 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5"
                  />
                </th>
                <th className="px-3 py-3 text-center">No</th>
                <th className="px-3 py-3 text-left">Judul</th>
                <th className="px-3 py-3 text-center">Owner</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredModul.map((modul, index) => {
                const isSelected = selectedIds.includes(modul.id_modul);
                return (
                  <tr
                    key={modul.id_modul}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50" : "hover:bg-blue-50/30"
                    }`}
                    onClick={() => handleToggle(modul.id_modul)}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800">
                      {modul.judul}
                    </td>
                    <td className="px-3 py-2.5 text-center capitalize text-gray-600">
                      {modul.owner}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center pt-5">
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          {selectedIds.length} Modul Terpilih
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModulModal;
