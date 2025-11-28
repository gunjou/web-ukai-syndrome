import React, { useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";
import Api from "../../utils/Api.jsx";

const Tryout = () => {
  const [tryouts, setTryouts] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="bg-gray-100 w-full h-auto p-6 rounded-[20px] shadow relative">
      <h1 className="text-2xl font-semibold mb-4">Daftar Tryout</h1>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="w-8 h-8 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat daftar tryout...</p>
        </div>
      ) : tryouts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Belum ada tryout tersedia.
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
              {tryouts.map((to, i) => (
                <tr
                  key={to.id_tryout}
                  className="hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => setSelectedTryout(to)}
                >
                  <td className="py-3 px-4 border text-center">{i + 1}</td>
                  <td className="py-3 px-4 border flex items-center gap-2 capitalize">
                    {to.judul}
                  </td>
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
    </div>
  );
};

export default Tryout;
