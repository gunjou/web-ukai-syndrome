import { useEffect, useState } from "react";
import Api from "../../../utils/Api";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

const AssignKelasModal = ({ show, onClose, onSave, idModul }) => {
  const [kelasList, setKelasList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      fetchKelas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchKelas = async () => {
    if (!idModul) return; // jangan fetch kalau idModul kosong
    setLoading(true);
    try {
      const res = await Api.get(`/modul/kelas-tersedia/${idModul}`);
      setKelasList(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch list kelas:", err);
      toast.error("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
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
      await onSave(selectedIds); // ⬅️ panggil parent function
      onClose(); // tutup modal
    } catch (err) {
      console.error("Gagal assign:", err);
      toast.error("Gagal assign kelas.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Konten modal */}
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-3xl p-6 relative pointer-events-auto">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
        >
          <AiOutlineClose size={24} />
        </button>

        <h2 className="text-lg font-bold mb-4">Assign Kelas ke Modul</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat data kelas...</p>
          </div>
        ) : kelasList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <p className="text-center text-gray-500">Tidak ada kelas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full border bg-white">
              <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
                <tr className="bg-white">
                  <th className="px-4 py-2 border text-left">Pilih</th>
                  <th className="px-4 py-2 border text-left">Nama Kelas</th>
                  <th className="px-4 py-2 border text-left">Paket</th>
                  <th className="px-4 py-2 border text-left">Batch</th>
                  <th className="px-4 py-2 border text-center">Peserta</th>
                  <th className="px-4 py-2 border text-center">Mentor</th>
                </tr>
              </thead>
              <tbody>
                {kelasList.map((kelas) => {
                  const isChecked = selectedIds.includes(kelas.id_paketkelas);
                  return (
                    <tr
                      key={kelas.id_paketkelas}
                      className={`cursor-pointer ${
                        isChecked
                          ? "bg-blue-100"
                          : "bg-gray-100 hover:bg-gray-300"
                      }`}
                      onClick={(e) => {
                        // Cegah toggle ganda kalau klik langsung checkbox
                        if (e.target.type !== "checkbox") {
                          handleCheckboxChange(kelas.id_paketkelas);
                        }
                      }}
                    >
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(kelas.id_paketkelas)
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border">{kelas.nama_kelas}</td>
                      <td className="px-4 py-2 border">{kelas.nama_paket}</td>
                      <td className="px-4 py-2 border">{kelas.nama_batch}</td>
                      <td className="px-4 py-2 border text-center">
                        {kelas.total_peserta}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {kelas.total_mentor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-2">
          {selectedIds.length > 0 ? (
            <div className="flex justify-start gap-3 mt-4">
              {selectedIds.length} Kelas terpilih
            </div>
          ) : (
            <div className="flex justify-start gap-3 mt-4"></div>
          )}
          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-xl"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-1 rounded-xl flex items-center justify-center gap-2 ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saving && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignKelasModal;
