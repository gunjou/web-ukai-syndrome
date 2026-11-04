import React from "react";
import { AiOutlineClose, AiOutlineSwap } from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { LuCalendarClock, LuPencil } from "react-icons/lu";

import GroupJadwalInfo, { getGroupTargetLabel } from "./GroupJadwalInfo.jsx";

// ========================================================================
// MODAL - DAFTAR KELAS / KELOMPOK DALAM 1 GROUP JADWAL (v2/group)
// Aksi di modal ini hanya berlaku untuk 1 jadwal yang dipilih
// (memakai endpoint jadwal satuan yang lama).
// ========================================================================

const ActionButton = ({ onClick, className, label, children }) => (
  <div className="group relative">
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors ${className}`}
      aria-label={label}
    >
      {children}
    </button>
    <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md group-hover:block">
      {label}
    </span>
  </div>
);

const GroupKelasModal = ({
  group,
  onClose,
  onEdit,
  onReschedule,
  onSwitchMentor,
  onDelete,
}) => {
  if (!group) return null;

  const isOffline = group.type_pertemuan === "OFFLINE";
  const label = getGroupTargetLabel(group);
  const classes = Array.isArray(group.classes) ? group.classes : [];

  // Gabungkan data group + item kelas agar bentuknya sama seperti 1 jadwal
  const toJadwal = (item) => {
    const { classes: _classes, count: _count, ...rest } = group;
    return { ...rest, ...item };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-10 max-h-[90vh] w-[90%] max-w-2xl animate-fade-in-down overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daftar {label}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Aksi di daftar ini hanya berlaku untuk {label.toLowerCase()}{" "}
                yang dipilih
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors duration-200 hover:bg-yellow-500 hover:text-white"
              aria-label="Tutup modal"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>

          {/* INFO GROUP */}
          <GroupJadwalInfo group={group} />

          {/* LIST */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="border-b bg-gray-200">
                <tr className="text-[11px] uppercase text-gray-700">
                  <th className="w-12 px-3 py-2.5 text-left">No</th>
                  <th className="px-3 py-2.5 text-left">Nama {label}</th>
                  <th className="px-3 py-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-3 py-6 text-center text-sm text-gray-500"
                    >
                      Tidak ada {label.toLowerCase()}.
                    </td>
                  </tr>
                ) : (
                  classes.map((item, index) => (
                    <tr
                      key={item.id_jadwal}
                      className="border-b text-sm last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2.5 text-gray-600">{index + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800">
                        {(isOffline ? item.nama_kelompok : item.nama_kelas) ||
                          item.nama_kelas ||
                          item.nama_kelompok ||
                          "-"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            label="Edit jadwal"
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => onEdit(toJadwal(item))}
                          >
                            <LuPencil className="h-4 w-4" />
                          </ActionButton>
                          <ActionButton
                            label="Switch mentor"
                            className="bg-yellow-500 hover:bg-yellow-600"
                            onClick={() => onSwitchMentor(toJadwal(item))}
                          >
                            <AiOutlineSwap className="h-4 w-4" />
                          </ActionButton>
                          <ActionButton
                            label="Reschedule"
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => onReschedule(toJadwal(item))}
                          >
                            <LuCalendarClock className="h-4 w-4" />
                          </ActionButton>
                          <ActionButton
                            label="Hapus jadwal"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => onDelete(item.id_jadwal)}
                          >
                            <BsTrash3 className="h-4 w-4" />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold text-gray-800 transition hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupKelasModal;
