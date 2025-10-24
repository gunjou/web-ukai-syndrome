import React, { useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";
import TryoutListContent from "./TryOutListContent";
import Api from "../../utils/Api.jsx";

const Tryout = () => {
  const [tryouts, setTryouts] = useState([]);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Ambil data dari endpoint /tryout/list
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

  // 🔹 Jika user memilih salah satu tryout
  if (selectedTryout) {
    return (
      <TryoutListContent
        tryout={selectedTryout}
        onBack={() => setSelectedTryout(null)}
      />
    );
  }

  // 🔹 Daftar tryout
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
        <div className="space-y-3">
          {tryouts.map((to) => (
            <div
              key={to.id_tryout}
              className="p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition flex items-center justify-between"
              onClick={() => setSelectedTryout(to)}
            >
              {/* Kiri: icon dan info */}
              <div className="flex items-center gap-3">
                <FiBookOpen className="text-red-500 text-xl" />
                <div>
                  <h2 className="text-md font-semibold">{to.judul}</h2>
                  <p className="text-sm text-gray-600">
                    {to.nama_kelas} • {to.jumlah_soal} Soal • {to.durasi} Menit
                  </p>
                  <p className="text-xs text-gray-500">
                    Maksimum percobaan:{" "}
                    <span className="font-semibold text-gray-700">
                      {to.max_attempt} kali
                    </span>
                  </p>
                </div>
              </div>

              {/* Kanan: status visibility */}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  to.visibility === "open"
                    ? "bg-green-100 text-green-700"
                    : to.visibility === "hold"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {to.visibility === "open"
                  ? "Open"
                  : to.visibility === "hold"
                  ? "Hold"
                  : "Closed"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tryout;
