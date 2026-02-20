import { useEffect, useState, useRef } from "react";
import Api from "../../../utils/Api";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

const AssignKelasModal = ({
  show,
  onClose,
  onSave,
  idModul,
  idMentor,
  mode,
}) => {
  const [kelasList, setKelasList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectAllRef = useRef(null);

  const idTarget = mode === "mentor" ? idMentor : idModul;

  useEffect(() => {
    if (show) {
      fetchKelas();
    } else {
      setSelectedIds([]); // reset saat modal ditutup
    }
    // eslint-disable-next-line
  }, [show]);

  const fetchKelas = async () => {
    if (!idTarget) return;
    setLoading(true);

    try {
      let url = "";
      if (mode === "modul") {
        url = `/modul/kelas-tersedia/${idTarget}`;
      } else {
        url = `/mentor-kelas/kelas-tersedia/${idTarget}`;
      }

      const res = await Api.get(url);
      setKelasList(res.data.data || []);
    } catch (err) {
      toast.error("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected =
    kelasList.length > 0 && selectedIds.length === kelasList.length;

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < kelasList.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(kelasList.map((k) => k.id_paketkelas));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      toast.warn("Pilih minimal satu kelas!");
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedIds, mode);
      onClose();
    } catch (err) {
      toast.error("Gagal assign kelas.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-5xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <AiOutlineClose size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {mode === "modul"
            ? "Assign Kelas ke Modul"
            : "Assign Kelas ke Mentor"}
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600"> Memuat data kelas...</p>
          </div>
        ) : kelasList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada kelas tersedia / sudah semua kelas terassign.
          </div>
        ) : (
          <>
            {/* Bulk Action */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                    isAllSelected
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {isAllSelected ? "Batalkan Semua" : "Pilih Semua"}
                </button>

                {selectedIds.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {selectedIds.length} terpilih
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-auto max-h-[400px] border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        ref={selectAllRef}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">Nama Kelas</th>
                    <th className="px-3 py-2 text-left">Paket</th>
                    <th className="px-3 py-2 text-left">Batch</th>
                    <th className="px-3 py-2 text-center">Modul</th>
                    <th className="px-3 py-2 text-center">Peserta</th>
                    <th className="px-3 py-2 text-center">Mentor</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasList.map((kelas) => {
                    const isChecked = selectedIds.includes(kelas.id_paketkelas);

                    return (
                      <tr
                        key={kelas.id_paketkelas}
                        className={`cursor-pointer transition ${
                          isChecked ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={(e) => {
                          if (e.target.type !== "checkbox") {
                            handleCheckboxChange(kelas.id_paketkelas);
                          }
                        }}
                      >
                        <td className="text-center py-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleCheckboxChange(kelas.id_paketkelas)
                            }
                          />
                        </td>
                        <td className="py-2">{kelas.nama_kelas}</td>
                        <td>{kelas.nama_paket}</td>
                        <td>{kelas.nama_batch}</td>
                        <td className="text-center">{kelas.total_modul}</td>
                        <td className="text-center">{kelas.total_peserta}</td>
                        <td className="text-center">{kelas.total_mentor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-xl flex items-center gap-2 ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignKelasModal;
