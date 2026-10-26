import { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import Api from "../../../utils/Api";

// "2026-10-01 19:05:00" / ISO -> "19:05" (jam lokal)
const getJamDariDatetime = (datetime) => {
  if (!datetime) return "";

  const date = new Date(datetime.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return datetime.slice(11, 16);

  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");

  return `${jam}:${menit}`;
};

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";

  return new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time) => (time ? time.slice(0, 5) : "-");

const CheckoutMentorForm = ({ absensi, onClose, onSuccess }) => {
  const jamCheckIn = getJamDariDatetime(absensi.check_in_at);

  const [waktuCheckOut, setWaktuCheckOut] = useState(
    absensi.waktu_selesai ? absensi.waktu_selesai.slice(0, 5) : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!waktuCheckOut) {
      setErrorMsg("Jam check-out wajib diisi.");
      return;
    }

    if (jamCheckIn && waktuCheckOut <= jamCheckIn) {
      setErrorMsg(`Jam check-out harus setelah jam check-in (${jamCheckIn}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await Api.patch(
        `/absensi/mentor/${absensi.id_absensi_mentor}/check-out`,
        { waktu_check_out: waktuCheckOut },
      );

      toast.success("Check-out mentor berhasil disimpan.");
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Gagal menyimpan check-out mentor.";
      setErrorMsg(msg);
      toast.error(msg);
      console.error("Admin check-out error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-gray-800">Check-out Mentor</h2>
      <p className="text-xs text-gray-500 mb-4">
        Isi jam check-out untuk mentor yang lupa melakukan check-out.
      </p>

      {/* INFO JADWAL */}
      <div className="rounded-xl border bg-gray-50 px-4 py-3 mb-4 text-xs space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Kelas</span>
          <span className="font-semibold text-gray-800 text-right">
            {absensi.nama_kelas || "-"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Mentor</span>
          <span className="font-semibold text-gray-800 text-right">
            {absensi.nickname_mentor || absensi.nama_mentor || "-"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Tanggal</span>
          <span className="font-semibold text-gray-800 text-right">
            {formatTanggal(absensi.tanggal)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Jadwal</span>
          <span className="font-semibold text-gray-800 text-right">
            {formatTime(absensi.waktu_mulai)} -{" "}
            {formatTime(absensi.waktu_selesai)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Check-in</span>
          <span className="font-semibold text-green-700 text-right">
            {jamCheckIn || "-"}
          </span>
        </div>
      </div>

      {/* INPUT JAM CHECK-OUT */}
      <label className="block text-xs font-bold text-gray-600 mb-1">
        Jam Check-out
      </label>
      <input
        type="time"
        value={waktuCheckOut}
        onChange={(e) => setWaktuCheckOut(e.target.value)}
        disabled={isSubmitting}
        className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:bg-gray-100"
      />

      <div className="flex items-start gap-1.5 mt-2 text-[10px] text-gray-500">
        <AiOutlineInfoCircle className="mt-0.5 shrink-0" />
        <span>
          Tanggal check-out mengikuti tanggal check-in. Durasi yang dibayar
          maksimal sesuai durasi jadwal.
        </span>
      </div>

      {errorMsg && (
        <p className="mt-3 px-3 py-2 rounded-lg bg-red-50 text-xs text-red-600">
          {errorMsg}
        </p>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Check-out"}
        </button>
      </div>
    </form>
  );
};

export default CheckoutMentorForm;
