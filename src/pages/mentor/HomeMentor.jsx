import React, { useEffect, useState } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import logo from "../../assets/logo_syndrome_kuning.png";
import homepage_img from "../../assets/dokter_admin.png";
import garisKanan from "../../assets/garis-kanan.png";
import bgmaps from "../../assets/maps.png";

const HomeMentor = () => {
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ambil kelas yang diampu mentor
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await Api.get("/paket-kelas/mentor");
        setKelasList(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil kelas mentor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKelas();
  }, []);

  const handleKelasClick = (kelas) => {
    // arahkan ke halaman materi dengan membawa id_paketkelas
    // navigate(`/mentor-dashboard/materi?kelas=${kelas.nama_kelas}`);
    localStorage.setItem("kelas", kelas.id_paketkelas); // simpan ke localStorage
    navigate("/mentor-dashboard/materi");
  };

  return (
    <div className="min-h-screen w-auto bg-gradient-to-r from-[#1d3ca1] to-[#1d1d53] flex flex-col items-center relative">
      <img
        src={bgmaps}
        alt="Background Image"
        className="absolute top-0 right-0 pt-[90px] w-full h-full object-cover opacity-10"
      />

      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto opacity-40"
        alt="garis kanan"
      />

      {/* Header */}
      <div className="w-full flex items-center px-6 py-4 shadow-lg bg-white rounded-b-[40px] relative">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="h-8" />
        </div>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-biru-gelap m-0">
          Selamat Datang Mentor
        </h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl px-4 mt-12 relative min-h-auto flex flex-col lg:flex-row">
        {/* Right Menu */}
        <div className="w-full lg:w-3/4 ml-auto text-center lg:text-right">
          <div className="text-3xl lg:text-6xl mt-1 font-bold lg:mt-6 text-white mb-2">
            Kelas Anda
          </div>
          <div className="text-lg text-white font-normal mb-2 sm:mb-8 min-w-md leading-[20px]">
            Pilih kelas yang Anda ampu untuk masuk ke materi
          </div>

          {loading ? (
            <div className="text-white">Memuat daftar kelas...</div>
          ) : kelasList.length === 0 ? (
            <div className="text-white">Anda belum memiliki kelas.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 py-4 sticky z-10">
              {kelasList.map((kelas, idx) => (
                <div key={idx} className="relative">
                  <div
                    onClick={() => handleKelasClick(kelas)}
                    className="flex w-full h-14 pr-8 rounded-lg overflow-hidden shadow-md bg-[#f9f9f9] hover:brightness-95 transition cursor-pointer"
                  >
                    {/* Left Icon */}
                    <div className="lg:w-[40%] md:w-[40%] bg-yellow-500 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 mx-1.5">
                        <FaChalkboardTeacher className="text-yellow-500 text-sm" />
                      </div>
                    </div>

                    {/* Right Text */}
                    <div className="lg:w-[70%] flex flex-col justify-center pl-3 pr-2">
                      <div className="text-xs sm:text-sm text-left font-bold text-[#1f1f1f]">
                        {kelas.nama_kelas}
                      </div>
                      <div className="text-[10px] text-left text-gray-600">
                        Batch {kelas.batch}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Image */}
      <img
        src={homepage_img}
        alt="welcome"
        className="lg:max-h-[50%] max-h-[35%] object-contain absolute bottom-0 left-0"
      />
    </div>
  );
};

export default HomeMentor;
