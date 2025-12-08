import dokter from "../assets/coba.png";
import indo_flag from "../assets/indo_flag.png";
import garis from "../assets/garis-kanan.png";
import garisyangbawah from "../assets/garisyangbawah.png";

const Hero = () => {
  return (
    <section
      id="capaian"
      className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d] mt-5 pt-20 text-center w-auto h-auto poppins relative"
    >
      <img
        src={garis}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto"
      />
      <img
        src={garis}
        className="absolute bottom-0 left-0 pt-[15rem] h-full w-auto scale-x-[-1]  transform z-0"
      />
      {/* Judul */}
      <div className="flex justify-center text-4xl sm:text-7xl md:text-6xl font-bold text-white mb-4 mask-text-gradient tracking-wide whitespace-nowrap">
        SYNDROME UKAI
      </div>

      {/* Gambar dengan posisi floating */}
      <div
        className="
  absolute 
  left-1/2 
  transform -translate-x-1/2
  top-[90px]

  w-[65vw]          /* HP kecil */
  max-w-[420px]     /* batas maksimal */
  sm:w-[50vw]       /* Tablet */
  md:w-[35vw]       /* Laptop */
  lg:w-[30vw]       /* Desktop */

  flex justify-center items-center
  z-20
"
      >
        <img
          src={dokter}
          alt="Dokter"
          className="w-full h-auto object-contain drop-shadow-xl"
        />
      </div>

      <div className="absolute top-[190px] left-1/2 pl-[60px] sm:pl-[20px] md:pl-[50px] hidden sm:block">
        <div className="bg-gradient-to-b from-red-600 via-red-00 to-transparent text-white mx-auto block mb-20 px-8 py-4 w-[16rem] sm:w-[12rem] md:w-[20rem] rounded-tr-[50px] text-black md:text-sm text-left font-semibold">
          Platform penyedia layanan pendidikan farmasi berbasis teknologi
          <strong className="font-extrabold text-white">
            {" "}
            terbaik dan termurah
          </strong>
        </div>
      </div>

      <div className="bg-yellow-500 py-2.5 px-5 rounded-full text-white text-sm font-semibold absolute top-[290px] left-1/2 ml-[195px] sm:ml-[150px] md:ml-[195px] hidden sm:block">
        <strong className="font-bold">5000+</strong> Siswa Terdaftar
      </div>

      <div className="bg-yellow-500 py-2.5 px-4 rounded-full text-white text-sm font-semibold absolute top-[250px] left-1/2 lg:ml-[-270px] sm:ml-[-200px] md:ml-[-250px] hidden sm:block hidden">
        <strong className="font-bold">98%</strong> Presentase Kelulusan
      </div>

      <div className="flex justify-center items-center text-white pt-8 mt-[250px] sm:mt-[480px] md:mt-[350px] text-sm sm:text-4xl md:text-3xl font-extrabold sm:font-extrabold md:font-extrabold leading-[0.9] poppins sticky z-30">
        Bimbingan Berkualitas Untuk <br />
        Apoteker Masa Depan
      </div>

      {/* Card Putih dengan sudut kiri bulat dan kanan terpotong miring */}
      <div
        className="flex justify-left -mb-1 left-0 sm:w-[20rem] w-[10rem] bg-white sm:h-[8rem] h-[4rem] mt-4"
        style={{
          clipPath: "polygon(0 0, 75% 0, 100% 100%, 100% 100%, 0 100%)",
          borderTopLeftRadius: "40px",
        }}
      ></div>

      <div className="absolute bottom-0 sm:pb-[250px] pb-[100px] left-0 sm:w-64 w-32 sm:h-40 h-32 mt z-20">
        <img
          src={indo_flag}
          alt="Bendera Indonesia"
          className="drop-shadow-xl w-full h-auto"
        />
      </div>
    </section>
  );
};

export default Hero;
