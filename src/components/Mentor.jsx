import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import garis from "../assets/garis.png";
import mentor1 from "../assets/mentor/1.png";
import mentor2 from "../assets/mentor/2.png";
import mentor3 from "../assets/mentor/3.png";
import mentor4 from "../assets/mentor/4.png";
import mentor5 from "../assets/mentor/5.png";
import mentor6 from "../assets/mentor/6.png";
import mentor7 from "../assets/mentor/7.png";
import mentor8 from "../assets/mentor/8.png";
import mentor9 from "../assets/mentor/9.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const locations = [
  { id: 1, name: "Jakarta", lat: -6.2, lng: 106.816666 },
  { id: 2, name: "Surabaya", lat: -7.250445, lng: 112.768845 },
  { id: 3, name: "Bandung", lat: -6.914744, lng: 107.60981 },
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -6.914744,
  lng: 107.60981,
};

const mentorImages = [
  mentor1,
  mentor2,
  mentor3,
  mentor4,
  mentor5,
  mentor6,
  mentor7,
  mentor8,
  mentor9,
];

const Mentor = () => {
  return (
    <section
      id="mentor"
      className="pt-16 bg-white px-4 font-poppins h-[150vh] relative"
    >
      <h2 className="flex text-3xl font-bold text-justify mb-6 ml-2 -mt-[60px] text-center sticky z-40">
        Jaringan Mentor <br />
        Terluas Se-Indonesia
      </h2>

      <div className="flex flex-col md:flex-row h-[500px] max-w-7xl mx-auto sticky z-40">
        {/* Bagian kiri - teks */}
        <div className="w-full md:w-1/3 p-4 bg-white">
          <p className="mb-2">
            Dengan jaringan mentor terluas, anda akan mendapatkan persiapan UKAI
            yang lebih optimal dan termurah
          </p>
        </div>

        {/* Bagian kanan - peta */}
        <div className="w-full md:w-2/3 h-[500px] p-4">
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={5}
            >
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={{ lat: loc.lat, lng: loc.lng }}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
      <div className="mt-8 h-screen max-w-7xl mx-auto px-4">
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
          {mentorImages.map((image, index) => (
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
