import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

import Api from "../../../../utils/Api";
import GroupJadwalInfo, {
  formatJamGroup,
  formatTanggalGroup,
  getGroupTargetLabel,
  getGroupTargetNames,
} from "./GroupJadwalInfo.jsx";

// ========================================================================
// MODAL - SWITCH MENTOR GROUP (v2)
// Mentor ditukar untuk SEMUA jadwal di kedua group
// ========================================================================

const SwitchMentorGroupModal = ({
  setShowModal,
  fetchJadwal,
  group,
  startDate,
  endDate,
}) => {
  const [searchJadwal, setSearchJadwal] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetGroup, setTargetGroup] = useState(null);

  // ========================================================================
  // CARI GROUP TUJUAN (min. 3 karakter)
  // ========================================================================

  useEffect(() => {
    const keyword = searchJadwal.trim();

    if (keyword.length < 3) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);

        const params = { search: keyword, page: 1, per_page: 50 };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await Api.get("/jadwal/v2/group", { params });
        const data = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        setOptions(
          data.filter(
            (item) =>
              Number(item.id_jadwal) !== Number(group?.id_jadwal) &&
              Number(item.id_mentor) !== Number(group?.id_mentor),
          ),
        );
      } catch (error) {
        console.error("Gagal mencari jadwal:", error);
        setOptions([]);
        toast.error(error?.response?.data?.message || "Gagal mencari jadwal.");
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchJadwal, group?.id_jadwal, group?.id_mentor, startDate, endDate]);

  // ========================================================================
  // SUBMIT
  // ========================================================================

  const handleSubmit = async () => {
    if (!targetGroup) {
      toast.warning("Pilih jadwal tujuan terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      await Api.patch("/jadwal/v2/group/switch-mentor", {
        id_jadwal_1: Number(group.id_jadwal),
        id_jadwal_2: Number(targetGroup.id_jadwal),
      });

      toast.success("Mentor berhasil ditukar.");

      setShowModal(false);
      fetchJadwal();
    } catch (error) {
      console.error("Gagal menukar mentor:", error);
      toast.error(error?.response?.data?.message || "Gagal menukar mentor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOptionLabel = (item) => {
    const names = getGroupTargetNames(item);

    return (
      <>
        <p className="font-semibold text-gray-800">
          {item.nama_mentor || "-"}
        </p>
        <p className="text-xs text-gray-500">
          {names.length === 1
            ? names[0]
            : `${names.length} ${getGroupTargetLabel(item)}`}{" "}
          · {formatTanggalGroup(item.tanggal_efektif || item.tanggal)} ·{" "}
          {formatJamGroup(item.waktu_mulai_efektif || item.waktu_mulai)} -{" "}
          {formatJamGroup(item.waktu_selesai_efektif || item.waktu_selesai)} ·{" "}
          {item.type_pertemuan}
        </p>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="my-10 max-h-[90vh] w-[90%] max-w-lg animate-fade-in-down overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Switch Mentor
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Tukar mentor untuk semua jadwal di kedua group
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors duration-200 hover:bg-yellow-500 hover:text-white"
              aria-label="Tutup modal"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>

          {/* JADWAL ASAL */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Jadwal Asal
            </p>
            <GroupJadwalInfo group={group} />
          </div>

          {/* JADWAL TUJUAN */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Jadwal Tujuan <span className="text-red-500">*</span>
            </label>

            {targetGroup ? (
              <div className="space-y-2">
                <GroupJadwalInfo
                  group={targetGroup}
                  className="border-green-200 bg-green-50"
                />
                <button
                  type="button"
                  onClick={() => setTargetGroup(null)}
                  className="text-xs font-semibold text-red-500 hover:underline"
                >
                  Ganti jadwal tujuan
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchJadwal}
                  onChange={(event) => setSearchJadwal(event.target.value)}
                  placeholder="Cari mentor/kelas/kelompok/topik (min. 3 huruf)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500"
                />

                {searchJadwal.trim().length >= 3 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200">
                    {isLoading ? (
                      <p className="px-3 py-3 text-center text-sm text-gray-500">
                        Mencari jadwal...
                      </p>
                    ) : options.length === 0 ? (
                      <p className="px-3 py-3 text-center text-sm text-gray-500">
                        Jadwal tidak ditemukan.
                      </p>
                    ) : (
                      options.map((item) => (
                        <button
                          type="button"
                          key={item.id_jadwal}
                          onClick={() => setTargetGroup(item)}
                          className="block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50"
                        >
                          {renderOptionLabel(item)}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-gray-600">
            <p>
              <span className="font-semibold">Catatan:</span> Semua jadwal di
              group asal akan diajar mentor group tujuan, dan sebaliknya.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold text-gray-800 transition hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!targetGroup || isSubmitting}
              className="flex-1 rounded-lg bg-yellow-500 py-2 font-semibold text-white transition hover:bg-yellow-600 disabled:bg-yellow-300"
            >
              {isSubmitting ? "Menyimpan..." : "Tukar Mentor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwitchMentorGroupModal;
