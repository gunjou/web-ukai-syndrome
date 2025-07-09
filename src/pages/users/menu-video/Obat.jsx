import React from "react";

const videoData = [
  {
    id: 1,
    title: "Cara Kerja Obat di Dalam Tubuh",
    description:
      "Video penjelasan mekanisme kerja obat di sistem tubuh manusia.",
    thumbnail: "https://img.youtube.com/vi/K4TOrB7at0Y/0.jpg",
  },
  {
    id: 2,
    title: "Jenis-Jenis Obat dan Fungsinya",
    description: "Mengenal klasifikasi obat umum dan kegunaannya.",
    thumbnail: "https://img.youtube.com/vi/eIrMbAQSU34/0.jpg",
  },
  {
    id: 3,
    title: "Bahaya Salah Konsumsi Obat",
    description: "Efek samping jika obat digunakan tanpa anjuran dokter.",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
  },
  {
    id: 4,
    title: "Dosis Obat Berdasarkan Umur",
    description:
      "Bagaimana menghitung dosis obat untuk bayi, anak-anak, dan dewasa.",
    thumbnail: "https://img.youtube.com/vi/K4TOrB7at0Y/0.jpg",
  },
  {
    id: 5,
    title: "Pentingnya Membaca Label Obat",
    description: "Panduan memahami informasi pada kemasan obat.",
    thumbnail: "https://img.youtube.com/vi/eIrMbAQSU34/0.jpg",
  },
];

const Obat = () => {
  return (
    <div className="p-2">
      <h2 className="text-2xl font-semibold mb-2">List Video</h2>
      <div className="max-h-[340px] overflow-y-auto pr-2 space-y-4">
        {videoData.map((video) => (
          <div
            key={video.id}
            className="flex flex-col sm:flex-row gap-4 bg-white shadow rounded-lg overflow-hidden max-h-[180px]"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full sm:w-60 h-40 object-cover rounded-lg"
            />
            <div className="flex flex-col justify-center p-4 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                {video.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Obat;
