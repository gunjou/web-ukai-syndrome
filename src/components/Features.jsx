import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Features = () => {
  const programs = [
    {
      title: "Premium",
      highlight: "70x",
      description: "12x Intensif, 4–5 jam\n60x Online",
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
      className="pb-16 pt-4 md:py-16 bg-custom-bg text-center px-4 font-poppins w-full h-auto mt-[12rem]"
    >
      <div className="bg-white relative rounded-[30px] px-4 py-8 mx-6 shadow-md">
        {/* Floating Title */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-400 text-white px-[4rem] py-2 rounded-full shadow-md text-lg font-bold z-20">
          Pilihan Program
        </div>

        {/* Slider for Mobile and Grid for Desktop */}
        <div className="max-w-7xl mx-auto px-8 mt-[2rem]">
          <div className="hidden md:block sm:block">
            {/* Grid for Desktop */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 pt-6 shadow-md hover:shadow-lg transition text-left ${
                    program.title === "Gold"
                      ? "border border-red-700 relative"
                      : "border border-gray-300 mt-10"
                  }`}
                >
                  {program.tag && (
                    <div className="absolute -top-[0rem] left-0 w-full bg-red-700 text-white px-0 py-2 text-sm font-semibold text-center border border-red-700 ">
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
                    Deskripsi item {index + 1}.
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

          {/* Slider for Mobile */}
          <div className="lg:hidden">
            <Slider {...sliderSettings}>
              {programs.map((program, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 pt-6 shadow-md hover:shadow-lg transition text-left ${
                    program.title === "Gold"
                      ? "border-2 border-red-700 relative"
                      : "border border-gray-300 mt-10"
                  }`}
                >
                  {program.tag && (
                    <div className="absolute -top-[0rem] left-0 w-full bg-red-700 text-white px-0 py-2 text-sm font-semibold text-center border border-red-700">
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
                    Deskripsi item {index + 1}.
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
            </Slider>
          </div>
        </div>

        <div className="text-left px-8 pt-8">
          <p className="font-semibold text-sm text-gray-700">
            *Syarat klaim garansi:
          </p>
          <ul className="list-disc list-inside ml-4 text-sm text-gray-400 space-y-0.5">
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
