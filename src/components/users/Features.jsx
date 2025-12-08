import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const programs = [
    {
      title: "Premium",
      highlight: "70x",
      description: "12x Intensif, 4–5 jam\n60x Online",
      harga: 1500000,
      features: [
        "Free akses record sampai ukai",
        "Tryout CBT via website",
        "Pemantauan perkembangan oleh walikelas",
        "Modul belajar UKAI CBT fisik",
        { text: "Modul belajar OSCE fisik", available: false },
        "Latian 1000 soal via zoom",
        "Pretest & posttest 1200 soal",
        "Free konsultasi kejiwaan oleh walikelas/psikolog",
        "Networking antar kampus",
        "Kisi-kisi dan Prediksi Soal UKMPPAI",
        "*Garansi Lulus",
      ],
    },
    {
      title: "Gold",
      highlight: "73x",
      description: "12x Intensif, 4–5 jam\n60x Online",
      harga: 2500000,
      tag: "Program Favorit",
      features: [
        "Free akses record sampai ukai",
        "Tryout CBT via website",
        "Pemantauan perkembangan oleh walikelas",
        "Modul belajar UKAI CBT fisik",
        "Modul belajar OSCE fisik",
        "Latian 800 soal via zoom",
        "Pretest & posttest 600 soal",
        "Free konsultasi kejiwaan oleh walikelas/psikolog",
        "Networking antar kampus",
        "Kisi-kisi dan Prediksi Soal UKMPPAI",
        "*Garansi Lulus",
      ],
    },
    {
      title: "Silver",
      highlight: "24x",
      description: "12x Intensif, 4–5 jam\n12x Online",
      harga: 1000000,
      features: [
        "Free akses record sampai ukai",
        "Tryout CBT via website",
        "Pemantauan perkembangan oleh walikelas",
        "Modul belajar UKAI CBT fisik",
        { text: "Modul belajar OSCE fisik", available: false },
        "Latian 600 soal via zoom",
        "Pretest & posttest 600 soal",
        "Free konsultasi kejiwaan oleh walikelas/psikolog",
        "Networking antar kampus",
        "Kisi-kisi dan Prediksi Soal UKMPPAI",
        "*Garansi Lulus",
      ],
    },
    {
      title: "Diamond",
      highlight: "27x",
      description: "12x Intensif, 4–5 jam\n12x Online, 3x Kelas OSCE",
      harga: 3500000,
      features: [
        "Free akses record sampai ukai",
        "Tryout CBT via website",
        "Pemantauan perkembangan oleh walikelas",
        "Modul belajar UKAI CBT fisik",
        "Modul belajar OSCE fisik",
        "Latian 400 soal via zoom",
        "Pretest & posttest 400 soal",
        "Free konsultasi kejiwaan oleh walikelas/psikolog",
        "Networking antar kampus",
        "Kisi-kisi dan Prediksi Soal UKMPPAI",
        "*Garansi Lulus",
      ],
    },
  ];

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
  };

  return (
    <section
      id="program"
      className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d] text-center px-2 sm:px-4 font-poppins w-full h-auto my-10"
    >
      <div className="bg-white relative rounded-[20px] px-3 sm:px-6 py-8 mx-2 sm:mx-6 shadow-md">
        {/* Floating Title */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 
    bg-yellow-500 text-white px-6 sm:px-16 py-2 rounded-full shadow-md 
    text-base sm:text-lg font-bold z-20"
        >
          Pilihan Program
        </div>

        <div className="max-w-7xl mx-auto px-1 sm:px-8 mt-10">
          {/* GRID DESKTOP */}
          <div className="hidden md:block">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {programs.map((program, index) => (
                <div
                  key={index}
                  onClick={() => navigate("/pembayaran", { state: program })}
                  className={`cursor-pointer bg-white p-5 shadow-md hover:shadow-lg transition rounded-xl 
                ${
                  program.title === "Gold"
                    ? "border border-red-700 relative"
                    : "border border-gray-300 mt-10"
                }`}
                >
                  {program.tag && (
                    <div className="absolute -top-0 left-0 w-full bg-red-700 text-white py-2 text-sm font-semibold text-center">
                      {program.tag}
                    </div>
                  )}

                  <h4
                    className={`text-xl font-bold text-red-800 mb-1 ${
                      program.title === "Gold" ? "mt-10" : ""
                    }`}
                  >
                    {program.title}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Rp {program.harga.toLocaleString("id-ID")}
                  </p>
                  <div className="text-4xl font-extrabold text-red-800 mb-1">
                    {program.highlight}
                  </div>

                  <div className="text-sm text-yellow-600 font-medium mb-4 whitespace-pre-line">
                    {program.description}
                  </div>

                  <ul className="text-sm text-gray-700 space-y-2">
                    {program.features.map((feat, i) =>
                      typeof feat === "string" ? (
                        <li key={i} className="flex items-start">
                          <FaCheck className="text-green-600 mt-1 mr-2" />
                          <span>{feat}</span>
                        </li>
                      ) : (
                        <li key={i} className="flex items-start">
                          <FaTimes className="text-red-600 mt-1 mr-2" />
                          <span className="line-through text-gray-400">
                            {feat.text}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* SLIDER MOBILE */}
          <div className="md:hidden">
            <Slider {...sliderSettings}>
              {programs.map((program, index) => (
                <div
                  key={index}
                  onClick={() => navigate("/pembayaran", { state: program })}
                  className={`cursor-pointer bg-white p-5 shadow-md hover:shadow-lg transition rounded-xl
              ${
                program.title === "Gold"
                  ? "border-2 border-red-700 relative"
                  : "border border-gray-300 mt-10"
              }`}
                >
                  {program.tag && (
                    <div className="absolute -top-[0rem] left-0 w-full bg-red-700 text-white py-2 text-xs font-semibold text-center">
                      {program.tag}
                    </div>
                  )}

                  <h4
                    className={`text-lg font-bold text-red-800 mb-1 ${
                      program.title === "Gold" ? "mt-10" : ""
                    }`}
                  >
                    {program.title}
                  </h4>

                  <p className="text-xs text-gray-500 mb-2">
                    Rp {program.harga.toLocaleString("id-ID")}
                  </p>

                  <div className="text-3xl font-extrabold text-red-800 mb-1">
                    {program.highlight}
                  </div>

                  <div className="text-xs text-yellow-600 font-medium mb-4 whitespace-pre-line leading-tight">
                    {program.description}
                  </div>

                  <ul className="text-xs text-gray-700 space-y-1.5">
                    {program.features.map((feat, i) =>
                      typeof feat === "string" ? (
                        <li key={i} className="flex items-start">
                          <FaCheck className="text-green-600 mt-0.5 mr-2" />
                          <span>{feat}</span>
                        </li>
                      ) : (
                        <li key={i} className="flex items-start">
                          <FaTimes className="text-red-600 mt-0.5 mr-2" />
                          <span className="line-through text-gray-400">
                            {feat.text}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* SYARAT GARANSI */}
        <div className="text-left px-4 sm:px-8 pt-6">
          <p className="font-semibold text-xs sm:text-sm text-gray-700">
            *Syarat klaim garansi:
          </p>
          <ul className="list-disc list-inside ml-2 sm:ml-4 text-xs sm:text-sm text-gray-400 space-y-0.5">
            <li>Tidak boleh bolos les selama 3x.</li>
            <li>Hafalan seluruh materi wajib terpenuhi.</li>
            <li>Wajib mengerjakan semua pretest & posttest dan tryout.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Features;
