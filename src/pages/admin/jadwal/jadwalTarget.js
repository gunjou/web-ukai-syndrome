// ========================================================================
// HELPER TARGET JADWAL: kelas / kelompok / kelas private (mentorship)
// Dipakai halaman jadwal & absensi (v2) supaya penamaan konsisten.
// ========================================================================

export const getTargetKind = (item) => {
  if (item?.id_mentorship) return "PRIVATE";
  if (item?.id_kelompok) return "KELOMPOK";
  return "KELAS";
};

export const getTargetName = (item) => {
  const kind = getTargetKind(item);

  if (kind === "PRIVATE") {
    return item?.nama_mentorship ? `${item.nama_mentorship} (Private)` : "Kelas Private";
  }

  if (kind === "KELOMPOK") return item?.nama_kelompok || "-";

  return item?.nama_kelas || "-";
};

// Label jumlah target di 1 group: "Kelas", "Kelompok", atau "Kelas/Kelompok"
export const getTargetLabel = (classes) => {
  const list = Array.isArray(classes) ? classes : [];
  const kinds = new Set(
    list.map((item) => (getTargetKind(item) === "KELOMPOK" ? "KELOMPOK" : "KELAS")),
  );

  if (kinds.size > 1) return "Kelas/Kelompok";
  return kinds.has("KELOMPOK") ? "Kelompok" : "Kelas";
};
