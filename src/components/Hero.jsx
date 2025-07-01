import dokter from "../assets/dokter.png";
import indo_flag from "../assets/indo_flag.png";
import garisyangbawah from "../assets/garisyangbawah.png";
import garis from "../assets/garis.png";

const Hero = () => {
  return (
    <section
      id="capaian"
      className="bg-custom-bg mt-5 pt-20 text-center w-full h-[100dvh] poppins"
    >
      <div className="hidden md:block">
        <div className="flex justify-center text-5xl  font-bold text-white mb-4 mask-text-gradient tracking-wide whitespace-nowrap">
          SYNDROME UKAI
        </div>
        <img
          src={dokter}
          alt="Description of image"
          className="flex justify-center mx-auto block -my-[5rem] w-[29rem] sticky z-20"
        />

        <>
          <img
            src={garisyangbawah}
            alt="Description of image"
            className="flex absolute top-[4rem] -left-[34rem] rotate-45 z-0"
          />
        </>
        <div className="bg-custom-biru mx-auto block -mt-[21rem] ml-[24rem] w-[12rem] py-2.5 rounded-full text-white text-sm font-semibold">
          <strong className="font-bold">98%</strong> Persentase Kelulusan
        </div>
        <div className="pt-[7rem]">
          <div className="bg-gradient-to-b from-white via-blue-00 to-transparent mx-auto block -mt-[14rem] mr-[17rem] mb-20 px-8 w-[20rem] pb-[5rem] pl-[4rem] pt-[2rem] rounded-tr-[50px] text-black text-sm text-justify font-semibold">
            Platform penyedia layanan pendidikan farmasi berbasis teknologi
            <strong className="font-extrabold text-biru-gelap">
              {" "}
              tebaik dan termurah
            </strong>
          </div>

          <div className="bg-custom-biru mx-auto block -mt-[9rem] mr-[16rem] mb-20 w-[11rem] py-2.5 rounded-full text-white text-sm font-semibold sticky z-30">
            <strong className="font-bold">5000+</strong> Siswa Terdaftar
          </div>
        </div>

        <div className="relative w-64 h-40">
          {/* Card Putih dengan sudut kiri bulat dan kanan terpotong miring */}
          <div
            className="absolute bottom-0 left-0 w-[20rem] bg-white h-[12rem] z-10"
            style={{
              clipPath: "polygon(0 0, 75% 0, 100% 100%, 100% 100%, 0 100%)",
              borderTopLeftRadius: "40px",
            }}
          ></div>

          {/* Bendera */}
          <img
            src={indo_flag}
            alt="Bendera Indonesia"
            className="absolute -top-[9rem] left-1.5 -64 z-10 drop-shadow-xl"
          />
        </div>
        <div className="text-black text-left mx-auto block -mt-[10rem] pl-[38rem] pb-8 text-3xl font-extrabold sticky z-30 leading-[0.9] poppins">
          Bimbingan Berkualitas Untuk <br />
          Apoteker Masa Depan
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden mt-2 w-full min-h-[100dvh] ">
        <div className="text-6xl md:text-6xl text-white font-bold mask-text-gradient tracking-wide">
          SYNDROME UKAI
        </div>
        <img
          src={garisyangbawah}
          alt="Background garis"
          className="absolute top-[40rem] -left-[12rem] w-[300px] opacity-60 z-0 rotate-45"
        />
        <img
          src={dokter}
          alt="coba"
          className="mx-auto block -mt-[4rem] w-[45rem] sticky z-20"
        />
        <div className="bg-custom-biru mx-auto block -mt-[20rem] ml-[3rem] w-[7rem] py-1.5 rounded-full text-white text-[8px]">
          <strong className="font-bold">98%</strong> Persentase Kelulusan
        </div>
        <div className="pt-[7rem]">
          <div className="bg-custom-biru text-center mx-auto block -mt-[7rem] ml-[18rem] w-[7rem] py-1.5 rounded-full text-white text-[8px] font-semibold sticky z-30">
            <strong className="font-bold">5000+</strong> Siswa Terdaftar
          </div>
          <div className="text-black text-center mx-auto block mt-[15rem] text-xl font-extrabold sticky z-30 leading-[0.9] poppins">
            Bimbingan Berkualitas Untuk <br />
            Apoteker Masa Depan
          </div>
          <div className="absolute bottom-0 left-0 w-full h-40">
            {/* Card Putih dengan sudut kiri bulat dan kanan terpotong miring */}
            <div
              className="mt-[5rem] w-[15rem] bg-white h-[12rem] z-10"
              style={{
                clipPath: "polygon(0 0, 75% 0, 100% 100%, 100% 100%, 0 100%)",
                borderTopLeftRadius: "40px",
              }}
            ></div>
            {/* Bendera */}
            <img
              src={indo_flag}
              alt="Bendera Indonesia"
              className="absolute -top-[1rem] w-[12rem] left-1.5 -64 z-10 drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
