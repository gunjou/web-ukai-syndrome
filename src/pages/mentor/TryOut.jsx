import React, { useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";
import { IoFilterCircleOutline, IoCloseCircleOutline } from "react-icons/io5";
import Api from "../../utils/Api.jsx";

const Tryout = () => {
  const [tryouts, setTryouts] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const fetchTryouts = async () => {
      try {
        const response = await Api.get("/tryout/list");
        setTryouts(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data tryout:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTryouts();
  }, []);

  const filteredTryouts = filter
    ? tryouts.filter((to) =>
        to.judul.toLowerCase().includes(filter.toLowerCase())
      )
    : tryouts;

  const renderFilterModal = () => {
    if (!showFilterModal) return null;

    const uniqueTitles = [...new Set(tryouts.map((item) => item.judul))];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-[90%] max-w-md p-6 border dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Tryout
            </h2>
            <button onClick={() => setShowFilterModal(false)}>
              <IoCloseCircleOutline
                size={26}
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-xl p-2">
            {uniqueTitles.map((judul) => (
              <button
                key={judul}
                onClick={() => {
                  setFilter(judul);
                  setShowFilterModal(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm mb-1 transition ${
                  filter === judul
                    ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {judul}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setFilter("");
                setShowFilterModal(false);
              }}
              className="px-4 py-2 border bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 w-full h-auto h-p-6">
      <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-[20px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Tryout
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daftar Tryout yang tersedia untuk peserta anda.
            </p>
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 text-gray-900 dark:text-white transition"
          >
            <IoFilterCircleOutline /> Filter
          </button>
        </div>

        {filter && (
          <div className="mb-4 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg w-fit flex items-center gap-3">
            Filter: {filter}
            <button
              onClick={() => setFilter("")}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-md px-2 py-1 text-sm"
            >
              Reset
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-gray-400 dark:border-gray-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Memuat daftar tryout...
            </p>
          </div>
        ) : filteredTryouts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Tidak ada tryout ditemukan.
          </p>
        ) : (
          <div className="overflow-y-auto max-h-[350px] border dark:border-gray-700 rounded-lg">
            <table className="min-w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 border dark:border-gray-700">No</th>
                  <th className="py-3 px-4 border dark:border-gray-700">
                    Judul
                  </th>
                  <th className="py-3 px-4 border dark:border-gray-700">
                    Nama Kelas
                  </th>
                  <th className="py-3 px-4 border dark:border-gray-700">
                    Jumlah Soal
                  </th>
                  <th className="py-3 px-4 border dark:border-gray-700">
                    Durasi
                  </th>
                  <th className="py-3 px-4 border dark:border-gray-700">
                    Max Attempt
                  </th>
                  <th className="py-3 px-4 border dark:border-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTryouts.map((to, i) => (
                  <tr
                    key={to.id_tryout}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                    onClick={() => setSelectedTryout(to)}
                  >
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white text-center">
                      {i + 1}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white capitalize">
                      {to.judul}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white">
                      {to.nama_kelas}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white text-center">
                      {to.jumlah_soal}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white text-center">
                      {to.durasi} menit
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white text-center">
                      {to.max_attempt}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-700 text-gray-900 dark:text-white text-center">
                      <span
                        className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${
                          to.visibility === "open"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : to.visibility === "hold"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {to.visibility}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {renderFilterModal()}
      </div>
    </div>
  );
};

export default Tryout;
