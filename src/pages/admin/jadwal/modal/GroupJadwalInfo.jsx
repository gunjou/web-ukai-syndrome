import React from "react";
import { getTargetLabel, getTargetName } from "../jadwalTarget.js";

// ========================================================================
// INFO RINGKAS 1 GROUP JADWAL (dipakai di modal-modal aksi group v2)
// ========================================================================

export const formatTanggalGroup = (value) => {
  if (!value) return "-";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatJamGroup = (value) =>
  value ? String(value).substring(0, 5) : "-";

export const getGroupTargetLabel = (group) => getTargetLabel(group?.classes);

export const getGroupTargetNames = (group) => {
  const classes = Array.isArray(group?.classes) ? group.classes : [];

  return classes.map((item) => getTargetName(item)).filter(Boolean);
};

const GroupJadwalInfo = ({ group, className = "" }) => {
  if (!group) return null;

  const label = getGroupTargetLabel(group);
  const names = getGroupTargetNames(group);

  return (
    <div
      className={`rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm ${className}`}
    >
      <p className="text-gray-700">
        <span className="font-semibold">
          {label} ({names.length}):
        </span>{" "}
        {names.length ? names.join(", ") : "-"}
      </p>

      <p className="text-gray-700">
        <span className="font-semibold">Mentor:</span>{" "}
        {group.nama_mentor || "-"}
      </p>

      <p className="text-gray-700">
        <span className="font-semibold">Tanggal Efektif:</span>{" "}
        {formatTanggalGroup(group.tanggal_efektif || group.tanggal)}
      </p>

      <p className="text-gray-700">
        <span className="font-semibold">Jam Efektif:</span>{" "}
        {formatJamGroup(group.waktu_mulai_efektif || group.waktu_mulai)} -{" "}
        {formatJamGroup(group.waktu_selesai_efektif || group.waktu_selesai)}
      </p>

      <p className="text-gray-700">
        <span className="font-semibold">Tipe:</span>{" "}
        {group.type_pertemuan || "-"}
      </p>
    </div>
  );
};

export default GroupJadwalInfo;
