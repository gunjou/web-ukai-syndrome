import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineSwap } from "react-icons/ai";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { MdOutlineHistory } from "react-icons/md";
import { Navigate } from "react-router-dom";

import Header from "../../../components/admin/Header.jsx";
import Api from "../../../utils/Api.jsx";

const STATUSES = ["PENDING", "DITERIMA", "DITOLAK", "DIBATALKAN", "KADALUARSA"];

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  DITERIMA: "bg-green-100 text-green-800",
  DITOLAK: "bg-red-100 text-red-800",
  DIBATALKAN: "bg-gray-200 text-gray-700",
  KADALUARSA: "bg-purple-100 text-purple-800",
};

const ACTION_STYLES = {
  DIAJUKAN: "bg-blue-100 text-blue-800",
  DITERIMA: "bg-green-100 text-green-800",
  DITOLAK: "bg-red-100 text-red-800",
  DIBATALKAN: "bg-gray-200 text-gray-700",
  KADALUARSA: "bg-purple-100 text-purple-800",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {status || "-"}
  </span>
);

const ActionBadge = ({ action }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
      ACTION_STYLES[action] || "bg-gray-100 text-gray-700"
    }`}
  >
    {action || "-"}
  </span>
);

const MentorNames = ({ request }) => (
  <div className="min-w-[155px] space-y-0.5 text-xs text-gray-700">
    <p className="truncate">
      <span className="font-semibold text-gray-500">Pengaju:</span>{" "}
      {request.mentor_pengaju?.nama || "-"}
    </p>
    <p className="truncate">
      <span className="font-semibold text-gray-500">Tujuan:</span>{" "}
      {request.mentor_tujuan?.nama || "-"}
    </p>
  </div>
);

const GroupSummary = ({ title, group }) => (
  <section className="rounded-lg border border-gray-200 bg-white">
    <h4 className="border-b bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800">
      {title}
    </h4>
    <div className="p-3">
      <p className="text-xs text-gray-700">
        {group?.tanggal || "-"} · {group?.waktu_mulai || "-"}–
        {group?.waktu_selesai || "-"} · {group?.total_jadwal ?? 0} jadwal
      </p>
      {Array.isArray(group?.jadwal) && group.jadwal.length > 0 && (
        <div className="mt-3 max-h-56 overflow-auto rounded-md border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="sticky top-0 border-b bg-gray-200 text-[10px] uppercase text-gray-700">
                <th className="px-2 py-2">ID Jadwal</th>
                <th className="px-2 py-2">Mentor saat ini</th>
                <th className="px-2 py-2">Kelas / Kelompok</th>
                <th className="px-2 py-2">Topik</th>
              </tr>
            </thead>
            <tbody>
              {group.jadwal.map((schedule) => (
                <tr
                  key={schedule.id_jadwal}
                  className="border-b text-xs transition-colors last:border-0 hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-2 py-2">
                    {schedule.id_jadwal}
                  </td>
                  <td className="px-2 py-2">{schedule.nama_mentor || "-"}</td>
                  <td className="px-2 py-2">
                    {schedule.nama_kelas || schedule.nama_kelompok || "-"}
                  </td>
                  <td className="px-2 py-2">{schedule.topik || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
);

const DetailModal = ({ detail, loading, error, onClose }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div className="my-4 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-lg sm:p-6">
      <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-start justify-between gap-4 border-b bg-white px-5 py-4 sm:-mx-6 sm:-mt-6 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Detail Tukar Jadwal
          </h2>
          {detail && (
            <p className="mt-0.5 text-xs text-gray-500">
              Request #{detail.id_request}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail"
          className="rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-red-500"
        >
          <FiX size={20} />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center space-y-2 py-12">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="text-sm italic text-gray-500">Memuat detail...</p>
        </div>
      )}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {!loading && detail && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={detail.status} />
            <span className="text-xs text-gray-600">
              Dibuat {formatDateTime(detail.created_at)}
            </span>
            {detail.responded_at && (
              <span className="text-xs text-gray-600">
                · Direspons {formatDateTime(detail.responded_at)}
              </span>
            )}
          </div>
          <MentorNames request={detail} />
          <div className="grid gap-4 lg:grid-cols-2">
            <GroupSummary
              title="Grup asal (pengaju)"
              group={detail.grup_asal}
            />
            <GroupSummary title="Grup tujuan" group={detail.grup_tujuan} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-3">
              <h4 className="text-sm font-semibold text-gray-800">
                Alasan pengajuan
              </h4>
              <p className="mt-1.5 whitespace-pre-wrap text-xs text-gray-700">
                {detail.alasan || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <h4 className="text-sm font-semibold text-gray-800">
                Catatan respons
              </h4>
              <p className="mt-1.5 whitespace-pre-wrap text-xs text-gray-700">
                {detail.catatan_respon || "-"}
              </p>
            </div>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-bold text-gray-800">
              Riwayat aktivitas
            </h3>
            {Array.isArray(detail.log) && detail.log.length > 0 ? (
              <div className="max-h-64 overflow-auto rounded-md border">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="sticky top-0 bg-gray-200 text-[10px] uppercase text-gray-700">
                    <tr>
                      <th className="px-3 py-2">Waktu</th>
                      <th className="px-3 py-2">Aksi</th>
                      <th className="px-3 py-2">Pelaku</th>
                      <th className="px-3 py-2">Perubahan status</th>
                      <th className="px-3 py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.log.map((entry) => (
                      <tr
                        key={entry.id_log}
                        className="border-t transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-3 py-2">
                          {formatDateTime(entry.created_at)}
                        </td>
                        <td className="px-3 py-2">
                          <ActionBadge action={entry.aksi} />
                        </td>
                        <td className="px-3 py-2">
                          {entry.pelaku?.nama || "Sistem"}
                        </td>
                        <td className="px-3 py-2">
                          {entry.status_lama || "-"} →{" "}
                          {entry.status_baru || "-"}
                        </td>
                        <td className="px-3 py-2">{entry.keterangan || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
                Belum ada riwayat aktivitas.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  </div>
);

const PertukaranJadwalAdmin = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("requests");
  const [filters, setFilters] = useState({});
  const [filterForm, setFilterForm] = useState({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [rows, setRows] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [mentorError, setMentorError] = useState("");
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const fetchMentors = async () => {
      setMentorLoading(true);
      setMentorError("");
      try {
        const response = await Api.get("/mentor?page=1&limit=999");
        const result = response.data;
        const mentorRows = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : [];
        setMentors(mentorRows);
      } catch (requestError) {
        console.error("Gagal memuat daftar mentor:", requestError);
        setMentorError(
          getErrorMessage(requestError, "Gagal memuat daftar mentor.")
        );
      } finally {
        setMentorLoading(false);
      }
    };

    fetchMentors();
  }, [isAdmin]);

  const fetchRows = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const endpoint =
      activeTab === "requests" ? "/jadwal/tukar" : "/jadwal/tukar/log";

    try {
      const response = await Api.get(`${endpoint}?${params.toString()}`);
      const result = response.data;
      setRows(Array.isArray(result?.data) ? result.data : []);
      setMeta({
        total: Number(result?.meta?.total) || 0,
        total_pages: Math.max(Number(result?.meta?.total_pages) || 1, 1),
      });
    } catch (requestError) {
      console.error("Gagal memuat data tukar jadwal:", requestError);
      setRows([]);
      setMeta({ total: 0, total_pages: 1 });
      setError(
        getErrorMessage(requestError, "Gagal memuat data tukar jadwal.")
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, isAdmin, page, perPage]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const response = await Api.get(`/jadwal/tukar/${id}`);
      setDetail(response.data?.data || null);
    } catch (requestError) {
      console.error("Gagal memuat detail tukar jadwal:", requestError);
      setDetailError(
        getErrorMessage(requestError, "Gagal memuat detail tukar jadwal.")
      );
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const nextFilters = {};
    if (activeTab === "requests") {
      if (filterForm.status) nextFilters.status = filterForm.status;
      if (filterForm.id_mentor?.trim()) {
        nextFilters.id_mentor = filterForm.id_mentor.trim();
      }
    } else {
      ["id_request", "id_mentor", "aksi", "start_date", "end_date"].forEach(
        (key) => {
          if (filterForm[key]) nextFilters[key] = filterForm[key];
        }
      );
    }

    const timeoutId = setTimeout(() => {
      setPage(1);
      setFilters(nextFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeTab, filterForm]);

  const changeTab = (nextTab) => {
    setActiveTab(nextTab);
    setFilters({});
    setFilterForm({});
    setPage(1);
  };

  if (!isAdmin) {
    const destination =
      user?.role === "mentor"
        ? "/mentor-home"
        : user?.role === "peserta"
        ? "/home"
        : "/login";
    return <Navigate to={destination} replace />;
  }

  const totalPages = Math.max(Number(meta.total_pages) || 1, 1);

  return (
    <div className="user relative min-h-screen bg-gradient-to-r from-[#a11d1d] to-[#531d1d] px-4">
      <Header />
      <main className="px-4 py-3 md:px-5 md:py-4">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-800">
                  Tukar Jadwal
                </h1>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Pantau permintaan pertukaran dan riwayat aksi antar mentor.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2.5">
                  <button
                    type="button"
                    onClick={() => changeTab("requests")}
                    className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                      activeTab === "requests"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <AiOutlineSwap className="h-3.5 w-3.5" />
                    Permintaan
                  </button>
                  <button
                    type="button"
                    onClick={() => changeTab("logs")}
                    className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                      activeTab === "logs"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <MdOutlineHistory className="h-3.5 w-3.5" />
                    Riwayat
                  </button>
                </div>
                <button
                  type="button"
                  onClick={fetchRows}
                  disabled={loading}
                  className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-500 px-2.5 text-xs font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  Muat ulang
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 items-end gap-2 border-b bg-gray-50/60 px-4 py-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 md:px-5">
            {activeTab === "requests" ? (
              <>
                <label className="block text-[11px] font-semibold text-gray-600">
                  Status
                  <select
                    value={filterForm.status || ""}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        status: event.target.value,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  >
                    <option value="">Semua status</option>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px] font-semibold text-gray-600">
                  Nama mentor
                  <select
                    value={filterForm.id_mentor || ""}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        id_mentor: event.target.value,
                      })
                    }
                    disabled={mentorLoading || Boolean(mentorError)}
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200 disabled:bg-gray-100"
                  >
                    <option value="">
                      {mentorLoading ? "Memuat mentor..." : "Semua mentor"}
                    </option>
                    {mentors.map((mentor) => {
                      const mentorId = mentor.id_mentor ?? mentor.id_user;
                      if (mentorId == null) return null;
                      return (
                        <option key={mentorId} value={mentorId}>
                          {mentor.nama ||
                            mentor.nama_mentor ||
                            `Mentor #${mentorId}`}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="block text-[11px] font-semibold text-gray-600">
                  ID request
                  <input
                    type="number"
                    min="1"
                    value={filterForm.id_request || ""}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        id_request: event.target.value,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  />
                </label>
                <label className="block text-[11px] font-semibold text-gray-600">
                  Nama mentor
                  <select
                    value={filterForm.id_mentor || ""}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        id_mentor: event.target.value,
                      })
                    }
                    disabled={mentorLoading || Boolean(mentorError)}
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200 disabled:bg-gray-100"
                  >
                    <option value="">
                      {mentorLoading ? "Memuat mentor..." : "Semua mentor"}
                    </option>
                    {mentors.map((mentor) => {
                      const mentorId = mentor.id_mentor ?? mentor.id_user;
                      if (mentorId == null) return null;
                      return (
                        <option key={mentorId} value={mentorId}>
                          {mentor.nama ||
                            mentor.nama_mentor ||
                            `Mentor #${mentorId}`}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label className="block text-[11px] font-semibold text-gray-600">
                  Aksi
                  <select
                    value={filterForm.aksi || ""}
                    onChange={(event) =>
                      setFilterForm({ ...filterForm, aksi: event.target.value })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  >
                    <option value="">Semua aksi</option>
                    {[
                      "DIAJUKAN",
                      ...STATUSES.filter((item) => item !== "PENDING"),
                    ].map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px] font-semibold text-gray-600">
                  Dari tanggal
                  <input
                    type="date"
                    value={filterForm.start_date || ""}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        start_date: event.target.value,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  />
                </label>
                <label className="block text-[11px] font-semibold text-gray-600">
                  Sampai tanggal
                  <input
                    type="date"
                    value={filterForm.end_date || ""}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        end_date: event.target.value,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-700 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  />
                </label>
              </>
            )}

            <div className="col-span-2 flex items-end sm:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setFilterForm({});
                  setFilters({});
                  setPage(1);
                }}
                className="h-8 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mx-4 mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 md:mx-5"
            >
              {error}
            </div>
          )}

          {activeTab === "requests" ? (
            <div className="max-h-[calc(100vh-285px)] overflow-auto">
              <table className="min-w-full bg-white text-left text-xs">
                <thead className="sticky top-0 z-10 border-b bg-gray-200 text-[10px] uppercase text-gray-700">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2.5">Request</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Status</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Mentor</th>
                    <th className="whitespace-nowrap px-3 py-2.5">
                      Jadwal asal
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5">
                      Jadwal tujuan
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5">Dibuat</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-xs italic text-gray-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-xs text-gray-500"
                      >
                        {error
                          ? "Data gagal dimuat."
                          : "Tidak ada permintaan tukar jadwal."}
                      </td>
                    </tr>
                  ) : (
                    rows.map((request) => (
                      <tr
                        key={request.id_request}
                        className="border-b text-xs transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-700">
                          #{request.id_request}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="px-3 py-2.5">
                          <MentorNames request={request} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">
                          {request.grup_asal?.tanggal || "-"} ·{" "}
                          {request.grup_asal?.waktu_mulai || "-"} (
                          {request.grup_asal?.total_jadwal ?? 0})
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">
                          {request.grup_tujuan?.tanggal || "-"} ·{" "}
                          {request.grup_tujuan?.waktu_mulai || "-"} (
                          {request.grup_tujuan?.total_jadwal ?? 0})
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                          {formatDateTime(request.created_at)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => openDetail(request.id_request)}
                            className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-blue-500 px-2 text-[11px] font-medium text-white transition-colors hover:bg-blue-600"
                          >
                            <FiEye className="h-3.5 w-3.5" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-285px)] overflow-auto">
              <table className="min-w-full bg-white text-left text-xs">
                <thead className="sticky top-0 z-10 border-b bg-gray-200 text-[10px] uppercase text-gray-700">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2.5">Waktu</th>
                    <th className="whitespace-nowrap px-3 py-2.5">
                      ID Request
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5">Aksi</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Mentor</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Pelaku</th>
                    <th className="whitespace-nowrap px-3 py-2.5">
                      Keterangan
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-xs italic text-gray-500"
                      >
                        Memuat riwayat...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-xs text-gray-500"
                      >
                        {error
                          ? "Riwayat gagal dimuat."
                          : "Belum ada riwayat aksi."}
                      </td>
                    </tr>
                  ) : (
                    rows.map((entry) => (
                      <tr
                        key={entry.id_log}
                        className="border-b text-xs transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                          {formatDateTime(entry.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-700">
                          #{entry.id_request}
                        </td>
                        <td className="px-3 py-2.5">
                          <ActionBadge action={entry.aksi} />
                          <div className="text-[10px] text-gray-500">
                            {entry.status_lama || "-"} →{" "}
                            {entry.status_baru || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <MentorNames request={entry} />
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">
                          {entry.pelaku?.nama || "Sistem"}
                        </td>
                        <td className="max-w-xs px-3 py-2.5 text-gray-600">
                          <div className="line-clamp-2">
                            {entry.keterangan || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => openDetail(entry.id_request)}
                            className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-blue-500 px-2 text-[11px] font-medium text-white transition-colors hover:bg-blue-600"
                          >
                            <FiEye className="h-3.5 w-3.5" />
                            Request
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-2.5 sm:flex-row md:px-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-md border bg-gray-50 px-2 py-1 text-[11px]">
                <span className="font-bold text-gray-500">DATA:</span>
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setPage(1);
                  }}
                  aria-label="Jumlah data per halaman"
                  className="cursor-pointer bg-transparent font-bold text-blue-600 focus:outline-none"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] font-semibold text-gray-500">
                Total: <span className="text-blue-600">{meta.total}</span>{" "}
                {activeTab === "requests" ? "Request" : "Log"} | Hal{" "}
                <span className="text-blue-600">{page}</span> dari {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  loading || page <= 1
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "border border-blue-500 bg-white text-blue-500 hover:bg-blue-50"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <FiChevronLeft />
                  Previous
                </span>
              </button>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 text-[11px] font-bold text-white">
                {page}
              </span>
              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages))
                }
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  loading || page >= totalPages
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "border border-blue-500 bg-white text-blue-500 hover:bg-blue-50"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  Next
                  <FiChevronRight />
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {selectedId !== null && (
        <DetailModal
          detail={detail}
          loading={detailLoading}
          error={detailError}
          onClose={() => {
            setSelectedId(null);
            setDetail(null);
            setDetailError("");
          }}
        />
      )}
    </div>
  );
};

export default PertukaranJadwalAdmin;
