import React, { useEffect, useState } from "react";
import Navbar from "../../components/users/Navbar";
import Features from "../../components/users/Features";
import Api from "../../utils/Api";

const HomePage = () => {
  const [status, setStatus] = useState(null); // 1, 0, atau "null"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await Api.get("/peserta-kelas/status-batch-peserta");
        setStatus(res.data.is_batch_active);
      } catch (err) {
        console.error("Gagal mengambil status batch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#8f1a1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    // Background disamakan dengan gradien Features agar menyatu (Seamless)
    <div className="min-h-screen bg-gradient-to-r from-[#a11d1d] to-[#531d1d] flex flex-col font-poppins">
      <Navbar />

      <div className="flex-1 pt-10 flex flex-col items-center">
        {/* SECTION KETERANGAN (Paragraf, bukan Card) */}
        <div className="w-full max-w-4xl px-6 pt-16 pb-5 text-center animate-fadeIn">
          <div className="inline-block bg-yellow-500 text-white p-3 rounded-2xl mb-6 shadow-lg animate-bounce">
            <span className="text-3xl">⚠️</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight uppercase">
            {status === 0 ? "Masa Aktif Batch Berakhir" : "Akses Belum Aktif"}
          </h1>

          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-gray-100 text-lg md:text-xl leading-relaxed">
              {status === 0
                ? "Batch Anda saat ini sudah tidak aktif. Hal ini menyebabkan Anda tidak dapat mengakses dashboard belajar sementara waktu."
                : "Anda belum terdaftar dalam batch manapun di sistem kami. Untuk mendapatkan akses dashboard, silakan aktivasi akun Anda."}
            </p>
            <p className="text-yellow-400 font-semibold text-base md:text-lg italic">
              Silakan pilih salah satu program unggulan kami di bawah ini untuk
              mengaktifkan kembali akun Anda.
            </p>
          </div>

          <div className="mt-10">
            <a
              href="https://wa.me/6285353537532"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white border-2 border-white/30 px-6 py-2 rounded-full hover:bg-white hover:text-red-800 transition-all font-medium"
            >
              Butuh bantuan? Hubungi Admin
            </a>
          </div>
        </div>

        {/* SECTION FEATURES (Sudah punya gradien sendiri di dalamnya) */}
        <div className="w-full">
          <Features />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
