import React from "react";
import { useParams } from "react-router-dom";
import { HiDocumentText } from "react-icons/hi";

const materiDatabase = {
  farmasi: [
    {
      id: 1,
      title: "Pengantar Ilmu Farmasi",
      description: "Dasar-dasar farmasi dan perannya dalam dunia kesehatan.",
    },
    {
      id: 2,
      title: "Farmakologi Dasar",
      description: "Bagaimana obat bekerja di tubuh manusia.",
    },
  ],
  kimia: [
    {
      id: 1,
      title: "Struktur Atom dan Ikatan Kimia",
      description: "Konsep dasar kimia untuk pemahaman lanjutan.",
    },
  ],
  biologi: [
    {
      id: 1,
      title: "Sel dan Organelnya",
      description: "Unit dasar kehidupan dan fungsinya.",
    },
  ],
  fisika: [
    {
      id: 1,
      title: "Hukum Newton",
      description: "Dasar-dasar mekanika dalam fisika.",
    },
  ],
  matematika: [
    {
      id: 1,
      title: "Aljabar Dasar",
      description: "Konsep variabel, persamaan, dan fungsi dasar.",
    },
  ],
  anatomi: [
    {
      id: 1,
      title: "Sistem Pernapasan Manusia",
      description: "Struktur dan fungsi organ pernapasan.",
    },
  ],
  fisiologi: [
    {
      id: 1,
      title: "Sistem Kardiovaskular",
      description: "Bagaimana jantung dan pembuluh darah bekerja.",
    },
  ],
  "etika-profesi": [
    {
      id: 1,
      title: "Etika Profesi Apoteker",
      description: "Kode etik dan tanggung jawab moral profesi.",
    },
  ],
};

const MateriListContent = () => {
  const { folder } = useParams();
  const materiList = materiDatabase[folder] || [];

  return (
    <div className="p-2">
      <h2 className="text-2xl font-semibold mb-4 capitalize">{folder}</h2>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {materiList.length > 0 ? (
          materiList.map((materi) => (
            <div
              key={materi.id}
              className="flex items-start gap-4 bg-white p-4 shadow rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <HiDocumentText className="text-blue-500 text-3xl flex-shrink-0 mt-1" />
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {materi.title}
                </h3>
                <p className="text-sm text-gray-600">{materi.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Belum ada materi untuk folder ini.</p>
        )}
      </div>
    </div>
  );
};

export default MateriListContent;
