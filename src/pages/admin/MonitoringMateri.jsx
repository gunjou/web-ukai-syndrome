import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineReload, AiOutlineSearch } from "react-icons/ai";
import Header from "../../components/admin/Header.jsx";
import Api from "../../utils/Api.jsx";

const MonitoringMateri = () => {
  const [monitoringData, setMonitoringData] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgress, setFilterProgress] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMonitoring = useCallback(
    async (page = 1, currentLimit = limit, kelasId = selectedKelas) => {
      if (!kelasId) {
        setMonitoringData([]);
        setTotalData(0);
        setTotalPage(1);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          id_paketkelas: kelasId,
          page: String(page),
          limit: String(currentLimit),
        });
        const response = await Api.get(
          `/materi/progress/monitoring?${params.toString()}`
        );
        const result = response.data;
        setMonitoringData(result?.data || []);
        setTotalData(result?.meta?.total || 0);
        setTotalPage(result?.meta?.total_page || 1);
      } catch (requestError) {
        console.error(
          "Gagal mengambil monitoring progress materi:",
          requestError
        );
        setMonitoringData([]);
        setTotalData(0);
        setTotalPage(1);
        setError("Gagal memuat monitoring progress materi.");
      } finally {
        setIsLoading(false);
      }
    },
    [limit, selectedKelas]
  );

  useEffect(() => {
    fetchMonitoring(currentPage, limit, selectedKelas);
  }, [currentPage, fetchMonitoring, limit, selectedKelas]);

  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  useEffect(() => {
    const fetchKelasOptions = async () => {
      try {
        const response = await Api.get("/paket-kelas?limit=999");
        setKelasOptions(response.data?.data || []);
      } catch (requestError) {
        console.error("Gagal mengambil daftar kelas:", requestError);
        setError("Gagal memuat daftar kelas.");
      }
    };

    fetchKelasOptions();
  }, []);

  const handleKelasChange = (event) => {
    setSelectedKelas(event.target.value);
    setCurrentPage(1);
    setMonitoringData([]);
  };

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return monitoringData.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.id_user).includes(query) ||
        String(item.nama || "")
          .toLowerCase()
          .includes(query);
      const progress = Number(item.progress_percentage) || 0;
      const matchesProgress =
        !filterProgress ||
        (filterProgress === "belum" && progress === 0) ||
        (filterProgress === "rendah" && progress > 0 && progress < 50) ||
        (filterProgress === "tinggi" && progress >= 50);

      return matchesSearch && matchesProgress;
    });
  }, [filterProgress, monitoringData, searchTerm]);

  const summary = useMemo(() => {
    const totalMateri = monitoringData.reduce(
      (total, item) => total + (Number(item.total_materi) || 0),
      0
    );
    const totalDibuka = monitoringData.reduce(
      (total, item) => total + (Number(item.materi_dibuka) || 0),
      0
    );

    return {
      peserta: totalData,
      totalMateri,
      totalDibuka,
      rataRata:
        monitoringData.length > 0
          ? monitoringData.reduce(
              (total, item) => total + (Number(item.progress_percentage) || 0),
              0
            ) / monitoringData.length
          : 0,
    };
  }, [monitoringData, totalData]);

  const formatProgress = (value) => `${(Number(value) || 0).toFixed(2)}%`;

  const getProgressColor = (value) => {
    const progress = Number(value) || 0;
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress > 0) return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <div className="user bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 px-4 md:px-8 gap-4">
          <div className="w-full lg:w-auto">
            <h1 className="text-xl font-bold">Monitoring Materi</h1>
            <p className="text-xs text-gray-500 mt-1">
              Pantau progress pembukaan materi peserta.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <select
              value={selectedKelas}
              onChange={handleKelasChange}
              required
              className="w-full sm:w-52 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              <option value="">Pilih Kelas *</option>
              {kelasOptions.map((kelas) => (
                <option key={kelas.id_paketkelas} value={kelas.id_paketkelas}>
                  {kelas.nama_kelas}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-52">
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari nama/ID peserta..."
                className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <select
              value={filterProgress}
              onChange={(event) => setFilterProgress(event.target.value)}
              className="w-full sm:w-44 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              <option value="">Semua Progress</option>
              <option value="belum">Belum dibuka</option>
              <option value="rendah">Progress di bawah 50%</option>
              <option value="tinggi">Progress 50% atau lebih</option>
            </select>
            <button
              type="button"
              onClick={() => fetchMonitoring(currentPage, limit, selectedKelas)}
              disabled={!selectedKelas || isLoading}
              title="Muat ulang data"
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <AiOutlineReload /> Muat Ulang
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-8 mb-5">
          {[
            ["Total Peserta", summary.peserta],
            ["Materi Terbuka", summary.totalDibuka],
            ["Total Materi", summary.totalMateri],
            ["Rata-rata Progress", formatProgress(summary.rataRata)],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 border rounded-lg p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {!selectedKelas ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Pilih kelas untuk melihat monitoring progress materi.
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm italic">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Tidak ada data monitoring yang sesuai.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[58vh]">
              <table className="min-w-[900px] w-full bg-white">
                <thead className="bg-gray-200 sticky top-0 z-10 border-b">
                  <tr className="text-xs uppercase text-gray-700">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3 text-left">Peserta</th>
                    <th className="px-4 py-3 text-center">Total Materi</th>
                    <th className="px-4 py-3 text-center">Sudah Dibuka</th>
                    <th className="px-4 py-3 text-center">Belum Dibuka</th>
                    <th className="px-4 py-3 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => {
                    const progress = Math.min(
                      Math.max(Number(item.progress_percentage) || 0, 0),
                      100
                    );
                    return (
                      <tr
                        key={item.id_user}
                        className="bg-gray-100 hover:bg-gray-300"
                      >
                        <td className="px-4 py-3 text-sm border text-center">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm border">
                          <p className="font-semibold">{item.nama || "-"}</p>
                          <p className="text-xs text-gray-500">
                            ID: {item.id_user}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm border text-center">
                          {item.total_materi || 0}
                        </td>
                        <td className="px-4 py-3 text-sm border text-center text-green-700 font-semibold">
                          {item.materi_dibuka || 0}
                        </td>
                        <td className="px-4 py-3 text-sm border text-center text-gray-600">
                          {item.materi_belum_dibuka || 0}
                        </td>
                        <td className="px-4 py-3 text-sm border min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex-1">
                              <div
                                className={`h-full ${getProgressColor(
                                  progress
                                )} transition-all`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="font-semibold text-xs w-12 text-right">
                              {formatProgress(item.progress_percentage)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-8 mt-4 gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-lg bg-gray-50">
                  <span>LIMIT:</span>
                  <select
                    value={limit}
                    onChange={(event) => setLimit(Number(event.target.value))}
                    className="bg-transparent focus:outline-none font-bold text-blue-600"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span>
                  Total: <strong className="text-blue-600">{totalData}</strong>{" "}
                  peserta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-500 text-blue-500 disabled:border-gray-200 disabled:text-gray-400"
                >
                  Previous
                </button>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPage}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-500 text-blue-500 disabled:border-gray-200 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonitoringMateri;
