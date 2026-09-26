import React, { useEffect, useRef, useState } from "react";
import {
  AiOutlineClose,
  AiOutlineLoading3Quarters,
  AiOutlineSearch,
  AiOutlineSwap,
} from "react-icons/ai";
import { toast } from "react-toastify";
import Api from "../../../../utils/Api";

const SwitchMentorModal = ({
  setShowModal,
  fetchJadwal,
  selectedJadwal,
  currentPage,
  searchTerm,
  filterKelas,
  limit,
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [jadwal, setJadwal] = useState([]);
  const [selectedJadwal2, setSelectedJadwal2] = useState(null);
  const [searchJadwal, setSearchJadwal] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);

  // ========================================================================
  // SELECTED JADWAL 1
  // ========================================================================

  const selectedJadwal1 = selectedJadwal;

  // ========================================================================
  // FORMAT DATE
  // ========================================================================

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    const date = new Date(`${tanggal}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return tanggal;
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ========================================================================
  // FORMAT TIME
  // ========================================================================

  const formatJam = (jam) => {
    if (!jam) return "-";

    return String(jam).slice(0, 5);
  };

  // ========================================================================
  // GET EFFECTIVE DATE
  // ========================================================================

  const getTanggalEfektif = (item) => {
    return item?.tanggal_efektif || item?.tanggal || null;
  };

  // ========================================================================
  // GET EFFECTIVE START TIME
  // ========================================================================

  const getWaktuMulaiEfektif = (item) => {
    return item?.waktu_mulai_efektif || item?.waktu_mulai || null;
  };

  // ========================================================================
  // GET EFFECTIVE END TIME
  // ========================================================================

  const getWaktuSelesaiEfektif = (item) => {
    return item?.waktu_selesai_efektif || item?.waktu_selesai || null;
  };

  // ========================================================================
  // SEARCH JADWAL
  // ========================================================================

  useEffect(() => {
    const keyword = searchJadwal.trim();

    if (keyword.length < 3) {
      setJadwal([]);
      setIsLoading(false);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setIsDropdownOpen(true);

        const response = await Api.get("/jadwal", {
          params: {
            search: keyword,
            limit: 50,
          },
        });

        const data = response?.data?.data || [];

        const filteredData = Array.isArray(data)
          ? data.filter(
              (item) =>
                Number(item.id_jadwal) !== Number(selectedJadwal1?.id_jadwal),
            )
          : [];

        setJadwal(filteredData);
      } catch (error) {
        console.error("Gagal mencari jadwal:", error);

        setJadwal([]);

        toast.error(error?.response?.data?.message || "Gagal mencari jadwal.");
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchJadwal, selectedJadwal1?.id_jadwal]);

  // ========================================================================
  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // ========================================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========================================================================
  // HANDLE SEARCH CHANGE
  // ========================================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchJadwal(value);
    setSelectedJadwal2(null);

    if (value.trim().length < 3) {
      setJadwal([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsDropdownOpen(true);
  };

  // ========================================================================
  // HANDLE SELECT JADWAL 2
  // ========================================================================

  const handleSelectJadwal = (item) => {
    setSelectedJadwal2(item);
    setSearchJadwal("");
    setJadwal([]);
    setIsDropdownOpen(false);
  };

  // ========================================================================
  // HANDLE CLEAR JADWAL 2
  // ========================================================================

  const handleClearJadwal2 = () => {
    setSelectedJadwal2(null);
    setSearchJadwal("");
    setJadwal([]);
    setIsDropdownOpen(false);
  };

  // ========================================================================
  // HANDLE SUBMIT
  // ========================================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedJadwal1?.id_jadwal) {
      toast.warning("Jadwal pertama tidak ditemukan.");
      return;
    }

    if (!selectedJadwal2?.id_jadwal) {
      toast.warning("Silakan pilih jadwal kedua terlebih dahulu.");
      return;
    }

    if (
      Number(selectedJadwal1.id_jadwal) === Number(selectedJadwal2.id_jadwal)
    ) {
      toast.warning("Jadwal tidak boleh sama.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        id_jadwal_1: Number(selectedJadwal1.id_jadwal),
        id_jadwal_2: Number(selectedJadwal2.id_jadwal),
      };

      await Api.patch("/jadwal/switch-mentor", payload);

      toast.success("Mentor berhasil ditukar.");

      setShowModal(false);

      if (fetchJadwal) {
        fetchJadwal(currentPage, searchTerm, filterKelas, limit);
      }
    } catch (error) {
      console.error("Gagal menukar mentor:", error);

      toast.error(
        error?.response?.data?.message ||
          "Gagal menukar mentor. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // RENDER SEARCH RESULT
  // ========================================================================

  const renderSearchResult = (item) => {
    return (
      <button
        key={item.id_jadwal}
        type="button"
        onClick={() => handleSelectJadwal(item)}
        className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-yellow-50"
      >
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] items-center gap-4 text-sm">
          {/* MENTOR */}
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-800">
              {item.nama_mentor || "-"}
            </p>
          </div>

          {/* KELAS */}
          <div className="min-w-0">
            <p className="truncate text-gray-600">{item.nama_kelas || "-"}</p>
          </div>

          {/* TANGGAL */}
          <div>
            <p className="text-gray-600">
              {formatTanggal(getTanggalEfektif(item))}
            </p>
          </div>

          {/* WAKTU */}
          <div>
            <p className="font-medium text-gray-700">
              {formatJam(getWaktuMulaiEfektif(item))}
              {" - "}
              {formatJam(getWaktuSelesaiEfektif(item))}
            </p>
          </div>
        </div>
      </button>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 p-4 backdrop-blur-sm"
      onClick={() => !isSubmitting && setShowModal(false)}
    >
      <div
        className="my-10 max-h-[90vh] w-[95%] max-w-5xl animate-fade-in-down overflow-visible rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ================================================================== */}
        {/* HEADER */}
        {/* ================================================================== */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <AiOutlineSwap className="text-yellow-500" size={22} />
              Tukar Mentor
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pilih jadwal lain untuk menukar mentor dengan jadwal ini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors duration-200 hover:bg-yellow-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* ================================================================== */}
        {/* FORM */}
        {/* ================================================================== */}

        <form onSubmit={handleSubmit} className="mt-6">
          {/* ================================================================ */}
          {/* JADWAL PERTAMA */}
          {/* ================================================================ */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Jadwal Pertama
            </label>

            {selectedJadwal1 ? (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1.5fr_1fr_1fr]">
                  {/* MENTOR */}
                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-gray-400">Mentor</p>

                    <p className="truncate text-sm font-semibold text-gray-800">
                      {selectedJadwal1.nama_mentor || "-"}
                    </p>
                  </div>

                  {/* KELAS */}
                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-gray-400">Kelas</p>

                    <p className="truncate text-sm text-gray-700">
                      {selectedJadwal1.nama_kelas || "-"}
                    </p>
                  </div>

                  {/* TANGGAL */}
                  <div>
                    <p className="mb-1 text-xs text-gray-400">Tanggal</p>

                    <p className="text-sm text-gray-700">
                      {formatTanggal(getTanggalEfektif(selectedJadwal1))}
                    </p>
                  </div>

                  {/* WAKTU */}
                  <div>
                    <p className="mb-1 text-xs text-gray-400">Waktu</p>

                    <p className="text-sm font-medium text-gray-700">
                      {formatJam(getWaktuMulaiEfektif(selectedJadwal1))}
                      {" - "}
                      {formatJam(getWaktuSelesaiEfektif(selectedJadwal1))}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                Data jadwal tidak ditemukan.
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* JADWAL KEDUA */}
          {/* ================================================================ */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Jadwal Kedua
            </label>

            <div ref={dropdownRef} className="relative">
              {/* ============================================================ */}
              {/* SELECTED JADWAL 2 */}
              {/* ============================================================ */}

              {selectedJadwal2 ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {selectedJadwal2.nama_mentor || "-"}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {selectedJadwal2.nama_kelas || "-"} ·{" "}
                      {formatTanggal(getTanggalEfektif(selectedJadwal2))} ·{" "}
                      {formatJam(getWaktuMulaiEfektif(selectedJadwal2))}
                      {" - "}
                      {formatJam(getWaktuSelesaiEfektif(selectedJadwal2))}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearJadwal2}
                    disabled={isSubmitting}
                    className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Ganti jadwal"
                  >
                    <AiOutlineClose size={18} />
                  </button>
                </div>
              ) : (
                <>
                  {/* ======================================================== */}
                  {/* SEARCH INPUT */}
                  {/* ======================================================== */}

                  <div className="relative">
                    <AiOutlineSearch
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={searchJadwal}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        if (searchJadwal.trim().length >= 3) {
                          setIsDropdownOpen(true);
                        }
                      }}
                      disabled={isSubmitting}
                      placeholder="Cari mentor, kelas, topik, atau catatan..."
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    {isLoading && (
                      <AiOutlineLoading3Quarters
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-yellow-500"
                      />
                    )}
                  </div>

                  {/* ======================================================== */}
                  {/* MINIMUM SEARCH INFO */}
                  {/* ======================================================== */}

                  {searchJadwal.trim().length < 3 && (
                    <p className="mt-2 text-xs text-gray-400">
                      Ketik minimal 3 karakter untuk mencari jadwal.
                    </p>
                  )}

                  {/* ======================================================== */}
                  {/* SEARCH RESULT DROPDOWN */}
                  {/* ======================================================== */}

                  {isDropdownOpen && searchJadwal.trim().length >= 3 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                      {/* ==================================================== */}
                      {/* DROPDOWN HEADER */}
                      {/* ==================================================== */}

                      <div className="sticky top-0 z-10 grid grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        <span>Mentor</span>
                        <span>Kelas</span>
                        <span>Tanggal</span>
                        <span>Waktu</span>
                      </div>

                      {/* ==================================================== */}
                      {/* LOADING */}
                      {/* ==================================================== */}

                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-400">
                          <AiOutlineLoading3Quarters
                            size={18}
                            className="animate-spin text-yellow-500"
                          />
                          Mencari jadwal...
                        </div>
                      ) : jadwal.length > 0 ? (
                        /* ==================================================== */
                        /* SEARCH RESULTS */
                        /* ==================================================== */
                        jadwal.map(renderSearchResult)
                      ) : (
                        /* ==================================================== */
                        /* EMPTY RESULT */
                        /* ==================================================== */
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm font-medium text-gray-500">
                            Jadwal tidak ditemukan.
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Coba gunakan kata kunci lain.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* PREVIEW PERTUKARAN */}
          {/* ================================================================ */}

          {selectedJadwal1 && selectedJadwal2 && (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              {/* ============================================================ */}
              {/* PREVIEW HEADER */}
              {/* ============================================================ */}

              <div className="mb-4 flex items-center gap-2">
                <AiOutlineSwap size={20} className="text-yellow-600" />

                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Konfirmasi Pertukaran
                  </p>

                  <p className="text-xs text-gray-500">
                    Mentor kedua jadwal akan saling ditukar.
                  </p>
                </div>
              </div>

              {/* ============================================================ */}
              {/* PREVIEW CONTENT */}
              {/* ============================================================ */}

              <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
                {/* ========================================================== */}
                {/* JADWAL 1 */}
                {/* ========================================================== */}

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-400">Jadwal 1</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {selectedJadwal1.nama_mentor || "-"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedJadwal1.nama_kelas || "-"}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {formatTanggal(getTanggalEfektif(selectedJadwal1))} ·{" "}
                    {formatJam(getWaktuMulaiEfektif(selectedJadwal1))}
                    {" - "}
                    {formatJam(getWaktuSelesaiEfektif(selectedJadwal1))}
                  </p>
                </div>

                {/* ========================================================== */}
                {/* SWAP ICON */}
                {/* ========================================================== */}

                <AiOutlineSwap
                  size={24}
                  className="mx-auto rotate-90 text-yellow-500 md:rotate-0"
                />

                {/* ========================================================== */}
                {/* JADWAL 2 */}
                {/* ========================================================== */}

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-400">Jadwal 2</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {selectedJadwal2.nama_mentor || "-"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedJadwal2.nama_kelas || "-"}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {formatTanggal(getTanggalEfektif(selectedJadwal2))} ·{" "}
                    {formatJam(getWaktuMulaiEfektif(selectedJadwal2))}
                    {" - "}
                    {formatJam(getWaktuSelesaiEfektif(selectedJadwal2))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ACTION */}
          {/* ================================================================ */}

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={!selectedJadwal1 || !selectedJadwal2 || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menukar...
                </>
              ) : (
                <>
                  <AiOutlineSwap size={18} />
                  Tukar Mentor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwitchMentorModal;
