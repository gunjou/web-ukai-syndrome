// Helper format & konstanta untuk fitur payroll mentor

export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// "19:00:00" -> "19:00"
export const formatWaktu = (time) => (time ? time.slice(0, 5) : "-");

// "2026-10-01 19:05:00" -> "19:05"
export const formatJam = (datetime) =>
  datetime ? datetime.slice(11, 16) : "-";

// "2026-10-01" -> "Kam, 1 Okt 2026" (diparse manual supaya tidak geser timezone)
export const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";

  const [tahun, bulan, hari] = tanggal.split("-").map(Number);

  return new Date(tahun, bulan - 1, hari).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Ambil nama file dari header Content-Disposition
export const getNamaFileDariHeader = (disposition, fallback) => {
  if (!disposition) return fallback;

  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

  return match ? decodeURIComponent(match[1]) : fallback;
};

// Simpan response axios (responseType: "blob") sebagai file download
export const downloadBlobResponse = (response, fallback) => {
  const namaFile = getNamaFileDariHeader(
    response.headers["content-disposition"],
    fallback,
  );

  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", namaFile);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Response error tetap JSON, tapi terbaca sebagai Blob karena responseType
export const getPesanErrorBlob = async (error, fallback) => {
  const data = error.response?.data;

  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed.message || fallback;
    } catch (parseError) {
      return fallback;
    }
  }

  return data?.message || fallback;
};

// Urutan & style badge status_sesi
export const STATUS_SESI = [
  {
    key: "PENUH",
    field: "sesi_penuh",
    label: "Penuh",
    className: "bg-green-100 text-green-700",
  },
  {
    key: "SEBAGIAN",
    field: "sesi_sebagian",
    label: "Sebagian",
    className: "bg-yellow-100 text-yellow-700",
  },
  {
    key: "BELUM_CHECK_OUT",
    field: "sesi_belum_check_out",
    label: "Belum Check-out",
    className: "bg-orange-100 text-orange-700",
  },
  {
    key: "TIDAK_HADIR",
    field: "sesi_tidak_hadir",
    label: "Tidak Hadir",
    className: "bg-red-100 text-red-600",
  },
];

export const getStatusSesi = (key) =>
  STATUS_SESI.find((status) => status.key === key) || {
    label: key,
    className: "bg-gray-100 text-gray-600",
  };
