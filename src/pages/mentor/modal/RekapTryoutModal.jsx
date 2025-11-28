import { useEffect, useState } from "react";
import Api from "../../../utils/Api.jsx";
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function RekapTryoutModal({ open, setOpen, idUser }) {
  const [rekap, setRekap] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pesertaList, setPesertaList] = useState([]);
  const [tryoutList, setTryoutList] = useState([]);

  const [selectedUser, setSelectedUser] = useState(idUser || "");
  const [selectedTryout, setSelectedTryout] = useState("");

  // Fetch daftar peserta + daftar tryout
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const res = await Api.get("/hasil-tryout");
        const users = res.data.data || [];

        // Unique peserta
        const uniqueUsers = [
          ...new Map(users.map((item) => [item.id_user, item])).values(),
        ];
        setPesertaList(uniqueUsers);
        if (idUser) setSelectedUser(idUser);

        // Unique list tryout
        const uniqueTryout = [
          ...new Map(users.map((item) => [item.id_tryout, item])).values(),
        ];
        setTryoutList(uniqueTryout);
      } catch (err) {
        console.error("Gagal load data:", err);
      }
    };

    fetchData();
  }, [open]);

  /** 🔍 Fetch Rekapan berdasarkan User & Tryout */
  const fetchRekap = async (uid, tid) => {
    if (!uid) return;
    setLoading(true);

    try {
      const endpoint = tid
        ? `/hasil-tryout/${uid}/rekap-tryout?id_tryout=${tid}`
        : `/hasil-tryout/${uid}/rekap-tryout`;

      const res = await Api.get(endpoint);
      setRekap(res.data.data || []);
    } catch (e) {
      console.error("Error load rekapan:", e);
    } finally {
      setLoading(false);
    }
  };

  // Reload ketika filter berubah
  useEffect(() => {
    if (selectedUser) fetchRekap(selectedUser, selectedTryout);
  }, [selectedUser, selectedTryout]);

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
      <div className="bg-white rounded-3xl shadow-2xl w-[92%] max-w-6xl max-h-[92vh] p-7 relative overflow-hidden flex flex-col border border-gray-200">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold">Rekapan Peserta Tryout</h2>

          <button
            onClick={() => setOpen(false)}
            className="text-red-500 hover:text-red-700 text-3xl transition"
          >
            <AiOutlineCloseCircle />
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 gap-4 border-b p-4">
          {/* Filter Peserta */}
          <div>
            <label className="font-medium text-sm">Filter Peserta</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
            >
              <option value="">-- Pilih Peserta --</option>
              {pesertaList.map((p) => (
                <option key={p.id_user} value={p.id_user}>
                  {p.nama_user}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tryout */}
          <div>
            <label className="font-medium text-sm">Filter Tryout</label>
            <select
              value={selectedTryout}
              onChange={(e) => setSelectedTryout(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
            >
              <option value="">-- Semua Tryout --</option>
              {tryoutList.map((t) => (
                <option key={t.id_tryout} value={t.id_tryout}>
                  {t.judul_tryout}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-auto max-h-[65vh]">
          {loading && (
            <p className="text-center text-gray-500 py-4">Memuat...</p>
          )}

          {!loading && selectedUser && rekap.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <table className="min-w-full bg-white text-sm text-center">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b font-semibold">
                  <tr>
                    <th className="px-4 py-2">Attempt</th>
                    <th className="px-4 py-2">Judul Tryout</th>
                    <th className="px-4 py-2">Benar</th>
                    <th className="px-4 py-2">Salah</th>
                    <th className="px-4 py-2">Kosong</th>
                    <th className="px-4 py-2">Nilai</th>
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {rekap.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-100 transition">
                      <td className="border px-4 py-2">{r.attempt_ke}</td>
                      <td className="border px-4 py-2 capitalize">
                        {r.judul_tryout}
                      </td>
                      <td className="border px-4 py-2 text-green-700 font-semibold">
                        {r.benar}
                      </td>
                      <td className="border px-4 py-2 text-red-700 font-semibold">
                        {r.salah}
                      </td>
                      <td className="border px-4 py-2">{r.kosong}</td>
                      <td className="border px-4 py-2 font-semibold">
                        {r.nilai}
                      </td>
                      <td className="border px-4 py-2 text-xs">
                        {formatTanggal(r.tanggal_pengerjaan)}
                      </td>

                      <td className="border px-4 py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            r.status_pengerjaan === "submitted"
                              ? "bg-green-100 text-green-700"
                              : r.status_pengerjaan === "ongoing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {r.status_pengerjaan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && selectedUser && rekap.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Tidak ada data tryout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
