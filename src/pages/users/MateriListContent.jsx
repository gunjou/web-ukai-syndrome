import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HiDocumentText } from "react-icons/hi";
import Api from "../../utils/Api";

const MateriListContent = () => {
  const { folder } = useParams();
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiRes, modulRes] = await Promise.all([
          Api.get("/materi/user"),
          Api.get("/modul/user"),
        ]);

        const materiData = materiRes.data.data || [];
        const modulData = modulRes.data.data || [];

        const selectedModul = modulData.find((modul) => {
          const slug = modul.judul.toLowerCase().replace(/\s+/g, "-");
          return slug === folder;
        });

        if (!selectedModul) {
          setMateriList([]);
          setError("Modul tidak ditemukan.");
          setLoading(false);
          return;
        }

        const filtered = materiData.filter(
          (item) => item.id_modul == selectedModul.id_modul
        );

        setMateriList(filtered);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat materi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [folder]);

  return (
    <div className="p-2">
      <h2 className="text-2xl font-semibold mb-4 capitalize">
        {folder?.replace(/-/g, " ")}
      </h2>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : materiList.length > 0 ? (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {materiList.map((materi) => (
            <div
              key={materi.id_materi}
              onClick={() => window.open(materi.url_file, "_blank")}
              className="flex items-start gap-4 bg-white p-4 shadow rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
            >
              <HiDocumentText className="text-blue-500 text-3xl flex-shrink-0 mt-1" />
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {materi.judul}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Belum ada materi untuk folder ini.</p>
      )}
    </div>
  );
};

export default MateriListContent;
