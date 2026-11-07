import React, { useEffect, useMemo, useState } from "react";
import {
  AiOutlineClose,
  AiOutlineEnvironment,
  AiOutlineEye,
  AiOutlineFilePdf,
  AiOutlineLogout,
  AiOutlineReload,
} from "react-icons/ai";
import Header from "../../../components/admin/Header.jsx";
import Api from "../../../utils/Api.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import CheckoutMentorForm from "../modal/CheckoutMentorForm.jsx";
import CheckoutGroupMentorForm, {
  getPendingCheckoutClasses,
} from "../modal/CheckoutGroupMentorForm.jsx";
import { LuChevronRight, LuLayers } from "react-icons/lu";
import { getTargetLabel, getTargetName } from "./jadwalTarget.js";

// ========================================================================
// HELPER GROUP (v2) - 1 group = mentor + tipe + tanggal + jam yang sama
// ========================================================================

const getGroupClasses = (group) =>
  Array.isArray(group?.classes) ? group.classes : [];

// Gabungkan data group + 1 kelas agar bentuknya sama seperti 1 absensi lama
const toAbsensiItem = (group, item) => {
  // eslint-disable-next-line no-unused-vars
  const { classes, count, count_check_in, count_check_out, ...rest } = group;
  return { ...rest, ...item };
};

