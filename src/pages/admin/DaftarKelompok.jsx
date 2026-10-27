import React, { useEffect, useState } from "react";
import { AiOutlinePlus, AiOutlineUpload } from "react-icons/ai";
import { FiEye, FiRefreshCw } from "react-icons/fi";
import { BsTrash3 } from "react-icons/bs";
import { LuPencil } from "react-icons/lu";
import { toast } from "react-toastify";
import Header from "../../components/admin/Header.jsx";
import Api from "../../utils/Api.jsx";
import DetailKelompokModal from "./modal/DetailKelompokModal.jsx";
import ImportKelompokModal from "./modal/ImportKelompokModal.jsx";
import { ConfirmToast } from "./modal/ConfirmToast.jsx";

const getResponseRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const getStatusLabel = (status) => {
  if (status === 1 || status === "1" || status === true) return "Aktif";
  if (status === 0 || status === "0" || status === false) return "Tidak aktif";
  return status ?? "-";
};

const DaftarKelompok = () => {
  const [kelompokData, setKelompokData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [batchError, setBatchError] = useState("");
  const [kelompokOptions, setKelompokOptions] = useState([]);
  const [kelompokOptionsError, setKelompokOptionsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedKelompokId, setSelectedKelompokId] = useState(null);
  const [editingKelompok, setEditingKelompok] = useState(null);
  const [editedNamaKelompok, setEditedNamaKelompok] = useState("");
  const [editedKelompokBatchId, setEditedKelompokBatchId] = useState("");
  const [isSavingKelompok, setIsSavingKelompok] = useState(false);
  const [editKelompokError, setEditKelompokError] = useState("");
  const [showCreateKelompok, setShowCreateKelompok] = useState(false);
  const [newNamaKelompok, setNewNamaKelompok] = useState("");
  const [newKelompokBatchId, setNewKelompokBatchId] = useState("");
  const [isCreatingKelompok, setIsCreatingKelompok] = useState(false);
  const [createKelompokError, setCreateKelompokError] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let isCurrentRequest = true;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
        });
        if (searchTerm) params.set("search", searchTerm);
        if (selectedBatchId) params.set("id_batch", selectedBatchId);

        const response = await Api.get(`/kelompok?${params.toString()}`);
        if (!isCurrentRequest) return;

        const payload = response.data;
        const rows = getResponseRows(payload);
        const metadata = payload?.meta || payload?.pagination || payload || {};
        const total = Number(metadata.total) || 0;
        const pages =
          Number(metadata.total_page) ||
          (total > 0 ? Math.ceil(total / limit) : 1);

        setKelompokData(rows);
        setTotalData(total);
        setTotalPage(Math.max(pages, 1));
        setCurrentPage(Number(metadata.page) || currentPage);
      } catch (requestError) {
        if (!isCurrentRequest) return;
        console.error("Gagal mengambil data kelompok:", requestError);
        setError("Gagal memuat data kelompok. Silakan coba lagi.");
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [currentPage, limit, searchTerm, selectedBatchId, refreshKey]);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchBatches = async () => {
      setBatchError("");
      try {
        const response = await Api.get("/batch");
        if (isCurrentRequest) setBatchData(getResponseRows(response.data));
      } catch (requestError) {
        if (!isCurrentRequest) return;
        console.error("Gagal mengambil daftar batch:", requestError);
        setBatchError("Daftar batch tidak dapat dimuat.");
      }
    };

    fetchBatches();
    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchKelompokOptions = async () => {
      setKelompokOptionsError("");
      try {
        const params = new URLSearchParams();
        if (selectedBatchId) params.set("id_batch", selectedBatchId);
        const query = params.toString();
        const response = await Api.get(
          `/kelompok/all${query ? `?${query}` : ""}`
        );
        if (isCurrentRequest) {
          setKelompokOptions(getResponseRows(response.data));
        }
      } catch (requestError) {
        if (!isCurrentRequest) return;
        console.error("Gagal mengambil opsi kelompok:", requestError);
        setKelompokOptionsError("Saran kelompok tidak dapat dimuat.");
      }
    };

    fetchKelompokOptions();
    return () => {
      isCurrentRequest = false;
    };
  }, [selectedBatchId]);

  const handleBatchChange = (event) => {
    setSelectedBatchId(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPage) setCurrentPage(page);
  };

  const handleRetry = () => setRefreshKey((key) => key + 1);
  const handleImportSuccess = () => {
    setRefreshKey((key) => key + 1);
  };

  const openEditKelompok = (kelompok) => {
    setEditingKelompok(kelompok);
    setEditedNamaKelompok(kelompok.nama_kelompok || "");
    const batchId =
      kelompok.id_batch ??
      kelompok.batch?.id_batch ??
      batchData.find((batch) => batch.nama_batch === kelompok.nama_batch)
        ?.id_batch ??
      "";
    setEditedKelompokBatchId(batchId === "" ? "" : String(batchId));
    setEditKelompokError("");
  };

  const closeEditKelompok = () => {
    if (isSavingKelompok) return;
    setEditingKelompok(null);
    setEditedNamaKelompok("");
    setEditedKelompokBatchId("");
    setEditKelompokError("");
  };

  const handleUpdateKelompok = async (event) => {
    event.preventDefault();
    const namaKelompok = editedNamaKelompok.trim();
    if (!namaKelompok || !editedKelompokBatchId) {
      setEditKelompokError("Batch dan nama kelompok wajib diisi.");
      return;
    }

    setIsSavingKelompok(true);
    setEditKelompokError("");
    try {
      const numericBatchId = Number(editedKelompokBatchId);
      await Api.put(
        `/kelompok/${encodeURIComponent(editingKelompok.id_kelompok)}`,
        {
          id_batch: Number.isNaN(numericBatchId)
            ? editedKelompokBatchId
            : numericBatchId,
          nama_kelompok: namaKelompok,
        }
      );
      toast.success("Nama kelompok berhasil diperbarui.");
      setEditingKelompok(null);
      setEditedNamaKelompok("");
      setEditedKelompokBatchId("");
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      console.error("Gagal memperbarui nama kelompok:", requestError);
      setEditKelompokError(
        requestError.response?.data?.message ||
          "Gagal memperbarui kelompok. Silakan coba lagi."
      );
    } finally {
      setIsSavingKelompok(false);
    }
  };

  const closeCreateKelompok = () => {
    if (isCreatingKelompok) return;
    setShowCreateKelompok(false);
    setNewNamaKelompok("");
    setNewKelompokBatchId("");
    setCreateKelompokError("");
  };

  const handleCreateKelompok = async (event) => {
    event.preventDefault();
    const namaKelompok = newNamaKelompok.trim();
    if (!newKelompokBatchId || !namaKelompok) {
      setCreateKelompokError("Batch dan nama kelompok wajib diisi.");
      return;
    }

    setIsCreatingKelompok(true);
    setCreateKelompokError("");
    try {
      const numericBatchId = Number(newKelompokBatchId);
      await Api.post("/kelompok", {
        id_batch: Number.isNaN(numericBatchId)
          ? newKelompokBatchId
          : numericBatchId,
        nama_kelompok: namaKelompok,
      });
      toast.success("Kelompok berhasil ditambahkan.");
      setShowCreateKelompok(false);
      setNewNamaKelompok("");
      setNewKelompokBatchId("");
      setCurrentPage(1);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      console.error("Gagal menambahkan kelompok:", requestError);
      setCreateKelompokError(
        requestError.response?.data?.message ||
          "Gagal menambahkan kelompok. Silakan coba lagi."
      );
    } finally {
      setIsCreatingKelompok(false);
    }
  };

  const handleDeleteKelompok = (kelompok) => {
    ConfirmToast(
      `Hapus kelompok "${
        kelompok.nama_kelompok || "ini"
      }" beserta seluruh anggotanya?`,
      async () => {
        try {
          await Api.delete(
            `/kelompok/${encodeURIComponent(kelompok.id_kelompok)}`
          );
          toast.success("Kelompok dan seluruh anggotanya berhasil dihapus.");
          if (String(selectedKelompokId) === String(kelompok.id_kelompok)) {
            setSelectedKelompokId(null);
          }
          setRefreshKey((key) => key + 1);
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

  const renderRows = () =>
    kelompokData.map((kelompok, index) => {
      const rawStatus = kelompok.status ?? kelompok.status_kelompok;
      const status = getStatusLabel(rawStatus);
      const normalizedStatus = String(status).toLowerCase();
      const statusClass =
        normalizedStatus === "aktif" || normalizedStatus === "active"
          ? "bg-green-100 text-green-700"
          : normalizedStatus === "nonaktif" ||
            normalizedStatus === "inactive" ||
            normalizedStatus === "tidak aktif"
          ? "bg-gray-200 text-gray-700"
          : "bg-yellow-100 text-yellow-800";

      return (
        <tr
          key={kelompok.id_kelompok ?? `${currentPage}-${index}`}
          className="bg-gray-100 hover:bg-gray-200"
        >
          <td className="border px-3 py-3 text-center">
            {(currentPage - 1) * limit + index + 1}
          </td>
          <td className="border px-4 py-3 font-medium">
            {kelompok.nama_kelompok || "-"}
          </td>
          <td className="border px-4 py-3">{kelompok.nama_batch || "-"}</td>
          <td className="border px-4 py-3 text-center">
            {kelompok.jumlah_anggota ??
              kelompok.total_anggota ??
              kelompok.jumlah_member ??
              0}
          </td>
          <td className="border px-4 py-3 text-center">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
            >
              {status}
            </span>
          </td>
          <td className="border px-3 py-2 text-center">
            <div className="flex justify-center gap-2">
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => setSelectedKelompokId(kelompok.id_kelompok)}
                  disabled={!kelompok.id_kelompok}
                  className="rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  aria-label={`Lihat detail ${
                    kelompok.nama_kelompok || "kelompok"
                  }`}
                >
                  <FiEye size={16} />
                </button>
                <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block group-focus:block">
                  Detail kelompok
                </span>
              </div>
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => openEditKelompok(kelompok)}
                  disabled={!kelompok.id_kelompok}
                  className="rounded-full bg-amber-500 p-2 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                  aria-label={`Edit ${kelompok.nama_kelompok || "kelompok"}`}
                >
                  <LuPencil size={16} />
                </button>
                <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block group-focus:block">
                  Edit Data Kelompok
                </span>
              </div>
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => handleDeleteKelompok(kelompok)}
                  disabled={!kelompok.id_kelompok}
                  className="rounded-full bg-red-600 p-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  aria-label={`Hapus ${kelompok.nama_kelompok || "kelompok"}`}
                >
                  <BsTrash3 size={16} />
                </button>
                <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block group-focus:block">
                  Hapus kelompok
                </span>
              </div>
            </div>
          </td>
        </tr>
      );
    });

  return (
    <div className="user min-h-screen relative bg-gradient-to-r from-[#a11d1d] to-[#531d1d] px-4">
      <Header />
      <main className="relative mx-4 mt-8 rounded-[30px] bg-white pb-6 shadow-md">
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 md:flex-row">
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari kelompok atau batch..."
              aria-label="Cari nama kelompok atau batch"
              list="kelompok-suggestions"
              className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 sm:w-64"
            />
            <datalist id="kelompok-suggestions">
              {kelompokOptions.map((kelompok, index) => (
                <option
                  key={
                    kelompok.id_kelompok ?? `${kelompok.nama_kelompok}-${index}`
                  }
                  value={kelompok.nama_kelompok || ""}
                  label={kelompok.nama_batch || ""}
                />
              ))}
            </datalist>
            <select
              value={selectedBatchId}
              onChange={handleBatchChange}
              aria-label="Filter berdasarkan batch"
              className="rounded-lg border bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Semua batch</option>
              {batchData.map((batch) => (
                <option key={batch.id_batch} value={batch.id_batch}>
                  {batch.nama_batch}
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-xl font-bold text-center">Daftar Kelompok</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh daftar kelompok"
              title="Refresh"
            >
              <FiRefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateKelompokError("");
                setShowCreateKelompok(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <AiOutlinePlus size={18} />
              Tambah Kelompok
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
            >
              <AiOutlineUpload size={18} />
              Import Anggota
            </button>
          </div>
        </div>

        {batchError && (
          <p className="px-6 pb-3 text-sm text-amber-700" role="status">
            {batchError}
          </p>
        )}
        {kelompokOptionsError && (
          <p className="px-6 pb-3 text-sm text-amber-700" role="status">
            {kelompokOptionsError}
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="text-sm italic text-gray-500">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-600" role="alert">
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            <div className="max-h-[66vh] overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="sticky top-0 z-10 border-b bg-gray-200">
                  <tr className="text-left text-xs uppercase text-gray-700">
                    <th className="px-3 py-3 text-center">No</th>
                    <th className="px-4 py-3">Nama Kelompok</th>
                    <th className="px-4 py-3">Nama Batch</th>
                    <th className="px-4 py-3 text-center">Jumlah Anggota</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelompokData.length > 0 ? (
                    renderRows()
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        Tidak ada kelompok yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 px-6 pt-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 rounded-lg border bg-gray-50 px-2 py-1 text-xs">
                  <span className="font-bold text-gray-500">LIMIT:</span>
                  <select
                    value={limit}
                    onChange={(event) => {
                      setLimit(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="cursor-pointer bg-transparent font-bold text-blue-600 focus:outline-none"
                  >
                    {[5, 10, 20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-xs font-semibold text-gray-500">
                  Total: <span className="text-blue-600">{totalData}</span>{" "}
                  kelompok | Halaman{" "}
                  <span className="text-blue-600">{currentPage}</span> dari{" "}
                  {totalPage}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="rounded-lg border px-3 py-1 text-xs font-bold text-blue-600 enabled:hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage >= totalPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="rounded-lg border px-3 py-1 text-xs font-bold text-blue-600 enabled:hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      {showImportModal && (
        <ImportKelompokModal
          batchData={batchData}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
      {selectedKelompokId && (
        <DetailKelompokModal
          kelompokId={selectedKelompokId}
          onClose={() => setSelectedKelompokId(null)}
          onGroupDeleted={() => {
            setSelectedKelompokId(null);
            setRefreshKey((key) => key + 1);
          }}
        />
      )}
      {editingKelompok && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onClick={closeEditKelompok}
        >
          <form
            onSubmit={handleUpdateKelompok}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-kelompok-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="edit-kelompok-title"
              className="mb-4 text-lg font-bold text-gray-900"
            >
              Edit Data Kelompok
            </h2>
            <label
              htmlFor="edit-kelompok-batch"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Batch
            </label>
            <select
              id="edit-kelompok-batch"
              required
              value={editedKelompokBatchId}
              onChange={(event) => setEditedKelompokBatchId(event.target.value)}
              disabled={isSavingKelompok}
              className="mb-4 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            >
              <option value="">Pilih batch</option>
              {batchData.map((batch) => (
                <option key={batch.id_batch} value={batch.id_batch}>
                  {batch.nama_batch}
                </option>
              ))}
            </select>
            <label
              htmlFor="edit-nama-kelompok"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nama kelompok
            </label>
            <input
              id="edit-nama-kelompok"
              type="text"
              value={editedNamaKelompok}
              onChange={(event) => setEditedNamaKelompok(event.target.value)}
              maxLength={150}
              autoFocus
              disabled={isSavingKelompok}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            />
            {editKelompokError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {editKelompokError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditKelompok}
                disabled={isSavingKelompok}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  isSavingKelompok ||
                  !editedNamaKelompok.trim() ||
                  !editedKelompokBatchId
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSavingKelompok ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
      {showCreateKelompok && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onClick={closeCreateKelompok}
        >
          <form
            onSubmit={handleCreateKelompok}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-kelompok-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="create-kelompok-title"
              className="mb-4 text-lg font-bold text-gray-900"
            >
              Tambah Kelompok
            </h2>
            <label
              htmlFor="create-kelompok-batch"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Batch
            </label>
            <select
              id="create-kelompok-batch"
              required
              value={newKelompokBatchId}
              onChange={(event) => setNewKelompokBatchId(event.target.value)}
              disabled={isCreatingKelompok}
              className="mb-4 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            >
              <option value="">Pilih batch</option>
              {batchData.map((batch) => (
                <option key={batch.id_batch} value={batch.id_batch}>
                  {batch.nama_batch}
                </option>
              ))}
            </select>
            <label
              htmlFor="create-nama-kelompok"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nama kelompok
            </label>
            <input
              id="create-nama-kelompok"
              type="text"
              required
              value={newNamaKelompok}
              onChange={(event) => setNewNamaKelompok(event.target.value)}
              maxLength={150}
              autoFocus
              disabled={isCreatingKelompok}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            />
            {createKelompokError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {createKelompokError}
              </p>
            )}
            {batchError && (
              <p className="mt-2 text-sm text-amber-700" role="status">
                {batchError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateKelompok}
                disabled={isCreatingKelompok}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  isCreatingKelompok ||
                  !newKelompokBatchId ||
                  !newNamaKelompok.trim()
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isCreatingKelompok ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DaftarKelompok;
