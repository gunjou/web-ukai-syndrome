import React, { useEffect, useMemo, useState } from "react";
import {
  AiOutlineClose,
  AiOutlineEye,
  AiOutlineFilePdf,
  AiOutlineReload,
} from "react-icons/ai";
import Header from "../../../components/admin/Header.jsx";
import Api from "../../../utils/Api.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

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
  const [isExporting, setIsExporting] = useState(false);
  const [updatingParticipantId, setUpdatingParticipantId] = useState(null);

  const fetchAbsensi = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedDate) params.set("tanggal", selectedDate);
      const response = await Api.get(`/absensi/mentor?${params.toString()}`);
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
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return absensiData.filter((absensi) => {
      const matchesSearch =
        !query ||
        [absensi.nama_kelas, absensi.nama_mentor, absensi.nickname_mentor]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      const matchesType = !filterType || absensi.type_pertemuan === filterType;

      return matchesSearch && matchesType;
    });
  }, [absensiData, filterType, searchTerm]);

  const openDetail = async (absensi) => {
    setSelectedJadwal(absensi);
    setDetailData(null);
    setDetailError("");
    setIsDetailLoading(true);

    try {
      const response = await Api.get(`/absensi/jadwal/${absensi.id_jadwal}`);
      setDetailData(response.data?.data || null);
    } catch (requestError) {
      console.error("Gagal mengambil detail absensi:", requestError);
      setDetailError("Gagal memuat detail absensi.");
    } finally {
      setIsDetailLoading(false);
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
    if (!absensi.check_in_at) {
      return <span className="text-gray-500">Belum check-in</span>;
    }
    return <span className="font-semibold text-green-700">Sudah check-in</span>;
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
              : item
          ),
        };
      });
      toast.success("Status kehadiran peserta berhasil diperbarui.");
    } catch (requestError) {
      console.error(
        "Gagal memperbarui status kehadiran peserta:",
        requestError
      );
      toast.error(
        requestError.response?.data?.message ||
          "Gagal memperbarui status kehadiran peserta."
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
        `Kelas: ${jadwal.nama_kelas || selectedJadwal.nama_kelas || "-"}`,
        14,
        22
      );
      doc.text(
        `Mentor: ${mentor.nickname_mentor || mentor.nama_mentor || "-"}`,
        14,
        28
      );
      doc.text(
        `Tanggal: ${formatDate(jadwal.tanggal || selectedJadwal.tanggal)}`,
        14,
        34
      );
      doc.text(
        `Jadwal: ${formatTime(jadwal.waktu_mulai)} - ${formatTime(
          jadwal.waktu_selesai
        )} | ${jadwal.type_pertemuan || selectedJadwal.type_pertemuan || "-"}`,
        14,
        40
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
        nextY
      );
      doc.text(
        `Check-out mentor: ${formatDateTime(mentor.check_out_at)}`,
        14,
        nextY + 6
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

      const safeClassName = (jadwal.nama_kelas || "absensi")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
      doc.save(
        `absensi-${safeClassName || "kelas"}-${jadwal.tanggal || "detail"}.pdf`
      );
    } finally {
      setIsExporting(false);
    }
  };

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
                    <th className="px-4 py-3 text-left">Kelas</th>
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
                  {filteredData.map((absensi, index) => (
                    <tr
                      key={absensi.id_absensi_mentor || absensi.id_jadwal}
                      className="bg-gray-100 hover:bg-gray-300"
                    >
                      <td className="px-2 py-2 text-sm border text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm border font-semibold">
                        {absensi.nama_kelas || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm border">
                        {absensi.nickname_mentor || absensi.nama_mentor || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm border text-center">
                        {formatDate(absensi.tanggal)}
                      </td>
                      <td className="px-4 py-2 text-sm border text-center">
                        {formatTime(absensi.waktu_mulai)} -{" "}
                        {formatTime(absensi.waktu_selesai)}
                      </td>
                      <td className="px-4 py-2 text-sm border text-center">
                        {getTypeBadge(absensi.type_pertemuan)}
                      </td>
                      <td className="px-4 py-2 text-sm border text-center">
                        {getCheckInStatus(absensi)}
                      </td>
                      <td className="px-4 py-2 text-sm border text-center">
                        {absensi.check_out_at ? (
                          <span className="font-semibold text-green-700">
                            Selesai
                          </span>
                        ) : (
                          <span className="text-gray-500">Belum check-out</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm border text-center">
                        <button
                          type="button"
                          onClick={() => openDetail(absensi)}
                          title="Lihat detail absensi"
                          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                        >
                          <AiOutlineEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 md:px-8 mt-4 text-xs font-semibold text-gray-500">
              <span>
                Total:{" "}
                <strong className="text-blue-600">{filteredData.length}</strong>{" "}
                absensi
              </span>
              <span>Menampilkan hasil yang sesuai filter</span>
            </div>
          </>
        )}
      </div>

      {selectedJadwal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedJadwal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedJadwal(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              title="Tutup detail"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 pr-8">
              Detail Absensi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedJadwal.nama_kelas} | {formatDate(selectedJadwal.tanggal)}
            </p>
            <button
              type="button"
              onClick={exportPDF}
              disabled={isDetailLoading || !detailData || isExporting}
              className="mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
            >
              <AiOutlineFilePdf />
              {isExporting ? "Membuat PDF..." : "Export PDF"}
            </button>

            {isDetailLoading ? (
              <div className="py-12 text-center text-gray-500">
                Memuat detail absensi...
              </div>
            ) : detailError ? (
              <div className="py-12 text-center text-red-500">
                {detailError}
              </div>
            ) : detailData ? (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500">Mentor</p>
                    <p className="font-semibold">
                      {detailData.mentor?.nickname_mentor ||
                        detailData.mentor?.nama_mentor ||
                        "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-semibold">
                      {formatDateTime(detailData.mentor?.check_in_at)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-semibold">
                      {formatDateTime(detailData.mentor?.check_out_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">
                    Evidence Kehadiran
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Evidence Check-in",
                        url: detailData.mentor?.evidence_checkin_url,
                      },
                      {
                        label: "Evidence Check-out",
                        url: detailData.mentor?.evidence_checkout_url,
                      },
                    ].map((evidence) => (
                      <div
                        key={evidence.label}
                        className="border rounded-lg p-3"
                      >
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {evidence.label}
                        </p>
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
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">
                    Kehadiran Peserta ({detailData.peserta?.length || 0})
                  </h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Nama Peserta</th>
                          <th className="px-4 py-3 text-center">
                            Status Kehadiran
                          </th>
                          <th className="px-4 py-3 text-center">Check-in</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detailData.peserta || []).map((peserta) => (
                          <tr key={peserta.id_peserta} className="border-t">
                            <td className="px-4 py-3">
                              {peserta.nama_peserta || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={peserta.status_kehadiran || ""}
                                onChange={(event) =>
                                  updateParticipantStatus(
                                    peserta,
                                    event.target.value
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
                                    : peserta.status_kehadiran === "BELUM ABSEN"
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
    </div>
  );
};

export default DaftarAbsen;
