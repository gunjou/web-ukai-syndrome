import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import modul_klinis from "../assets/modul/modul_klinis.png";
import industri_sba from "../assets/modul/modul_industri_sba.png";
import osce from "../assets/modul/modul_osce.png";

const Modul = () => {
  const modulData = [
    {
      title: "Klinis",
      image: modul_klinis,
      description:
        "Modul latihan soal klinis dengan total 600 halaman berisikan literature yang jelas sesuai PERMENKES, DiPiro, WHO, Koda-Kimbel.",
    },
    {
      title: "Industri + SBA",
      image: industri_sba,
      description:
        "Modul dan latihan soal industri dan SBA dengan total 450 halaman, berisikan literature yang jelas sesuai Farmakope edisi VI, Ansel dan Kemenkes Kefarmasian.",
    },
    {
      title: "OSCE",
      image: osce,
      description:
        "Modul OSCE ± 200 halaman, dilengkapi dengan gambar alat dan prosedur kerja. Modul berwarna sesuai dengan blueprint dan soal OSCE terbaru.",
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
      id="modul"
      className="py-12 sm:py-16 bg-white rounded-b-[30px] text-center px-3 sm:px-4 font-poppins"
    >
      <div className="bg-biru-gelap relative rounded-[20px] px-3 sm:px-6 py-8 mx-2 sm:mx-6 shadow-md z-30">
        {/* Floating Title */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 
    bg-yellow-500 text-white px-6 sm:px-16 py-2 rounded-full shadow-md 
    text-base sm:text-lg font-bold z-20"
        >
          Modul Terupdate
        </div>

        {/* DESKTOP GRID */}
        <div className="max-w-7xl mx-auto px-2 sm:px-8 mt-10 hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {modulData.map((modul, index) => (
            <div key={index} className="p-4 text-center">
              <img
                src={modul.image}
                alt={modul.title}
                className="w-[80%] mx-auto object-contain mb-4"
              />
              <h4 className="text-xl font-bold text-yellow-500 mb-2">
                {modul.title}
              </h4>
              <p className="text-sm text-white text-justify">
                {modul.description}
              </p>
            </div>
          ))}
        </div>

        {/* MOBILE SLIDER */}
        <div className="md:hidden mt-10">
          <Slider {...sliderSettings}>
            {modulData.map((modul, index) => (
              <div key={index} className="p-3 text-center">
                <img
                  src={modul.image}
                  alt={modul.title}
                  className="w-[70%] mx-auto object-contain mb-4 rounded-lg"
                />

                <h4 className="text-lg font-bold text-yellow-500 mb-1">
                  {modul.title}
                </h4>

                <p className="text-xs text-white text-justify leading-relaxed px-2">
                  {modul.description}
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Modul;
