import dokter from "../assets/dokter.png";
import indo_flag from "../assets/indo_flag.png";
import garis from "../assets/garis.png";

const Hero = () => {
  return (
    <section
      id="capaian"
      className="bg-custom-bg mt-5 pt-20 text-center w-auto h-screen poppins relative"
    >
      {/* Judul */}
      <div className="flex justify-center text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 mask-text-gradient tracking-wide whitespace-nowrap">
        SYNDROME UKAI
      </div>

      {/* Gambar dengan posisi floating */}
      <img
        src={dokter}
        alt="Dokter"
        className="absolute top-0 mt-[90px] left-1/2 transform -translate-x-1/2 w-[400px] h-auto z-20"
        style={{
          maxWidth: "80%",
          height: "auto",
        }}
      />
      <div className="absolute top-[190px] left-1/2 pl-[60px]">
        <div className="bg-gradient-to-b from-white via-blue-00 to-transparent mx-auto block mb-20 px-8 py-4 w-[20rem] rounded-tr-[50px] text-black text-sm text-justify font-semibold">
          Platform penyedia layanan pendidikan farmasi berbasis teknologi
          <strong className="font-extrabold text-biru-gelap">
            {" "}
            tebaik dan termurah
          </strong>
        </div>
      </div>
      <div className="bg-custom-biru py-2.5 px-5 rounded-full text-white text-sm font-semibold absolute top-[290px] left-1/2 ml-[195px]">
        <strong className="font-bold">5000+</strong> Siswa Terdaftar
      </div>
      <div className="bg-custom-biru py-2.5 px-5 rounded-full text-white text-sm font-semibold absolute top-[250px] left-1/2 ml-[-250px]">
        <strong className="font-bold">5000+</strong> Siswa Terdaftar
      </div>
      <div className="text-black text-left pb-8 absolute top-0 mt-[330px] ml-[500px] text-3xl font-extrabold leading-[0.9] poppins sticky z-30 ">
        Bimbingan Berkualitas Untuk <br />
        Apoteker Masa Depan
      </div>

      {/* Card Putih dengan sudut kiri bulat dan kanan terpotong miring */}
      <div
        className="absolute -bottom-1 left-0 w-[20rem] bg-white h-[8rem]"
        style={{
          clipPath: "polygon(0 0, 75% 0, 100% 100%, 100% 100%, 0 100%)",
          borderTopLeftRadius: "40px",
        }}
      ></div>
      <div className="absolute bottom-0 pb-[250px] left-0 w-64 h-40 mt z-20">
        <img
          src={indo_flag}
          alt="Bendera Indonesia"
          className="drop-shadow-xl"
        />
      </div>
    </section>
  );
};

export default Hero;
