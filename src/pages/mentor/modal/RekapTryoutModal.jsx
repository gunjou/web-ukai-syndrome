import { useEffect, useState } from "react";
import Api from "../../../utils/Api.jsx";
import { AiOutlineCloseCircle } from "react-icons/ai";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function RekapTryoutModal({ open, setOpen, idUser }) {
  const [rekap, setRekap] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pesertaList, setPesertaList] = useState([]);
  const [tryoutList, setTryoutList] = useState([]);

  const [selectedUser, setSelectedUser] = useState(idUser || "");
  const [selectedTryout, setSelectedTryout] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const res = await Api.get("/hasil-tryout/mentor");
        const users = res.data.data || [];

        const uniqueUsers = [
          ...new Map(users.map((item) => [item.id_user, item])).values(),
        ];
        setPesertaList(uniqueUsers);
        if (idUser) setSelectedUser(idUser);

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

  // ==========================================
  // 📄 EXPORT PDF
  // ==========================================
  const exportPDF = () => {
    if (!rekap.length) return;

    const namaPeserta =
      pesertaList.find((p) => p.id_user === selectedUser)?.nama_user ||
      "Peserta";

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(`Rekapan Tryout: ${namaPeserta}`, 14, 15);

    const tableData = rekap.map((r) => [
      r.attempt_ke,
      r.judul_tryout,
      r.benar,
      r.salah,
      r.kosong,
      r.nilai,
      formatTanggal(r.tanggal_pengerjaan),
      r.status_pengerjaan,
    ]);

    doc.autoTable({
      startY: 25,
      head: [
        [
          "Attempt",
          "Judul Tryout",
          "Benar",
          "Salah",
          "Kosong",
          "Nilai",
          "Tanggal",
          "Status",
        ],
      ],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`Rekapan-${namaPeserta}.pdf`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-[999]">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-[92%] max-w-6xl max-h-[92vh] p-7 relative overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Rekapan Peserta Tryout
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-red-500 hover:text-red-600 text-3xl transition"
          >
            <AiOutlineCloseCircle />
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 dark:border-gray-700 p-4">
          <div>
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Peserta
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mt-1
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring focus:ring-indigo-500 outline-none"
            >
              <option value="">-- Pilih Peserta --</option>
              {pesertaList.map((p) => (
                <option key={p.id_user} value={p.id_user}>
                  {p.nama_user}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Tryout
            </label>
            <select
              value={selectedTryout}
              onChange={(e) => setSelectedTryout(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mt-1
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring focus:ring-indigo-500 outline-none"
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
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              Memuat...
            </p>
          )}

          {!loading && selectedUser && rekap.length > 0 && (
            <>
              <div className="flex justify-end mb-3">
                <button
                  onClick={exportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow text-sm transition"
                >
                  📄 Download PDF
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-900 text-sm text-center">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Attempt
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Judul Tryout
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Benar
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Salah
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Kosong
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Nilai
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Tanggal
                      </th>
                      <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rekap.map((r, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <td className="border px-4 py-2 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                          {r.attempt_ke}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 capitalize text-gray-800 dark:text-gray-200">
                          {r.judul_tryout}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 text-green-600 dark:text-green-400 font-semibold">
                          {r.benar}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 text-red-600 dark:text-red-400 font-semibold">
                          {r.salah}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {r.kosong}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 font-bold">
                          {r.nilai}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                          {formatTanggal(r.tanggal_pengerjaan)}
                        </td>
                        <td className="border px-4 py-2 dark:border-gray-700 capitalize text-gray-700 dark:text-gray-300">
                          {r.status_pengerjaan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!loading && selectedUser && rekap.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              Tidak ada data tryout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