// shortcut: embed Google Maps tanpa API key (output=embed tidak resmi), pindah ke Maps Embed API jika berhenti berfungsi
const getMapsEmbedUrl = ({ latitude, longitude }) =>
  `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

// Tidak tampil jika koordinat kosong (mis. pertemuan online)
const LokasiAbsen = ({ label, latitude, longitude, onPreview }) => {
  if (latitude == null || longitude == null) return null;
  const lokasi = {
    label,
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
  return (
    <button
      type="button"
      onClick={() => onPreview(lokasi)}
      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 underline hover:text-blue-800 cursor-pointer text-left"
      title={`Lihat lokasi ${label.toLowerCase()} di peta`}
    >
      <AiOutlineEnvironment size={14} className="shrink-0" />
      {lokasi.latitude}, {lokasi.longitude}
    </button>
  );
};

const DaftarAbsen = () => {
  const [absensiData, setAbsensiData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLokasi, setPreviewLokasi] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingParticipantId, setUpdatingParticipantId] = useState(null);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  // id_jadwal salah satu anggota group yang modal daftar kelasnya sedang dibuka
  const [groupJadwalId, setGroupJadwalId] = useState(null);
  // Group yang akan di-check-out sekaligus oleh admin (v2)
  const [groupCheckoutTarget, setGroupCheckoutTarget] = useState(null);

  const fetchAbsensi = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedDate) params.set("tanggal", selectedDate);
      // Data absensi sudah di-group per mentor + tipe + tanggal + jam
      const response = await Api.get(`/absensi/v2/mentor?${params.toString()}`);
      setAbsensiData(response.data?.data || []);
    } catch (requestError) {
      console.error("Gagal mengambil data absensi mentor:", requestError);
      setAbsensiData([]);
      setError("Gagal memuat data absensi mentor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return absensiData.filter((absensi) => {
      const matchesSearch =
        !query ||
        [
          absensi.nama_mentor,
          absensi.nickname_mentor,
          ...getGroupClasses(absensi).flatMap((item) => [
            item.nama_kelas,
            item.nama_kelompok,
            item.nama_mentorship,
          ]),
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      const matchesType = !filterType || absensi.type_pertemuan === filterType;

      return matchesSearch && matchesType;
    });
  }, [absensiData, filterType, searchTerm]);

  // Group yang sedang dibuka, selalu diambil dari data terbaru
  const selectedGroup = useMemo(
    () =>
      groupJadwalId
        ? absensiData.find((group) =>
            getGroupClasses(group).some(
              (item) => item.id_jadwal === groupJadwalId,
            ),
          ) || null
        : null,
    [absensiData, groupJadwalId],
  );

  const openDetail = async (absensi) => {
    setSelectedJadwal(absensi);
    setDetailData(null);
    setDetailError("");
    setIsDetailLoading(true);

    try {
      const response = await Api.get(`/absensi/v2/jadwal/${absensi.id_jadwal}`);
      setDetailData(response.data?.data || null);
    } catch (requestError) {
      console.error("Gagal mengambil detail absensi:", requestError);
      setDetailError("Gagal memuat detail absensi.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  // --- CHECK-OUT OLEH ADMIN ---
  // Hanya untuk mentor yang sudah check-in tapi belum check-out
  const canAdminCheckout = (absensi) =>
    Boolean(
      absensi?.id_absensi_mentor &&
      absensi?.check_in_at &&
      !absensi?.check_out_at,
    );

  // Gabungkan data list + detail supaya check-in terbaru ikut terbawa
  const getDetailCheckoutTarget = () => {
    if (!selectedJadwal || !detailData) return null;

    return {
      ...selectedJadwal,
      id_absensi_mentor:
        selectedJadwal.id_absensi_mentor ||
        detailData.mentor?.id_absensi_mentor,
      check_in_at: detailData.mentor?.check_in_at ?? selectedJadwal.check_in_at,
      check_out_at:
        detailData.mentor?.check_out_at ?? selectedJadwal.check_out_at,
    };
  };

  const handleCheckoutSuccess = () => {
    fetchAbsensi();

    if (
      selectedJadwal &&
      checkoutTarget &&
      selectedJadwal.id_jadwal === checkoutTarget.id_jadwal
    ) {
      openDetail(selectedJadwal);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Belum ada";
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatTime = (timeString) =>
    timeString ? timeString.slice(0, 5) : "-";

  const getTypeBadge = (type) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        type === "ONLINE"
          ? "bg-blue-100 text-blue-800"
          : "bg-purple-100 text-purple-800"
      }`}
    >
      {type || "-"}
    </span>
  );

  const getCheckInStatus = (absensi) => {
    const total = absensi.count ?? 1;
    if (
      total > 1 &&
      absensi.count_check_in > 0 &&
      absensi.count_check_in < total
    ) {
      return (
        <span className="font-semibold text-orange-600">
          {absensi.count_check_in}/{total} check-in
        </span>
      );
    }
    if (total > 1 && !absensi.count_check_in) {
      return <span className="text-gray-500">Belum check-in</span>;
    }
    if (!absensi.check_in_at) {
      return <span className="text-gray-500">Belum check-in</span>;
    }
    return <span className="font-semibold text-green-700">Sudah check-in</span>;
  };

  const getCheckOutStatus = (absensi) => {
    const total = absensi.count ?? 1;
    if (total > 1 && absensi.count_check_out < total) {
      return (
        <span
          className={`${
            absensi.count_check_in
              ? "font-semibold text-orange-600"
              : "text-gray-500"
          }`}
        >
          {absensi.count_check_out
            ? `${absensi.count_check_out}/${total} check-out`
            : "Belum check-out"}
        </span>
      );
    }
    if (absensi.check_out_at) {
      return <span className="font-semibold text-green-700">Selesai</span>;
    }

    // Sudah check-in tapi belum check-out = perlu tindakan admin
    return (
      <span
        className={`${
          absensi.check_in_at
            ? "font-semibold text-orange-600"
            : "text-gray-500"
        }`}
      >
        Belum check-out
      </span>
    );
  };

  const updateParticipantStatus = async (participant, statusKehadiran) => {
    if (!participant.id_absensi_peserta || updatingParticipantId) return;

    setUpdatingParticipantId(participant.id_absensi_peserta);

    try {
      await Api.patch(`/absensi/peserta/${participant.id_absensi_peserta}`, {
        status_kehadiran: statusKehadiran,
      });

      setDetailData((currentDetail) => {
        if (!currentDetail) return currentDetail;

        return {
          ...currentDetail,
          peserta: (currentDetail.peserta || []).map((item) =>
            item.id_absensi_peserta === participant.id_absensi_peserta
              ? { ...item, status_kehadiran: statusKehadiran }
              : item,
          ),
        };
      });
      toast.success("Status kehadiran peserta berhasil diperbarui.");
    } catch (requestError) {
      console.error(
        "Gagal memperbarui status kehadiran peserta:",
        requestError,
      );
      toast.error(
        requestError.response?.data?.message ||
          "Gagal memperbarui status kehadiran peserta.",
      );
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

  const exportPDF = async () => {
    if (!detailData || !selectedJadwal) return;

    setIsExporting(true);

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const mentor = detailData.mentor || selectedJadwal;
      const jadwal = detailData.jadwal || selectedJadwal;
      const peserta = detailData.peserta || [];

      doc.setFontSize(16);
      doc.text("Detail Absensi Mentor", 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(
        `Kelas: ${getTargetName({ ...selectedJadwal, ...jadwal })}`,
        14,
        22,
      );
      doc.text(
        `Mentor: ${mentor.nickname_mentor || mentor.nama_mentor || "-"}`,
        14,
        28,
      );
      doc.text(
        `Tanggal: ${formatDate(jadwal.tanggal || selectedJadwal.tanggal)}`,
        14,
        34,
      );
      doc.text(
        `Jadwal: ${formatTime(jadwal.waktu_mulai)} - ${formatTime(
          jadwal.waktu_selesai,
        )} | ${jadwal.type_pertemuan || selectedJadwal.type_pertemuan || "-"}`,
        14,
        40,
      );
      doc.setTextColor(0);

      autoTable(doc, {
        startY: 46,
        head: [["No", "Nama Peserta", "Status Kehadiran", "Check-in"]],
        body: peserta.map((item, index) => [
          index + 1,
          item.nama_peserta || "-",
          item.status_kehadiran || "-",
          formatDateTime(item.check_in_at),
        ]),
        theme: "grid",
        styles: { fontSize: 9, lineWidth: 0.1 },
        headStyles: { fillColor: [161, 29, 29], textColor: 255 },
      });

      let nextY = (doc.lastAutoTable?.finalY || 46) + 8;
      doc.setFontSize(9);
      doc.text(
        `Check-in mentor: ${formatDateTime(mentor.check_in_at)}`,
        14,
        nextY,
      );
      doc.text(
        `Check-out mentor: ${formatDateTime(mentor.check_out_at)}`,
        14,
        nextY + 6,
      );
      nextY += 14;

      const evidenceItems = [
        { label: "Evidence Check-in", url: mentor.evidence_checkin_url },
        { label: "Evidence Check-out", url: mentor.evidence_checkout_url },
      ].filter((item) => item.url);

      for (const evidence of evidenceItems) {
        if (nextY > 170) {
          doc.addPage();
          nextY = 15;
        }

        try {
          const image = await loadImage(evidence.url);
          doc.text(evidence.label, 14, nextY);
          doc.addImage(image, 14, nextY + 3, 55, 40);
          nextY += 50;
        } catch {
          doc.text(`${evidence.label}: ${evidence.url}`, 14, nextY);
          nextY += 6;
        }
      }

      const safeClassName = (
        getTargetName({ ...selectedJadwal, ...jadwal }) || "absensi"
      )
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
      doc.save(
        `absensi-${safeClassName || "kelas"}-${jadwal.tanggal || "detail"}.pdf`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const detailCheckoutTarget = getDetailCheckoutTarget();

  return (
    <div className="user bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 max-h-screen relative">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 px-4 md:px-8 gap-4">
          <div className="w-full lg:w-auto flex justify-center lg:justify-start">
            <div>
              <h1 className="text-xl font-bold">Daftar Absensi Mentor</h1>
              <p className="text-xs text-gray-500 mt-1">
                Pantau kehadiran mentor berdasarkan jadwal.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full sm:w-44 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              title="Pilih tanggal absensi"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari kelas/mentor..."
              className="w-full sm:w-48 md:w-56 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className="w-full sm:w-40 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              <option value="">Semua Tipe</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
            <button
              type="button"
              onClick={fetchAbsensi}
              title="Muat ulang data"
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <AiOutlineReload /> Muat Ulang
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {searchTerm || filterType
              ? "Tidak ada absensi yang sesuai dengan filter."
              : "Belum ada data absensi mentor."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[66vh]">
              <table className="min-w-[1050px] w-full bg-white">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-xs uppercase text-gray-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3 text-left">Kelas / Kelompok</th>
                    <th className="px-4 py-3 text-left">Mentor</th>
                    <th className="px-4 py-3 text-center">Tanggal</th>
                    <th className="px-4 py-3 text-center">Jam</th>
                    <th className="px-4 py-3 text-center">Tipe</th>
                    <th className="px-4 py-3 text-center">Check-in</th>
                    <th className="px-4 py-3 text-center">Check-out</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((group, index) => {
                    const classes = getGroupClasses(group);
                    const isSingle = classes.length <= 1;
                    // 1 kelas/kelompok: aksi langsung ke jadwal tsb (seperti sebelumnya)
                    const absensi = isSingle
                      ? toAbsensiItem(group, classes[0] || {})
                      : group;

                    return (
                      <tr
                        key={`${group.id_mentor}-${group.type_pertemuan}-${group.tanggal}-${group.waktu_mulai}-${group.waktu_selesai}`}
                        className="bg-gray-100 hover:bg-gray-300"
                      >
                        <td className="px-2 py-2 text-sm border text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 text-sm border font-semibold whitespace-nowrap">
                          {isSingle ? (
                            getTargetName(classes[0])
                          ) : (
                            <button
                              type="button"
                              onClick={() => setGroupJadwalId(group.id_jadwal)}
                              title={`Lihat daftar ${getTargetLabel(
                                classes,
                              ).toLowerCase()}`}
                              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-sm ring-2 ring-yellow-200 transition hover:bg-yellow-600 hover:shadow-md focus:outline-none focus:ring-yellow-300 active:scale-95"
                            >
                              <LuLayers className="h-3.5 w-3.5" />
                              {classes.length} {getTargetLabel(classes)}
                              <LuChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm border">
                          {group.nickname_mentor || group.nama_mentor || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm border text-center">
                          {formatDate(group.tanggal)}
                        </td>
                        <td className="px-4 py-2 text-sm border text-center">
                          {formatTime(group.waktu_mulai)} -{" "}
                          {formatTime(group.waktu_selesai)}
                        </td>
                        <td className="px-4 py-2 text-sm border text-center">
                          {getTypeBadge(group.type_pertemuan)}
                        </td>
                        <td className="px-4 py-2 text-sm border text-center">
                          {getCheckInStatus(absensi)}
                        </td>
                        <td className="px-4 py-2 text-sm border text-center">
                          {getCheckOutStatus(absensi)}
                        </td>
                        <td className="px-4 py-2 text-sm border text-center">
                          <div className="flex justify-center gap-2">
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() =>
                                  isSingle
                                    ? openDetail(absensi)
                                    : setGroupJadwalId(group.id_jadwal)
                                }
                                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                              >
                                <AiOutlineEye className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                                {isSingle
                                  ? "Lihat detail"
                                  : "Lihat daftar kelas"}
                              </span>
                            </div>
                            {!isSingle &&
                              getPendingCheckoutClasses(group).length > 0 && (
                                <div className="relative group">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setGroupCheckoutTarget(group)
                                    }
                                    className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition"
                                  >
                                    <AiOutlineLogout className="w-4 h-4" />
                                  </button>
                                  <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                                    Check-out semua (
                                    {getPendingCheckoutClasses(group).length}{" "}
                                    {group.type_pertemuan === "OFFLINE"
                                      ? "kelompok"
                                      : "kelas"}
                                    )
                                  </span>
                                </div>
                              )}
                            {isSingle && canAdminCheckout(absensi) && (
                              <div className="relative group">
                                <button
                                  type="button"
                                  onClick={() => setCheckoutTarget(absensi)}
                                  className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition"
                                >
                                  <AiOutlineLogout className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                                  Check-out mentor
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 md:px-8 mt-4 text-xs font-semibold text-gray-500">
              <span>
                Total:{" "}
                <strong className="text-blue-600">{filteredData.length}</strong>{" "}
                jadwal
              </span>
              <span>Menampilkan hasil yang sesuai filter</span>
            </div>
          </>
        )}
      </div>

      {/* MODAL - DAFTAR KELAS / KELOMPOK DALAM 1 GROUP */}
      {selectedGroup && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setGroupJadwalId(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in-down"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGroupJadwalId(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              title="Tutup"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 pr-8">
              Daftar {getTargetLabel(selectedGroup.classes)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedGroup.nickname_mentor ||
                selectedGroup.nama_mentor ||
                "-"}{" "}
              | {formatDate(selectedGroup.tanggal)} |{" "}
              {formatTime(selectedGroup.waktu_mulai)} -{" "}
              {formatTime(selectedGroup.waktu_selesai)} |{" "}
              {selectedGroup.type_pertemuan}
            </p>

            {getPendingCheckoutClasses(selectedGroup).length > 0 && (
              <button
                type="button"
                onClick={() => setGroupCheckoutTarget(selectedGroup)}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
              >
                <AiOutlineLogout />
                Check-out Semua (
                {getPendingCheckoutClasses(selectedGroup).length})
              </button>
            )}

            <div className="mt-4 overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-200">
                  <tr className="text-xs uppercase text-gray-700">
                    <th className="px-4 py-3 text-center w-12">No</th>
                    <th className="px-4 py-3 text-left">
                      {getTargetLabel(selectedGroup.classes)}
                    </th>
                    <th className="px-4 py-3 text-center">Check-in</th>
                    <th className="px-4 py-3 text-center">Check-out</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {getGroupClasses(selectedGroup).map((item, index) => {
                    const absensi = toAbsensiItem(selectedGroup, item);

                    return (
                      <tr key={item.id_jadwal} className="border-t">
                        <td className="px-4 py-3 text-center">{index + 1}</td>
                        <td className="px-4 py-3 font-semibold">
                          {getTargetName(item)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getCheckInStatus(absensi)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getCheckOutStatus(absensi)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDetail(absensi)}
                              title="Lihat detail"
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                            >
                              <AiOutlineEye className="w-4 h-4" />
                            </button>
                            {canAdminCheckout(absensi) && (
                              <button
                                type="button"
                                onClick={() => setCheckoutTarget(absensi)}
                                title="Check-out mentor"
                                className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition"
                              >
                                <AiOutlineLogout className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedJadwal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedJadwal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-yellow-600 text-white px-6 py-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <h2 className="text-lg font-bold">Detail Absensi</h2>
                <p className="text-sm text-gray-300 mt-0.5">
                  {getTargetName(selectedJadwal)} |{" "}
                  {formatDate(selectedJadwal.tanggal)}
                </p>
              </div>
              <button
                type="button"
                onClick={exportPDF}
                disabled={isDetailLoading || !detailData || isExporting}
                className="bg-custom-merah hover:bg-red-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
              >
                <AiOutlineFilePdf />
                {isExporting ? "Membuat PDF..." : "Export PDF"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedJadwal(null)}
                className="p-1 text-gray-300 hover:text-white transition"
                title="Tutup detail"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {isDetailLoading ? (
                <div className="py-12 text-center text-gray-500">
                  Memuat detail absensi...
                </div>
              ) : detailError ? (
                <div className="py-12 text-center text-red-500">
                  {detailError}
                </div>
              ) : detailData ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-custom-biru text-white font-bold flex items-center justify-center">
                      {(detailData.mentor?.nickname_mentor ||
                        detailData.mentor?.nama_mentor ||
                        "-")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mentor</p>
                      <p className="font-semibold text-gray-800">
                        {detailData.mentor?.nickname_mentor ||
                          detailData.mentor?.nama_mentor ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Check-in",
                        at: detailData.mentor?.check_in_at,
                        latitude: detailData.mentor?.check_in_latitude,
                        longitude: detailData.mentor?.check_in_longitude,
                        url: detailData.mentor?.evidence_checkin_url,
                      },
                      {
                        label: "Check-out",
                        at: detailData.mentor?.check_out_at,
                        latitude: detailData.mentor?.check_out_latitude,
                        longitude: detailData.mentor?.check_out_longitude,
                        url: detailData.mentor?.evidence_checkout_url,
                        needsAdmin: canAdminCheckout(detailCheckoutTarget),
                      },
                    ].map((card) => {
                      const evidence = {
                        label: `Evidence ${card.label}`,
                        url: card.url,
                      };
                      return (
                        <div
                          key={card.label}
                          className={`bg-white rounded-xl border p-4 shadow-sm ${
                            card.needsAdmin
                              ? "border-orange-300"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-800">
                              {card.label}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                card.at
                                  ? "bg-green-100 text-green-700"
                                  : card.needsAdmin
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {card.at ? "Tercatat" : "Belum"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDateTime(card.at)}
                          </p>
                          <LokasiAbsen
                            label={card.label}
                            latitude={card.latitude}
                            longitude={card.longitude}
                            onPreview={setPreviewLokasi}
                          />
                          {card.needsAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                setCheckoutTarget(detailCheckoutTarget)
                              }
                              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <AiOutlineLogout /> Check-out oleh Admin
                            </button>
                          )}
                          <div className="mt-3">
                            {evidence.url ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(evidence)}
                                className="block w-full text-left group"
                                title={`Preview ${evidence.label.toLowerCase()}`}
                              >
                                <img
                                  src={evidence.url}
                                  alt={evidence.label}
                                  className="w-full h-44 object-contain bg-gray-100 rounded-lg group-hover:opacity-80 transition"
                                />
                                <span className="block text-xs text-blue-600 mt-2">
                                  Klik untuk memperbesar
                                </span>
                              </button>
                            ) : (
                              <div className="h-44 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                Belum ada evidence
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-bold text-gray-800 mr-auto">
                        Kehadiran Peserta ({detailData.peserta?.length || 0})
                      </h3>
                      {[
                        ["HADIR", "bg-green-100 text-green-700"],
                        ["IZIN", "bg-yellow-100 text-yellow-700"],
                        ["SAKIT", "bg-yellow-100 text-yellow-700"],
                        ["ALPA", "bg-yellow-100 text-yellow-700"],
                        ["BELUM ABSEN", "bg-gray-200 text-gray-600"],
                      ].map(([status, warna]) => (
                        <span
                          key={status}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${warna}`}
                        >
                          {status}{" "}
                          {
                            (detailData.peserta || []).filter(
                              (item) => item.status_kehadiran === status,
                            ).length
                          }
                        </span>
                      ))}
                    </div>
                    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              Nama Peserta
                            </th>
                            <th className="px-4 py-3 text-center">
                              Status Kehadiran
                            </th>
                            <th className="px-4 py-3 text-center">Check-in</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(detailData.peserta || []).map((peserta) => (
                            <tr
                              key={peserta.id_peserta}
                              className="border-t hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">
                                {peserta.nama_peserta || "-"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <select
                                  value={peserta.status_kehadiran || ""}
                                  onChange={(event) =>
                                    updateParticipantStatus(
                                      peserta,
                                      event.target.value,
                                    )
                                  }
                                  disabled={
                                    !peserta.id_absensi_peserta ||
                                    updatingParticipantId ===
                                      peserta.id_absensi_peserta
                                  }
                                  className={`px-2 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                                    peserta.status_kehadiran === "HADIR"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : peserta.status_kehadiran ===
                                          "BELUM ABSEN"
                                        ? "bg-gray-100 text-gray-600 border-gray-200"
                                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  }`}
                                  title={
                                    peserta.id_absensi_peserta
                                      ? "Ubah status kehadiran"
                                      : "Peserta belum memiliki data absensi"
                                  }
                                >
                                  <option value="HADIR">HADIR</option>
                                  <option value="IZIN">IZIN</option>
                                  <option value="SAKIT">SAKIT</option>
                                  <option value="ALPA">ALPA</option>
                                  {!peserta.id_absensi_peserta && (
                                    <option value="BELUM ABSEN">
                                      BELUM ABSEN
                                    </option>
                                  )}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {formatDateTime(peserta.check_in_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHECK-OUT OLEH ADMIN */}
      {checkoutTarget && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCheckoutTarget(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl relative w-full max-w-md animate-slide-up"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCheckoutTarget(null)}
              className="absolute top-2 right-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 z-[70]"
              title="Tutup"
            >
              <AiOutlineClose size={24} />
            </button>

            <CheckoutMentorForm
              absensi={checkoutTarget}
              onClose={() => setCheckoutTarget(null)}
              onSuccess={handleCheckoutSuccess}
            />
          </div>
        </div>
      )}

      {/* MODAL CHECK-OUT GROUP OLEH ADMIN (v2) */}
      {groupCheckoutTarget && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setGroupCheckoutTarget(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl relative w-full max-w-md animate-slide-up"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGroupCheckoutTarget(null)}
              className="absolute top-2 right-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 z-[70]"
              title="Tutup"
            >
              <AiOutlineClose size={24} />
            </button>

            <CheckoutGroupMentorForm
              group={groupCheckoutTarget}
              onClose={() => setGroupCheckoutTarget(null)}
              onSuccess={fetchAbsensi}
            />
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-red-300"
              title="Tutup preview gambar"
            >
              <AiOutlineClose size={28} />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.label}
              className="max-w-full max-h-[85vh] object-contain rounded-lg bg-white"
            />
          </div>
        </div>
      )}

      {previewLokasi && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewLokasi(null)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-3xl p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-bold text-gray-800">
                  Lokasi {previewLokasi.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {previewLokasi.latitude}, {previewLokasi.longitude}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLokasi(null)}
                className="text-gray-500 hover:text-red-500"
                title="Tutup peta"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
            <iframe
              src={getMapsEmbedUrl(previewLokasi)}
              title={`Peta lokasi ${previewLokasi.label}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[60vh] w-full rounded-lg border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarAbsen;
