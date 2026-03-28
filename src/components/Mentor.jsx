import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { CDN_ASSET_URL } from "../utils/Api";

const Mentor = () => {
  // 1. Buat array angka 1 sampai 48
  // 2. Filter angka yang TIDAK ingin ditampilkan (1, 12, 13)
  const mentorIds = Array.from({ length: 48 }, (_, i) => i + 1).filter(
    (id) => id !== 1 && id !== 12 && id !== 13,
  );

  const sliderSettings = {
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
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section
      id="mentor"
      className="pt-16 bg-white px-4 font-poppins h-[100vh] md:h-[130vh] relative"
    >
      <h2 className="flex text-3xl font-bold text-justify ml-2 -mt-[60px] text-center sticky z-40">
        Jaringan Mentor <br /> Terluas Se-Indonesia
      </h2>

      <div className="flex flex-col md:flex-row h-[50%] max-w-7xl mx-auto">
        <div className="w-full md:w-1/3 p-4 bg-white flex items-center justify-center">
          <p className="mb-2 text-left font-normal md:text-left">
            Dengan jaringan mentor terluas, anda akan mendapatkan persiapan UKAI
            yang lebih optimal dan termurah
          </p>
        </div>

        <div className="w-full md:w-2/3 relative">
          <img
            src={`${CDN_ASSET_URL}/maps.png`}
            alt="Peta"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <Slider {...sliderSettings}>
          {mentorIds.map((id) => (
            <div key={id} className="px-2">
              <div className="mentor-card bg-white pt-4 mx-auto w-[220px] text-center transition-all duration-300">
                <img
                  // Panggil URL CDN langsung di sini
                  src={`${CDN_ASSET_URL}/mentor/${id}.png`}
                  alt={`Mentor ${id}`}
                  loading="lazy"
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
