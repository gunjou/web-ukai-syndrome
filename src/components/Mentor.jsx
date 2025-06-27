import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

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

const Mentor = () => {
  return (
    <section className="py-16 bg-white px-4 font-poppins h-[100vh] relative">
      <h2 className="flex text-3xl font-bold text-justify mb-6 ml-2 -mt-[60px] text-center sticky z-40">
        Jaringan Mentor <br />
        Terluas Se-Indonesia
      </h2>

      <div className="flex flex-col md:flex-row h-[500px] max-w-7xl mx-auto sticky z-40">
        {/* Bagian kiri - teks */}
        <div className="w-full md:w-1/3 p-4 bg-white overflow-auto">
          <p className="pt-[12rem] mb-2">
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
    </section>
  );
};

export default Mentor;
