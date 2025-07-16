import dokter from "../../assets/dokter.png";
import garis from "../../assets/garis-kanan.png";
import garisyangbawah from "../../assets/garisyangbawah.png";

const Hero = () => {
  return (
    <section
      id="capaian"
      className="bg-custom-bg mt-5 pt-20 text-center w-auto h-auto poppins relative"
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
      <img
        src={dokter}
        alt="Dokter"
        className="flex justify-center absolute top-0 bottom-0 mt-[90px] left-1/2 transform -translate-x-1/2 w-[80%] sm:w-[400px] md:w-[450px] h-auto z-20"
      />
      <div className="absolute top-[190px] left-1/2 pl-[60px] sm:pl-[20px] md:pl-[60px] hidden sm:block">
        <div className="bg-gradient-to-b from-white via-blue-00 to-transparent mx-auto block mb-20 px-8 py-4 w-[16rem] sm:w-[12rem] md:w-[20rem] rounded-tr-[50px] text-black md:text-sm text-left font-semibold">
          Platform penyedia layanan pendidikan farmasi berbasis teknologi
          <strong className="font-extrabold text-biru-gelap">
            {" "}
            terbaik dan termurah
          </strong>
        </div>
      </div>

      <div className="bg-custom-biru py-2.5 px-5 rounded-full text-white text-sm font-semibold absolute top-[290px] left-1/2 ml-[195px] sm:ml-[150px] md:ml-[195px] hidden sm:block">
        <strong className="font-bold">5000+</strong> Siswa Terdaftar
      </div>

      <div className="bg-custom-biru py-2.5 px-4 rounded-full text-white text-sm font-semibold absolute top-[250px] left-1/2 lg:ml-[-270px] sm:ml-[-200px] md:ml-[-250px] hidden sm:block hidden">
        <strong className="font-bold">98%</strong> Presentase Kelulusan
      </div>

      <div className="flex justify-center items-center text-black pt-8 mt-[250px] sm:mt-[480px] md:mt-[350px] text-sm sm:text-4xl md:text-3xl font-extrabold sm:font-extrabold md:font-extrabold leading-[0.9] poppins sticky z-30">
        Bimbingan Berkualitas Untuk <br />
        Apoteker Masa Depan
      </div>
    </section>
  );
};

export default Hero;
