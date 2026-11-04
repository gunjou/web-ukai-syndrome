import { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import Api from "../../../utils/Api";
import { getTargetLabel, getTargetName } from "../jadwal/jadwalTarget.js";

// ========================================================================
// FORM - CHECK-OUT MANUAL OLEH ADMIN UNTUK 1 GROUP (v2)
// Berlaku untuk semua kelas/kelompok di group yang sudah check-in
// tapi belum check-out. Tampilan mengikuti CheckoutMentorForm.
// ========================================================================

// "2026-10-01 19:05:00" / ISO -> "19:05" (jam lokal)
const getJamDariDatetime = (datetime) => {
  if (!datetime) return "";

  const date = new Date(String(datetime).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return String(datetime).slice(11, 16);

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

export const getPendingCheckoutClasses = (group) =>
  (Array.isArray(group?.classes) ? group.classes : []).filter(
    (item) => item.id_absensi_mentor && item.check_in_at && !item.check_out_at,
  );

const CheckoutGroupMentorForm = ({ group, onClose, onSuccess }) => {
  const pending = getPendingCheckoutClasses(group);
  const label = getTargetLabel(group.classes);

  // Jam check-out harus setelah check-in paling akhir di antara yang pending
  const jamCheckInTerakhir = pending
    .map((item) => getJamDariDatetime(item.check_in_at))
    .filter(Boolean)
    .sort()
    .pop();

  const [waktuCheckOut, setWaktuCheckOut] = useState(
    group.waktu_selesai ? group.waktu_selesai.slice(0, 5) : "",
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

    if (jamCheckInTerakhir && waktuCheckOut <= jamCheckInTerakhir) {
      setErrorMsg(
        `Jam check-out harus setelah jam check-in (${jamCheckInTerakhir}).`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await Api.patch(
        `/absensi/v2/mentor/${group.id_jadwal}/check-out`,
        { waktu_check_out: waktuCheckOut },
      );

      toast.success(
        response?.data?.message || "Check-out mentor berhasil disimpan.",
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Gagal menyimpan check-out mentor.";
      setErrorMsg(msg);
      toast.error(msg);
      console.error("Admin group check-out error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-gray-800">Check-out Mentor</h2>
      <p className="text-xs text-gray-500 mb-4">
        Check-out sekaligus untuk {pending.length} {label.toLowerCase()} yang
        belum check-out.
      </p>

      {/* INFO JADWAL */}
      <div className="rounded-xl border bg-gray-50 px-4 py-3 mb-4 text-xs space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Mentor</span>
          <span className="font-semibold text-gray-800 text-right">
            {group.nickname_mentor || group.nama_mentor || "-"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Tanggal</span>
          <span className="font-semibold text-gray-800 text-right">
            {formatTanggal(group.tanggal)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Jadwal</span>
          <span className="font-semibold text-gray-800 text-right">
            {formatTime(group.waktu_mulai)} - {formatTime(group.waktu_selesai)}
          </span>
        </div>
      </div>

      {/* DAFTAR KELAS YANG AKAN DI-CHECK-OUT */}
      <div className="rounded-xl border mb-4 text-xs overflow-hidden">
        <div className="flex justify-between gap-4 bg-gray-100 px-4 py-2 font-bold text-gray-600">
          <span>{label}</span>
          <span>Check-in</span>
        </div>
        <div className="max-h-40 overflow-y-auto divide-y">
          {pending.map((item) => (
            <div
              key={item.id_jadwal}
              className="flex justify-between gap-4 px-4 py-2"
            >
              <span className="font-semibold text-gray-800">
                {getTargetName(item)}
              </span>
              <span className="font-semibold text-green-700">
                {getJamDariDatetime(item.check_in_at) || "-"}
              </span>
            </div>
          ))}
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
          Jam check-out yang sama diterapkan ke semua {label.toLowerCase()} di
          atas. Tanggal check-out mengikuti tanggal check-in. Durasi yang
          dibayar maksimal sesuai durasi jadwal.
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
          disabled={isSubmitting || pending.length === 0}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition"
        >
          {isSubmitting
            ? "Menyimpan..."
            : `Simpan Check-out (${pending.length})`}
        </button>
      </div>
    </form>
  );
};

export default CheckoutGroupMentorForm;
