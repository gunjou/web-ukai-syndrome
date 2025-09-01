import React from "react";
import Header from "../../components/admin/Header.jsx";
import garisKanan from "../../assets/garis-kanan.png";

const LaporanPage = () => {
  return (
    <div className="list bg-gradient-to-r from-[#a11d1d] to-[#531d1d] min-h-screen relative px-4">
      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px]  h-full w-auto opacity-40 z-0"
        alt=""
      />
      <img
        src={garisKanan}
        className="absolute bottom-0 left-0 pt-[90px]  h-full w-auto opacity-40 rotate-180 transform z-0"
        alt=""
      />

      <Header />

      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 flex justify-center items-center h-[70vh] relative">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            🚧 Sedang Dalam Pengembangan 🚧
          </h1>
          <p className="text-gray-500">
            Halaman <span className="font-semibold">Laporan Hasil Ujian </span>
            sedang dalam proses pengembangan. Silakan kembali lagi nanti.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;
