import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import garis from "../assets/garis.png";
import MentorImages from "./MentorImages";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Maps from "../assets/maps.png";

const Mentor = () => {
  return (
    <section
      id="mentor"
      className="pt-16 bg-white px-4 font-poppins h-[100vh] md:h-[130vh] relative"
    >
      <h2 className="flex text-3xl font-bold text-justify ml-2 -mt-[60px] text-center sticky z-40">
        Jaringan Mentor <br />
        Terluas Se-Indonesia
      </h2>

      <div className="flex flex-col md:flex-row h-[50%] max-w-7xl mx-auto">
        {/* Bagian kiri - teks */}
        <div className="w-full md:w-1/3 p-4 bg-white flex items-center justify-center">
          <p className="mb-2 text-left font-normal md:text-left">
            Dengan jaringan mentor terluas, anda akan mendapatkan persiapan UKAI
            yang lebih optimal dan termurah
          </p>
        </div>

        {/* Bagian kanan - peta */}
        <div className="w-full md:w-2/3 relative">
          <img src={Maps} alt="Peta" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="h-screen max-w-7xl mx-auto px-4">
        {/* <h3 className="text-xl font-bold text-blaxk mb-4">
          Mentor Unggulan Kami
        </h3> */}

        <Slider
          {...{
            infinite: true,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: "0px",
            autoplay: true,
            autoplaySpeed: 3000,
            arrows: true,
            responsive: [
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 1,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                },
              },
            ],
          }}
        >
          {MentorImages.map((image, index) => (
            <div key={index} className="px-2">
              <div className="mentor-card bg-white pt-4 mx-auto w-[220px] text-center transition-all duration-300">
                <img
                  src={image}
                  alt={`Mentor ${index + 1}`}
                  className="w-full h-auto"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Mentor;
