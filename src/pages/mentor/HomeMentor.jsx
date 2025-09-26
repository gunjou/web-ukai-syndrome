import React, { useEffect, useState, useRef } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Api from "../../utils/Api";
import logo from "../../assets/logo_syndrome_kuning.png";
import homepage_img from "../../assets/dokter_admin.png";
import garisKanan from "../../assets/garis-kanan.png";
import bgmaps from "../../assets/maps.png";
import ModalProfile from "../../components/mentor/modal/ModalProfile";
import LoadingOverlay from "../../utils/LoadingOverlay";

const HomeMentor = () => {
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);
  const [isWaliKelas, setIsWaliKelas] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "User";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const saturation = 40 + (hash % 30);
    const lightness = 45 + (hash % 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const avatarColor = stringToColor(userName);

  // ambil kelas yang diampu mentor
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        setLoading(true);
        const endpoint = isWaliKelas
          ? "/paket-kelas/wali-kelas"
          : "/paket-kelas/mentor";

        const response = await Api.get(endpoint);
        setKelasList(response.data.data || []);
        console.log("Data kelas:", response.data.data);
      } catch (error) {
        console.error("Gagal mengambil kelas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, [isWaliKelas]);

  const handleKelasClick = (kelas) => {
    // arahkan ke halaman materi dengan membawa id_paketkelas
    // navigate(`/mentor-dashboard/materi?kelas=${kelas.nama_kelas}`);
    localStorage.setItem("kelas", kelas.id_paketkelas); // simpan ke localStorage
    localStorage.setItem(
      "namaKelas",
      JSON.stringify({ namaKelas: kelas.nama_kelas })
    );
    navigate("/mentor-dashboard/materi");
  };

  const onToggleWaliKelas = () => {
    setIsWaliKelas((prev) => !prev); // toggle true/false
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      <div className="min-h-screen w-auto bg-gradient-to-r from-[#a11d1d] to-[#531d1d] flex flex-col items-center relative">
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
        <div className="w-full flex items-center justify-between px-6 py-4 shadow-lg bg-white rounded-b-[40px] relative">
          {/* Kiri: Logo */}
          <div className="flex items-center space-x-2">
            <img src={logo} alt="logo" className="h-10" />
          </div>

          {/* Tengah: Judul */}
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-biru-gelap m-0">
            Selamat Datang Mentor
          </h1>

          <div className="flex items-center space-x-4">
            {/* Toggle Wali Kelas */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Wali Kelas
              </span>
              <button
                onClick={onToggleWaliKelas}
                className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                  isWaliKelas ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                    isWaliKelas ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
            {/* Kanan: Profile */}
            <div className="flex items-center">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                {initials}
              </button>
              {/* Modal */}
              <ModalProfile
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                user={storedUser}
                avatarColor={avatarColor}
                initials={initials}
              />
            </div>
          </div>
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

            <div className="w-full max-h-[60vh] overflow-y-auto py-4">
              {loading ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
                </div>
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
                        <div className="relative lg:w-[40%] md:w-[40%] bg-yellow-500 flex items-center justify-center">
                          <div className="bg-white rounded-full p-3 mx-1.5 relative">
                            <FaChalkboardTeacher className="text-yellow-500 text-sm" />
                            {/* Badge Notifikasi */}
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              5
                            </span>
                          </div>
                        </div>

                        {/* Right Text */}
                        <div className="lg:w-[80%] flex flex-col justify-center pl-2 pr-2">
                          <div className="text-xs sm:text-sm text-left font-bold text-[#1f1f1f] capitalize">
                            {kelas.nama_kelas}
                          </div>
                          <div className="text-[10px] text-left text-gray-600">
                            {kelas.nama_batch}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Image */}
        <img
          src={homepage_img}
          alt="welcome"
          className="lg:max-h-[50%] max-h-[35%] object-contain absolute bottom-0 left-0"
        />
      </div>
    </>
  );
};

export default HomeMentor;
