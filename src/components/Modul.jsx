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
    <section className="modul py-16 bg-white max-h-screen rounded-b-[30px] text-center px-4 font-poppins">
      {/* //<div className="bg-yellow-400 w-full h-[150px] rounded-b-[30px] z-0"></div> */}
      <div className="bg-biru-gelap relative rounded-[30px] px-4 py-8 mx-6 shadow-md sticky z-30 h-auto">
        {/* Floating Title */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-custom-biru text-white px-[4rem] py-2 rounded-full shadow-md text-lg font-bold z-20">
          Modul Terupdate
        </div>

        {/* Grid for Desktop */}
        <div className="max-w-7xl mx-auto px-8 mt-[2rem] hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {modulData.map((modul, index) => (
            <div key={index} className="p-4 text-center">
              <img
                src={modul.image}
                alt={modul.title}
                className="w-auto h-auto object-cover mb-3"
              />
              <h4 className="text-lg font-bold text-yellow-500 mb-2">
                {modul.title}
              </h4>
              <p className="text-sm text-white text-justify">
                {modul.description}
              </p>
            </div>
          ))}
        </div>

        {/* Slider for Mobile */}
        <div className="md:hidden mt-6">
          <Slider {...sliderSettings}>
            {modulData.map((modul, index) => (
              <div key={index} className="p-4 text-center">
                <img
                  src={modul.image}
                  alt={modul.title}
                  className="w-full h-full object-cover mb-3"
                />
                <h4 className="text-lg font-bold text-yellow-500 mb-2">
                  {modul.title}
                </h4>
                <p className="text-sm text-white text-justify">
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
