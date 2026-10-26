import { useEffect, useState } from "react";
import { AiOutlineWarning, AiOutlineDownload } from "react-icons/ai";
import { toast } from "react-toastify";
import Api from "../../../utils/Api.jsx";
import {
  formatRupiah,
  formatWaktu,
  formatJam,
  formatTanggal,
  getStatusSesi,
  downloadBlobResponse,
  getPesanErrorBlob,
  STATUS_SESI,
} from "../../../utils/formatPayroll.js";

const DetailPayrollModal = ({ idMentor, bulanAwal }) => {
  const [bulan, setBulan] = useState(bulanAwal || "");
  const [detail, setDetail] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const bulanAktif = bulan || meta?.bulan || "";

  const fetchDetail = async () => {
    if (!idMentor) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();

      if (bulan) {
        params.append("bulan", bulan);
      }

      const res = await Api.get(
        `/payroll/mentor/${idMentor}?${params.toString()}`,
      );

      setDetail(res.data.data || null);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error("Gagal fetch detail payroll:", err);
      setError(err.response?.data?.message || "Gagal memuat detail payroll.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idMentor, bulan]);

  const handleDownloadSlip = async () => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      params.append("preview", "false");

      if (bulanAktif) {
        params.append("bulan", bulanAktif);
      }

      const response = await Api.get(
        `/payroll/mentor/${idMentor}/slip?${params.toString()}`,
        { responseType: "blob" },
      );

      downloadBlobResponse(
        response,
        `slip_payroll_mentor_${idMentor}_${bulanAktif}.pdf`,
      );

      toast.success("Slip payroll berhasil diunduh.");
    } catch (err) {
      const msg = await getPesanErrorBlob(err, "Gagal mengunduh slip payroll.");
      toast.error(msg);
      console.error("Download slip error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const mentor = detail?.mentor;
  const ringkasan = detail?.ringkasan;
  const rincian = detail?.rincian || [];

  const renderKelas = (sesi) => (
    <div className="flex flex-col gap-1.5">
      {sesi.kelas.map((kelas) => (
        <div key={kelas.id_jadwal} className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${kelas.target_type === "KELOMPOK" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
            >
              {kelas.target_type}
            </span>
            <span className="font-semibold text-gray-800">
              {kelas.nama_kelas ?? kelas.nama_kelompok}
            </span>
            {!kelas.check_in_at && sesi.check_in_at && (
              <span className="text-[9px] italic text-gray-400">
                (tidak absen)
              </span>
            )}
          </div>
          {kelas.topik && (
            <span className="text-[10px] text-gray-500">{kelas.topik}</span>
          )}
        </div>
      ))}
    </div>
  );

  const renderRincianRows = () =>
    rincian.map((sesi, index) => {
      const status = getStatusSesi(sesi.status_sesi);

      return (
        <tr
          key={sesi.id_sesi}
          className="hover:bg-blue-50/30 transition-colors align-top"
        >
          <td className="px-3 py-3 text-center text-gray-400">{index + 1}</td>

          {/* Tanggal & Jam Jadwal */}
          <td className="px-3 py-3 whitespace-nowrap">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                {formatTanggal(sesi.tanggal)}
              </span>
              <span className="text-[10px] text-gray-500">
                {formatWaktu(sesi.waktu_mulai)} -{" "}
                {formatWaktu(sesi.waktu_selesai)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                {sesi.type_pertemuan.split(",").join(" / ")}
              </span>
            </div>
          </td>

          <td className="px-3 py-3">{renderKelas(sesi)}</td>

          {/* Check-in / Check-out */}
          <td className="px-3 py-3 text-center whitespace-nowrap">
            <div className="flex flex-col">
              <span className="text-gray-800">
                <span className="text-[10px] text-gray-400">In </span>
                {formatJam(sesi.check_in_at)}
              </span>
              <span className="text-gray-800">
                <span className="text-[10px] text-gray-400">Out </span>
                {formatJam(sesi.check_out_at)}
              </span>
            </div>
          </td>

          {/* Durasi */}
          <td className="px-3 py-3 text-center whitespace-nowrap">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                {sesi.durasi_dibayar_label}
              </span>
              <span className="text-[10px] text-gray-500">
                Jadwal {sesi.durasi_jadwal_menit} mnt
                {sesi.durasi_aktual_menit !== null &&
                  ` · Aktual ${sesi.durasi_aktual_menit} mnt`}
              </span>
            </div>
          </td>

          <td className="px-3 py-3 text-right font-bold text-gray-800 whitespace-nowrap">
            {formatRupiah(sesi.honor)}
          </td>

          <td className="px-3 py-3 text-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${status.className}`}
            >
              {status.label}
            </span>
          </td>
        </tr>
      );
    });

  return (
    <div className="relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 pr-8">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Rincian Payroll Mentor
          </h2>
          {mentor && (
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-red-600">
                {mentor.nama_mentor}
              </span>
              {mentor.email && ` · ${mentor.email}`}
            </p>
          )}
          {meta?.nama_bulan && (
            <p className="text-[11px] font-bold text-gray-400">
              Periode {meta.nama_bulan}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={bulanAktif}
            onChange={(e) => setBulan(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          />
          <button
            onClick={handleDownloadSlip}
            disabled={loading || isDownloading || !ringkasan?.jumlah_sesi}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-all whitespace-nowrap"
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <AiOutlineDownload size={14} />
            )}
            {isDownloading ? "Mengunduh..." : "Download Slip"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 bg-red-50 rounded-xl border-2 border-dashed">
          {error}
        </div>
      ) : (
        <>
          {/* RINGKASAN */}
          {ringkasan && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="rounded-xl border bg-gray-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Sesi
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {ringkasan.jumlah_sesi}
                  <span className="text-xs font-semibold text-gray-500">
                    {" "}
                    / {ringkasan.jumlah_kelas} kelas
                  </span>
                </p>
              </div>
              <div className="rounded-xl border bg-gray-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Jam Jadwal
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {ringkasan.total_jam_jadwal_label}
                </p>
              </div>
              <div className="rounded-xl border bg-gray-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Jam Dibayar
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {ringkasan.total_jam_dibayar_label}
                </p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase text-green-600 tracking-wider">
                  Honor
                </p>
                <p className="text-lg font-bold text-green-700">
                  {formatRupiah(ringkasan.honor)}
                </p>
              </div>
            </div>
          )}

          {/* STATUS SESI */}
          {ringkasan && (
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_SESI.map((status) => (
                <span
                  key={status.key}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${status.className}`}
                >
                  {status.label}: {ringkasan[status.field]}
                </span>
              ))}
            </div>
          )}

          {/* PERINGATAN BELUM CHECK-OUT */}
          {ringkasan?.sesi_belum_check_out > 0 && (
            <div className="flex items-start gap-2 mb-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-700">
              <AiOutlineWarning className="mt-0.5 shrink-0" size={16} />
              <span>
                Ada {ringkasan.sesi_belum_check_out} sesi yang belum check-out
                dan belum dihitung honornya. Lengkapi data absensinya agar masuk
                ke payroll.
              </span>
            </div>
          )}

          {/* RINCIAN SESI */}
          {rincian.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed italic">
              Mentor ini belum memiliki sesi pada bulan ini.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[45vh] border rounded-xl shadow-sm">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                  <tr className="text-gray-600">
                    <th className="px-3 py-3 text-center w-12">No</th>
                    <th className="px-3 py-3 text-left">Jadwal</th>
                    <th className="px-3 py-3 text-left">Kelas / Kelompok</th>
                    <th className="px-3 py-3 text-center">Absensi</th>
                    <th className="px-3 py-3 text-center">Durasi Dibayar</th>
                    <th className="px-3 py-3 text-right">Honor</th>
                    <th className="px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {renderRincianRows()}
                </tbody>
              </table>
            </div>
          )}

          {rincian.length > 0 && (
            <p className="mt-2 text-[10px] italic text-gray-400">
              Honor per sesi bisa selisih beberapa rupiah dari total karena
              total dihitung dari akumulasi menit. Angka resmi adalah total
              honor di ringkasan.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DetailPayrollModal;
