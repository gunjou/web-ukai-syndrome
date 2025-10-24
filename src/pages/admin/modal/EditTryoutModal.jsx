import React, { useState, useEffect } from "react";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import Api from "../../../utils/Api";

const EditTryoutModal = ({ data, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("edit");
  const [form, setForm] = useState({
    judul: data.judul || "",
    jumlah_soal: data.jumlah_soal || "",
    durasi: data.durasi || "",
    max_attempt: data.max_attempt || "",
    visibility: data.visibility || "hold",
  });

  const [paketKelas, setPaketKelas] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [kelasDalamBatch, setKelasDalamBatch] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const fetchPaketKelas = async () => {
      try {
        const res = await Api.get("/paket-kelas");
        setPaketKelas(res.data.data || []);
      } catch (err) {
        toast.error("Gagal mengambil data kelas");
      }
    };
    fetchPaketKelas();
  }, []);

  const batchOptions = [
    ...new Map(paketKelas.map((i) => [i.id_batch, i.nama_batch])).entries(),
  ].map(([id, nama]) => ({ id, nama }));

  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
    const kelas = paketKelas.filter((k) => k.id_batch === Number(batchId));
    setKelasDalamBatch(kelas);
    setSelectedKelas(kelas.map((k) => k.id_paketkelas));
    setSelectAll(true);
  };

  const handleKelasCheckbox = (id_paketkelas) => {
    setSelectedKelas((prev) => {
      const next = prev.includes(id_paketkelas)
        ? prev.filter((p) => p !== id_paketkelas)
        : [...prev, id_paketkelas];
      setSelectAll(next.length === kelasDalamBatch.length);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedKelas([]);
      setSelectAll(false);
    } else {
      setSelectedKelas(kelasDalamBatch.map((k) => k.id_paketkelas));
      setSelectAll(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.jumlah_soal || !form.durasi || !form.max_attempt) {
      toast.warning("Lengkapi semua field wajib!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        judul: form.judul,
        jumlah_soal: Number(form.jumlah_soal),
        durasi: Number(form.durasi),
        max_attempt: Number(form.max_attempt),
        visibility: form.visibility,
      };
      await Api.put(`/tryout/${data.id_tryout}/edit`, payload);
      toast.success("Tryout berhasil diperbarui!");
      onRefresh?.();
      onClose?.();
    } catch (err) {
      toast.error("Gagal memperbarui tryout");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedBatch) {
      toast.warning("Pilih batch terlebih dahulu");
      return;
    }

    setAssignLoading(true);
    try {
      const payloadBase = {
        id_tryout: Number(data.id_tryout),
        id_batch: Number(selectedBatch),
      };

      if (selectedKelas.length === kelasDalamBatch.length) {
        // Semua kelas terpilih → assign ke semua
        await Api.post("/tryout/assign-to-class", payloadBase);
      } else if (selectedKelas.length > 0) {
        // Assign hanya ke kelas tertentu (dalam satu request)
        await Api.post("/tryout/assign-to-class", {
          ...payloadBase,
          id_paketkelas: selectedKelas.map(Number), // array id_paketkelas
        });
      } else {
        toast.info("Tidak ada kelas yang dipilih.");
        setAssignLoading(false);
        return;
      }

      toast.success("Assign berhasil");
      onRefresh && onRefresh();
    } catch (err) {
      console.error("assign error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      toast.error(msg || "Gagal assign tryout");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white w-[95vw] md:w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-scaleIn relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-t-2xl">
          <h2 className="text-lg font-semibold">Edit Tryout</h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition"
            aria-label="Close"
          >
            <AiOutlineClose size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 border-b bg-gray-50">
          {["edit", "assign"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab === "edit" ? "Edit Data" : "Assign Kelas"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "edit" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Judul Tryout
                </label>
                <input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah Soal
                  </label>
                  <input
                    type="number"
                    value={form.jumlah_soal}
                    onChange={(e) =>
                      setForm({ ...form, jumlah_soal: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    value={form.durasi}
                    onChange={(e) =>
                      setForm({ ...form, durasi: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Attempt
                  </label>
                  <input
                    type="number"
                    value={form.max_attempt}
                    onChange={(e) =>
                      setForm({ ...form, max_attempt: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(e) =>
                      setForm({ ...form, visibility: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="hold">Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition ${
                    loading && "opacity-60"
                  }`}
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pilih Batch
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
                >
                  <option value="">-- Pilih Batch --</option>
                  {batchOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBatch && (
                <div className="bg-gray-50 border rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">
                      Pilih Kelas
                    </span>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="accent-green-500"
                      />
                      <span>
                        {selectAll ? "Batalkan semua" : "Pilih semua"}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                    {kelasDalamBatch.map((k) => (
                      <label
                        key={k.id_paketkelas}
                        className="flex items-center gap-2 bg-white border rounded-lg p-2 cursor-pointer hover:shadow-sm transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedKelas.includes(k.id_paketkelas)}
                          onChange={() => handleKelasCheckbox(k.id_paketkelas)}
                          className="accent-green-600"
                        />
                        <span className="text-sm text-gray-700">
                          {k.nama_kelas}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setSelectedBatch("");
                        setSelectedKelas([]);
                      }}
                      className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleAssign}
                      disabled={assignLoading}
                      className={`px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 transition ${
                        assignLoading && "opacity-60"
                      }`}
                    >
                      {assignLoading ? "Assigning..." : "Assign Tryout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTryoutModal;
