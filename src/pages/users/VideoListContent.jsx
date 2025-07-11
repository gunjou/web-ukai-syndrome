import React from "react";
import { useParams } from "react-router-dom";

const videoDatabase = {
  obat: [
    {
      id: 1,
      title: "Cara Kerja Obat di Dalam Tubuh",
      description: "Mekanisme kerja obat di sistem tubuh manusia.",
      thumbnail: "https://img.youtube.com/vi/K4TOrB7at0Y/0.jpg",
    },
    {
      id: 2,
      title: "Jenis-Jenis Obat dan Fungsinya",
      description: "Klasifikasi obat dan kegunaannya.",
      thumbnail: "https://img.youtube.com/vi/eIrMbAQSU34/0.jpg",
    },
  ],
  cpob: [
    {
      id: 1,
      title: "Apa itu CPOB?",
      description: "Penjelasan dasar Cara Pembuatan Obat yang Baik.",
      thumbnail: "https://img.youtube.com/vi/BtN-goy9VOY/0.jpg",
    },
    {
      id: 2,
      title: "Standar Produksi Obat Modern",
      description: "Penerapan prinsip CPOB di industri farmasi.",
      thumbnail: "https://img.youtube.com/vi/3fumBcKC6RE/0.jpg",
    },
  ],
  "ilmu-resep": [
    {
      id: 1,
      title: "Dasar Ilmu Resep",
      description: "Apa itu resep? Bagaimana menuliskannya dengan benar?",
      thumbnail: "https://img.youtube.com/vi/2Vv-BfVoq4g/0.jpg",
    },
  ],
  suntik: [
    {
      id: 1,
      title: "Teknik Suntik Aman",
      description: "Cara menyuntik dengan benar sesuai standar medis.",
      thumbnail: "https://img.youtube.com/vi/SQ94-kdFJzE/0.jpg",
    },
  ],
  infeksi: [
    {
      id: 1,
      title: "Jenis-Jenis Infeksi dan Obatnya",
      description: "Infeksi bakteri, virus, jamur, dan obat yang digunakan.",
      thumbnail: "https://img.youtube.com/vi/tgbNymZ7vqY/0.jpg",
    },
  ],
  "covid-19": [
    {
      id: 1,
      title: "COVID-19 dan Imunisasi",
      description: "Pentingnya vaksinasi dan obat pendukung selama pandemi.",
      thumbnail: "https://img.youtube.com/vi/7QUtEmBT_-w/0.jpg",
    },
  ],
  demam: [
    {
      id: 1,
      title: "Menangani Demam Secara Tepat",
      description: "Obat penurun panas dan kapan harus ke dokter.",
      thumbnail: "https://img.youtube.com/vi/y6120QOlsfU/0.jpg",
    },
  ],
  senku: [
    {
      id: 1,
      title: "Ilmuwan Gila & Obat di Anime Dr. Stone",
      description: "Cara Senku membuat obat dari nol!",
      thumbnail: "https://i3.ytimg.com/vi/uNhI52RWwDk/hqdefault.jpg",
    },
  ],
};

const VideoListContent = () => {
  const { folder } = useParams();
  const videoList = videoDatabase[folder] || [];

  return (
    <div className="p-2">
      <h2 className="text-2xl font-semibold mb-2 capitalize">{folder}</h2>
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
        {videoList.length > 0 ? (
          videoList.map((video) => (
            <div
              key={video.id}
              className="flex flex-col sm:flex-row gap-4 bg-white shadow rounded-lg overflow-hidden max-h-[180px]"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full sm:w-60 h-40 object-cover rounded-lg sm:rounded-lg sm:rounded-lg"
              />
              <div className="flex flex-col  p-4 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Belum ada video untuk folder ini.</p>
        )}
      </div>
    </div>
  );
};

export default VideoListContent;
