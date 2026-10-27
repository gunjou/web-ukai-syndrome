import React, { useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";
import Api from "../../../utils/Api.jsx";
import { ConfirmToast } from "./ConfirmToast.jsx";

const getDetail = (payload) => {
  const data = payload?.data ?? payload;
  return data?.kelompok ?? data?.detail ?? data;
};

const getMembers = (detail) => {
  const members =
    detail?.anggota ??
    detail?.members ??
    detail?.daftar_anggota ??
    detail?.peserta;
  return Array.isArray(members) ? members : [];
};

const getBatchName = (detail) =>
  detail?.nama_batch ??
  detail?.batch?.nama_batch ??
  detail?.batch?.nama ??
  detail?.batch ??
  "-";

const getMemberClass = (member) => {
  const kelas = member?.nama_kelas ?? member?.kelas;
  if (typeof kelas === "string" || typeof kelas === "number") return kelas;
  return kelas?.nama_kelas ?? kelas?.nama ?? "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusLabel = (status) => {
  if (status === 1 || status === "1" || status === true) return "Aktif";
  if (status === 0 || status === "0" || status === false) return "Tidak aktif";
  return status ?? "-";
};

const DetailKelompokModal = ({ kelompokId, onClose, onGroupDeleted }) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isBulkRemovingMembers, setIsBulkRemovingMembers] = useState(false);
  const [showAvailableMembers, setShowAvailableMembers] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [availableSearchInput, setAvailableSearchInput] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [availableRetryKey, setAvailableRetryKey] = useState(0);
  const selectAllRef = useRef(null);
  const selectAllMembersRef = useRef(null);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await Api.get(
          `/kelompok/${encodeURIComponent(kelompokId)}`
        );
        if (isCurrentRequest) setDetail(getDetail(response.data));
      } catch (requestError) {
        if (!isCurrentRequest) return;
        console.error("Gagal mengambil detail kelompok:", requestError);
        setError(
          requestError.response?.data?.message ||
            "Gagal memuat detail kelompok. Silakan coba lagi."
        );
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isCurrentRequest = false;
    };
  }, [kelompokId, retryKey]);

  const members = getMembers(detail || {});
  const status = getStatusLabel(detail?.status ?? detail?.status_kelompok);
  const availableParticipantIds = availableMembers.map((participant) =>
    String(participant.id_peserta)
  );
  const removableMemberIds = members
    .map((member) => member.id_kelompok_peserta ?? member.id_kelompokpeserta)
    .filter((id) => id != null)
    .map(String);
  const selectedRemovableMemberCount = removableMemberIds.filter((id) =>
    selectedMemberIds.includes(id)
  ).length;
  const areAllRemovableMembersSelected =
    removableMemberIds.length > 0 &&
    selectedRemovableMemberCount === removableMemberIds.length;
  const selectedAvailableCount = availableParticipantIds.filter((id) =>
    selectedParticipantIds.includes(id)
  ).length;
  const areAllAvailableSelected =
    availableParticipantIds.length > 0 &&
    selectedAvailableCount === availableParticipantIds.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedAvailableCount > 0 && !areAllAvailableSelected;
    }
  }, [selectedAvailableCount, areAllAvailableSelected]);

  useEffect(() => {
    if (selectAllMembersRef.current) {
      selectAllMembersRef.current.indeterminate =
        selectedRemovableMemberCount > 0 && !areAllRemovableMembersSelected;
    }
  }, [selectedRemovableMemberCount, areAllRemovableMembersSelected]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAvailableSearch(availableSearchInput.trim());
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [availableSearchInput]);

  useEffect(() => {
    if (!showAvailableMembers) return undefined;
    let isCurrentRequest = true;
    const timeoutId = setTimeout(async () => {
      setAvailableLoading(true);
      setAvailableError("");
      try {
        const params = new URLSearchParams();
        if (availableSearch) params.set("search", availableSearch);
        const query = params.toString();
        const response = await Api.get(
          `/kelompok/${encodeURIComponent(kelompokId)}/peserta-tersedia${
            query ? `?${query}` : ""
          }`
        );
        if (!isCurrentRequest) return;
        const payload = response.data;
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : [];
        setAvailableMembers(data);
      } catch (requestError) {
        if (!isCurrentRequest) return;
        console.error("Gagal mengambil peserta yang tersedia:", requestError);
        setAvailableError(
          requestError.response?.data?.message ||
            "Gagal memuat peserta yang tersedia."
        );
      } finally {
        if (isCurrentRequest) setAvailableLoading(false);
      }
    }, 200);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [showAvailableMembers, kelompokId, availableSearch, availableRetryKey]);

  const handleRemoveMember = (member) => {
    const membershipId =
      member.id_kelompok_peserta ?? member.id_kelompokpeserta;
    if (!membershipId) {
      toast.error("ID keanggotaan peserta tidak tersedia.");
      return;
    }

    ConfirmToast(
      `Keluarkan ${
        member.nama || member.email || "peserta"
      } dari kelompok ini?`,
      async () => {
        setDeletingMemberId(membershipId);
        try {
          await Api.delete(
            `/kelompok/peserta/${encodeURIComponent(membershipId)}`
          );
          toast.success("Peserta berhasil dikeluarkan dari kelompok.");
          setSelectedMemberIds((selected) =>
            selected.filter((id) => id !== String(membershipId))
          );
          setRetryKey((key) => key + 1);
        } catch (requestError) {
          console.error(
            "Gagal mengeluarkan peserta dari kelompok:",
            requestError
          );
          toast.error(
            requestError.response?.data?.message ||
              "Gagal mengeluarkan peserta dari kelompok. Silakan coba lagi."
          );
        } finally {
          setDeletingMemberId(null);
        }
      }
    );
  };

  const toggleMemberSelection = (membershipId) => {
    const id = String(membershipId);
    setSelectedMemberIds((selected) =>
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id]
    );
  };

  const toggleAllMembersSelection = () => {
    setSelectedMemberIds((selected) => {
      if (areAllRemovableMembersSelected) {
        return selected.filter((id) => !removableMemberIds.includes(id));
      }

      return [...new Set([...selected, ...removableMemberIds])];
    });
  };

  const handleRemoveSelectedMembers = () => {
    if (!selectedMemberIds.length || isBulkRemovingMembers) return;
    const selectedMembers = members.filter((member) =>
      selectedMemberIds.includes(
        String(
          member.id_kelompok_peserta ?? member.id_kelompokpeserta ?? ""
        )
      )
    );

    ConfirmToast(
      `Keluarkan ${selectedMembers.length} peserta terpilih dari kelompok ini?`,
      async () => {
        setIsBulkRemovingMembers(true);
        const results = await Promise.allSettled(
          selectedMembers.map((member) => {
            const membershipId =
              member.id_kelompok_peserta ?? member.id_kelompokpeserta;
            return Api.delete(
              `/kelompok/peserta/${encodeURIComponent(membershipId)}`
            );
          })
        );
        const successfulIds = results.flatMap((result, index) =>
          result.status === "fulfilled"
            ? [
                String(
                  selectedMembers[index].id_kelompok_peserta ??
                    selectedMembers[index].id_kelompokpeserta
                ),
              ]
            : []
        );
        const failedCount = results.length - successfulIds.length;

        setSelectedMemberIds((selected) =>
          selected.filter((id) => !successfulIds.includes(id))
        );
        setIsBulkRemovingMembers(false);
        setRetryKey((key) => key + 1);

        if (failedCount === 0) {
          toast.success(
            `${successfulIds.length} peserta berhasil dikeluarkan dari kelompok.`
          );
          return;
        }

        const failedResults = results.filter(
          (result) => result.status === "rejected"
        );
        failedResults.forEach((result) => {
          console.error(
            "Gagal mengeluarkan peserta terpilih:",
            result.reason
          );
        });
        toast.error(
          `${successfulIds.length} peserta berhasil dikeluarkan, ${failedCount} gagal. Peserta yang gagal tetap dipilih.`
        );
      }
    );
  };

  const handleDeleteGroup = () => {
    ConfirmToast(
      `Hapus kelompok "${
        detail?.nama_kelompok || "ini"
      }" beserta seluruh anggotanya?`,
      async () => {
        try {
          await Api.delete(`/kelompok/${encodeURIComponent(kelompokId)}`);
          toast.success("Kelompok dan seluruh anggotanya berhasil dihapus.");
          onGroupDeleted?.();
        } catch (requestError) {
          console.error("Gagal menghapus kelompok:", requestError);
          toast.error(
            requestError.response?.data?.message ||
              "Gagal menghapus kelompok. Silakan coba lagi."
          );
        }
      }
    );
  };

  const toggleParticipantSelection = (participantId) => {
    const id = String(participantId);
    setSelectedParticipantIds((selected) =>
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id]
    );
  };

  const toggleAllAvailableParticipants = () => {
    setSelectedParticipantIds((selected) => {
      if (areAllAvailableSelected) {
        return selected.filter(
          (id) => !availableParticipantIds.includes(id)
        );
      }

      return [...new Set([...selected, ...availableParticipantIds])];
    });
  };

  const handleAssignParticipants = async () => {
    if (!selectedParticipantIds.length) return;
    setIsAssigning(true);
    try {
      const participantIds = selectedParticipantIds.map((id) => {
        const numericId = Number(id);
        return Number.isNaN(numericId) ? id : numericId;
      });
      await Api.post(`/kelompok/${encodeURIComponent(kelompokId)}/peserta`, {
        id_peserta: participantIds,
      });
      toast.success(
        `${participantIds.length} peserta berhasil ditambahkan ke kelompok.`
      );
      setSelectedParticipantIds([]);
      setShowAvailableMembers(false);
      setAvailableSearchInput("");
      setAvailableSearch("");
      setRetryKey((key) => key + 1);
      setAvailableRetryKey((key) => key + 1);
    } catch (requestError) {
      console.error("Gagal menambahkan peserta ke kelompok:", requestError);
      toast.error(
        requestError.response?.data?.message ||
          "Gagal menambahkan peserta ke kelompok. Silakan coba lagi."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <section
        className="my-6 max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-kelompok-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4 sm:px-7">
          <div>
            <h2
              id="detail-kelompok-title"
              className="text-xl font-bold text-gray-900"
            >
              Detail Kelompok
            </h2>
            {detail?.nama_kelompok && (
              <p className="mt-1 text-sm text-gray-500">
                {detail.nama_kelompok} · {getBatchName(detail)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            title="Tutup"
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
          >
            <AiOutlineClose size={22} />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
              <p className="text-sm italic text-gray-500">
                Memuat detail kelompok...
              </p>
            </div>
          ) : error ? (
            <div className="py-10 text-center" role="alert">
              <p className="text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => setRetryKey((key) => key + 1)}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Informasi kelompok</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {detail?.nama_kelompok || "Kelompok"}
                  </h3>
                </div>
                <div className="group relative shrink-0">
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    aria-label="Hapus kelompok beserta anggota"
                    className="rounded-full bg-red-600 p-2.5 text-white transition hover:bg-red-700"
                  >
                    <BsTrash3 size={17} />
                  </button>
                  <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block group-focus-within:block">
                    Hapus kelompok
                  </span>
                </div>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* <div className="rounded-xl border bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-gray-500">
                    Nama Kelompok
                  </dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {detail?.nama_kelompok || "-"}
                  </dd>
                </div> */}
                <div className="rounded-xl border bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-gray-500">
                    Batch
                  </dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {getBatchName(detail)}
                  </dd>
                </div>
                <div className="rounded-xl border bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-gray-500">
                    Status
                  </dt>
                  <dd className="mt-1 font-medium text-gray-900">{status}</dd>
                </div>
                <div className="rounded-xl border bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-gray-500">
                    Jumlah Anggota
                  </dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {detail?.jumlah_anggota ??
                      detail?.total_anggota ??
                      detail?.jumlah_member ??
                      members.length}
                  </dd>
                </div>
                {/* <div className="rounded-xl border bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-gray-500">
                    Dibuat
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(detail?.created_at ?? detail?.createdAt)}
                  </dd>
                </div>
                <div className="rounded-xl border bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-gray-500">
                    Diperbarui
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(detail?.updated_at ?? detail?.updatedAt)}
                  </dd>
                </div> */}
              </dl>

              <div className="mt-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Anggota kelompok</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      Daftar Anggota ({members.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvailableMembers((show) => !show);
                      setAvailableError("");
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    {showAvailableMembers
                      ? "Tutup pilihan peserta"
                      : "Tambah peserta"}
                  </button>
                </div>
                {selectedMemberIds.length > 0 && (
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                    <span className="text-sm text-gray-700">
                      {selectedMemberIds.length} anggota dipilih
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveSelectedMembers}
                      disabled={isBulkRemovingMembers}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      <BsTrash3 size={14} />
                      {isBulkRemovingMembers
                        ? "Mengeluarkan..."
                        : "Keluarkan yang dipilih"}
                    </button>
                  </div>
                )}

                {showAvailableMembers && (
                  <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      Cari peserta berdasarkan nama, email, atau kelas
                      <input
                        type="search"
                        value={availableSearchInput}
                        onChange={(event) =>
                          setAvailableSearchInput(event.target.value)
                        }
                        placeholder="Cari nama, email, atau kelas..."
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    {availableLoading ? (
                      <div className="flex items-center gap-2 py-5 text-sm text-gray-600">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        Memuat peserta yang tersedia...
                      </div>
                    ) : availableError ? (
                      <div className="py-3 text-sm text-red-700" role="alert">
                        <p>{availableError}</p>
                        <button
                          type="button"
                          onClick={() => setAvailableRetryKey((key) => key + 1)}
                          className="mt-2 rounded-md border border-red-300 px-3 py-1 font-semibold hover:bg-red-100"
                        >
                          Coba lagi
                        </button>
                      </div>
                    ) : (
                      <>
                        {availableMembers.length > 0 && (
                          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
                            <input
                              ref={selectAllRef}
                              type="checkbox"
                              checked={areAllAvailableSelected}
                              onChange={toggleAllAvailableParticipants}
                            />
                            Pilih semua peserta ({availableMembers.length})
                          </label>
                        )}
                        <div className="max-h-56 overflow-auto rounded-lg border bg-white">
                          {availableMembers.length ? (
                            <ul className="divide-y">
                              {availableMembers.map((participant) => {
                                const id = String(participant.id_peserta);
                                return (
                                  <li key={id}>
                                    <label className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-gray-50">
                                      <input
                                        type="checkbox"
                                        checked={selectedParticipantIds.includes(
                                          id
                                        )}
                                        onChange={() =>
                                          toggleParticipantSelection(
                                            participant.id_peserta
                                          )
                                        }
                                        className="mt-1"
                                      />
                                      <span className="min-w-0 text-sm">
                                        <span className="block font-medium capitalize">
                                          {participant.nama || "-"}
                                        </span>
                                        <span className="block break-all text-gray-600">
                                          {participant.email || "-"}
                                        </span>
                                        <span className="block text-xs text-gray-500">
                                          {participant.nama_kelas || "-"}
                                        </span>
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="px-3 py-6 text-center text-sm text-gray-500">
                              Tidak ada peserta tersedia untuk batch kelompok
                              ini.
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-gray-600">
                            Dipilih: {selectedParticipantIds.length}
                          </span>
                          <button
                            type="button"
                            onClick={handleAssignParticipants}
                            disabled={
                              !selectedParticipantIds.length || isAssigning
                            }
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            {isAssigning
                              ? "Menambahkan..."
                              : "Tambahkan ke kelompok"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="max-h-[45vh] overflow-auto rounded-xl border">
                  <table className="min-w-[760px] w-full bg-white text-sm">
                    <thead className="sticky top-0 z-[1] bg-gray-100 text-left text-xs uppercase text-gray-700">
                      <tr>
                        <th className="px-3 py-3 text-center">
                          <input
                            ref={selectAllMembersRef}
                            type="checkbox"
                            checked={areAllRemovableMembersSelected}
                            onChange={toggleAllMembersSelection}
                            disabled={!removableMemberIds.length || isBulkRemovingMembers}
                            aria-label="Pilih semua anggota untuk dikeluarkan"
                          />
                        </th>
                        <th className="px-3 py-3">No</th>
                        <th className="px-3 py-3">ID Peserta</th>
                        <th className="px-3 py-3">Nama</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Nomor HP</th>
                        <th className="px-3 py-3">Kelas</th>
                        <th className="px-3 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length ? (
                        members.map((member, index) => (
                          <tr
                            key={
                              member.id_peserta ??
                              member.id_user ??
                              `${
                                member.email || member.nama || "anggota"
                              }-${index}`
                            }
                            className="border-t hover:bg-gray-50"
                          >
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedMemberIds.includes(
                                  String(
                                    member.id_kelompok_peserta ??
                                      member.id_kelompokpeserta ??
                                      ""
                                  )
                                )}
                                onChange={() =>
                                  toggleMemberSelection(
                                    member.id_kelompok_peserta ??
                                      member.id_kelompokpeserta
                                  )
                                }
                                disabled={
                                  !(
                                    member.id_kelompok_peserta ??
                                    member.id_kelompokpeserta
                                  ) ||
                                  deletingMemberId != null ||
                                  isBulkRemovingMembers
                                }
                                aria-label={`Pilih ${member.nama || "peserta"} untuk dikeluarkan`}
                              />
                            </td>
                            <td className="px-3 py-3">{index + 1}</td>
                            <td className="px-3 py-3">
                              {member.id_peserta ?? member.id_user ?? "-"}
                            </td>
                            <td className="px-3 py-3 capitalize">
                              {member.nama || "-"}
                            </td>
                            <td className="px-3 py-3">{member.email || "-"}</td>
                            <td className="px-3 py-3">
                              {member.no_hp ?? member.nomor_hp ?? "-"}
                            </td>
                            <td className="px-3 py-3">
                              {getMemberClass(member)}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="group relative inline-flex">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(member)}
                                  disabled={
                                    !(
                                      member.id_kelompok_peserta ??
                                      member.id_kelompokpeserta
                                    ) || deletingMemberId != null
                                  }
                                  className="rounded-full bg-red-600 p-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                  aria-label={`Keluarkan ${
                                    member.nama || "peserta"
                                  } dari kelompok`}
                                >
                                  <BsTrash3 size={15} />
                                </button>
                                <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block group-focus-within:block">
                                  {String(deletingMemberId) ===
                                  String(
                                    member.id_kelompok_peserta ??
                                      member.id_kelompokpeserta
                                  )
                                    ? "Memproses..."
                                    : "Keluarkan"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-3 py-8 text-center text-gray-500"
                          >
                            Belum ada anggota dalam kelompok ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DetailKelompokModal;
