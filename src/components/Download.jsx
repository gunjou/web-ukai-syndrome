import React from "react";
import { FaGooglePlay, FaApple, FaDownload } from "react-icons/fa";
import screenshot from "../assets/ss.png"; // pakai 1 gambar utama

const Download = () => {
  const handleNotAvailable = (platform) => {
    alert(`Link ${platform} belum tersedia 🚧`);
  };

  return (
    <section
      id="download"
      className="relative py-20 bg-gradient-to-l from-[#531d1d] to-[#a11d1d] text-white px-6 font-poppins overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Bagian Kiri: Text + Tombol */}
        <div className="flex flex-col items-center md:items-start space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center md:text-left leading-tight">
              Belajar Lebih Mudah, <br /> Kapanpun & Dimanapun
            </h2>
            <p className="mt-4 text-sm md:text-base text-center md:text-left text-gray-200">
              Bawa <strong>Syndrome UKAI</strong> ke dalam genggaman Anda. Akses{" "}
              <em>modul terbaru</em>, <em>mentor profesional</em>, dan
              <em> latihan soal interaktif</em> langsung dari smartphone. Unduh
              sekarang & raih sukses UKAI dengan cara yang lebih praktis!
            </p>
          </div>

          {/* Tombol Download Berbaris */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-start">
            {/* Playstore */}
            <button
              onClick={() => handleNotAvailable("Google Play")}
              className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <FaGooglePlay className="text-green-500 text-2xl" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px]">GET IT ON</span>
                <span className="font-semibold text-sm">Google Play</span>
              </div>
            </button>

            {/* App Store */}
            <button
              onClick={() => handleNotAvailable("App Store")}
              className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <FaApple className="text-white text-2xl" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px]">Download on the</span>
                <span className="font-semibold text-sm">App Store</span>
              </div>
            </button>

            {/* APK (pakai link Google Drive) */}
            <a
              href="https://drive.google.com/file/d/1jd2hyP5S6Tlp-X0RYlIDU5eu8r_HMHhg/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <FaDownload className="text-blue-600 text-2xl" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px]">Direct Install</span>
                <span className="font-semibold text-sm">Download APK</span>
              </div>
            </a>
          </div>
        </div>

        {/* Bagian Kanan: Screenshot */}
        <div className="flex justify-center">
          <img
            src={screenshot}
            alt="Tampilan Aplikasi Syndrome UKAI"
            className="rounded-2xl shadow-2xl max-w-[180px] md:max-w-[180px] lg:max-w-[180px] object-contain transform hover:scale-105 transition duration-300"
          />
        </div>
      </div>
    </section>
  );
};

export default Download;
