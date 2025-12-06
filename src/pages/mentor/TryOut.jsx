import React, { useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";
import { IoFilterCircleOutline, IoCloseCircleOutline } from "react-icons/io5";
import Api from "../../utils/Api.jsx";

const Tryout = () => {
  const [tryouts, setTryouts] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FILTER STATE ---
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

  // FILTER DATA
  const filteredTryouts = filter
    ? tryouts.filter((to) =>
        to.judul.toLowerCase().includes(filter.toLowerCase())
      )
    : tryouts;

  // ---- RENDER MODAL FILTER ----
  const renderFilterModal = () => {
    if (!showFilterModal) return null;

    // generate daftar judul unik
    const uniqueTitles = [...new Set(tryouts.map((item) => item.judul))];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Filter Tryout
            </h2>
            <button onClick={() => setShowFilterModal(false)}>
              <IoCloseCircleOutline
                size={26}
                className="text-gray-500 hover:text-black"
              />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-xl p-2">
            {uniqueTitles.map((judul) => (
              <button
                key={judul}
                onClick={() => {
                  setFilter(judul);
                  setShowFilterModal(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm mb-1 transition ${
                  filter === judul ? "bg-black text-white" : "hover:bg-gray-200"
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
              className="px-4 py-2 border bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white w-full h-auto h-p-6">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Tryout
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Daftar Tryout yang tersedia untuk peserta anda.
            </p>
          </div>
          {/* FILTER BUTTON */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white hover:bg-gray-200"
          >
            <IoFilterCircleOutline /> Filter
          </button>
        </div>

        {/* BADGE FILTER */}
        {filter && (
          <div className="mb-4 bg-black text-white px-4 py-2 rounded-lg w-fit flex items-center gap-3">
            Filter: {filter}
            <button
              onClick={() => setFilter("")}
              className="bg-white text-black rounded-md px-2 py-1 text-sm"
            >
              Reset
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat daftar tryout...</p>
          </div>
        ) : filteredTryouts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Tidak ada tryout ditemukan.
          </p>
        ) : (
          <div className="overflow-y-auto max-h-[350px] border rounded-lg">
            <table className="min-w-full border border-gray-300 bg-white">
              <thead className="bg-gray-200 text-gray-700 text-sm font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 border">No</th>
                  <th className="py-3 px-4 border">Judul</th>
                  <th className="py-3 px-4 border">Kelas</th>
                  <th className="py-3 px-4 border">Jumlah Soal</th>
                  <th className="py-3 px-4 border">Durasi</th>
                  <th className="py-3 px-4 border">Max Attempt</th>
                  <th className="py-3 px-4 border">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredTryouts.map((to, i) => (
                  <tr
                    key={to.id_tryout}
                    className="hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => setSelectedTryout(to)}
                  >
                    <td className="py-3 px-4 border text-center">{i + 1}</td>
                    <td className="py-3 px-4 border capitalize">{to.judul}</td>
                    <td className="py-3 px-4 border">{to.nama_kelas}</td>
                    <td className="py-3 px-4 border text-center">
                      {to.jumlah_soal}
                    </td>
                    <td className="py-3 px-4 border text-center">
                      {to.durasi} menit
                    </td>
                    <td className="py-3 px-4 border text-center">
                      {to.max_attempt}
                    </td>
                    <td className="py-3 px-4 border text-center">
                      <span
                        className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${
                          to.visibility === "open"
                            ? "bg-green-100 text-green-700"
                            : to.visibility === "hold"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
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
