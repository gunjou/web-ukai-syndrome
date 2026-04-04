import { useEffect, useState, useMemo } from "react"; // Tambah useMemo
import Api from "../../../utils/Api";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai"; // Tambah icon search
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

  // --- STATE FILTER BARU ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const idTarget = mode === "mentor" ? idMentor : idModul;

  useEffect(() => {
    if (show) {
      fetchKelas();
    } else {
      setSelectedIds([]);
      setSearchTerm(""); // Reset filter saat tutup
      setSelectedBatch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchKelas = async () => {
    if (!idTarget) return;
    setLoading(true);
    try {
      let url =
        mode === "modul"
          ? `/modul/kelas-tersedia/${idTarget}`
          : `/mentor-kelas/kelas-tersedia/${idTarget}`;

      const res = await Api.get(url);
      setKelasList(res.data.data || []);
    } catch (err) {
      toast.error("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA FILTERING ---
  const filteredKelas = useMemo(() => {
    return kelasList.filter((k) => {
      const matchSearch = k.nama_kelas
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchBatch = selectedBatch === "" || k.nama_batch === selectedBatch;
      return matchSearch && matchBatch;
    });
  }, [kelasList, searchTerm, selectedBatch]);

  // --- LOGIKA BATCH OPTIONS ---
  const batchOptions = useMemo(() => {
    const batches = kelasList.map((k) => k.nama_batch);
    return [...new Set(batches)].sort();
  }, [kelasList]);

  // Pilih Semua hanya untuk yang tampil (filtered)
  const isAllFilteredSelected =
    filteredKelas.length > 0 &&
    filteredKelas.every((k) => selectedIds.includes(k.id_paketkelas));

  const handleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      // Hapus hanya yang ada di list terfilter dari selection
      const filteredIds = filteredKelas.map((k) => k.id_paketkelas);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Tambahkan yang ada di list terfilter ke selection
      const filteredIds = filteredKelas.map((k) => k.id_paketkelas);
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
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
          </div>
        ) : kelasList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada kelas tersedia.
          </div>
        ) : (
          <>
            {/* --- FILTER SECTION --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <AiOutlineSearch className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama kelas..."
                    className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAllFiltered}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition border ${
                    isAllFilteredSelected
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-blue-600 text-white border-blue-600"
                  }`}
                >
                  {isAllFilteredSelected
                    ? "Batalkan Semua (Filter)"
                    : "Pilih Semua (Filter)"}
                </button>
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-2 rounded-lg font-bold">
                  {selectedIds.length} Total Terpilih
                </span>
              </div>
            </div>

            <div className="overflow-auto max-h-[400px] border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-center w-10">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={handleSelectAllFiltered}
                        className="w-4 h-4"
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
                  {filteredKelas.map((kelas) => {
                    const isChecked = selectedIds.includes(kelas.id_paketkelas);
                    return (
                      <tr
                        key={kelas.id_paketkelas}
                        className={`cursor-pointer transition border-b ${
                          isChecked ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleCheckboxChange(kelas.id_paketkelas)
                        }
                      >
                        <td className="text-center py-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handle lewat onClick tr
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="py-3 font-medium">{kelas.nama_kelas}</td>
                        <td>{kelas.nama_paket}</td>
                        <td>
                          <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            {kelas.nama_batch}
                          </span>
                        </td>
                        <td className="text-center">{kelas.total_modul}</td>
                        <td className="text-center">{kelas.total_peserta}</td>
                        <td className="text-center">{kelas.total_mentor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredKelas.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                Data tidak ditemukan dengan filter ini.
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl text-sm font-bold"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${
              saving
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
            }`}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignKelasModal;
