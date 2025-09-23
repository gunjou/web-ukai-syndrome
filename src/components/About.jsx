import {
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdOutlineAttachEmail } from "react-icons/md";
import logo from "../assets/logo.png";

const About = () => {
  return (
    <section id="about" className="py-16 border-t border-white text-white ">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Kolom Kiri */}
        <div>
          <p className="font-bold text-lg">Syndrome Ukai</p>
          <p className="text-sm mt-4 text-justify text-white">
            Temukan revolusi dalam pendidikan farmasi dengan platform teknologi
            terdepan, kami menawarkan pengalaman belajar yang mudah, didukung
            oleh mentor-mentor terbaik dan kurikulum terbaru. Bergabunglah
            dengan kami untuk meraih keunggulan dan sukses di industri farmasi
            dengan cara yang lebih mudah dan efisien.
          </p>
          <div className="flex gap-6 mt-6 text-xl">
            <a
              href="https://www.instagram.com/syndrome_ukai/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram style={{ color: "#E1306C" }} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube style={{ color: "#FF0000" }} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter style={{ color: "#1DA1F2" }} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook style={{ color: "#1877F2" }} />
            </a>
          </div>
        </div>

        {/* Kolom Tengah */}
        {/* Kolom Tengah */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Layanan</h2>
          <a
            href="#capaian"
            className="text-sm text-white mb-2 block cursor-pointer"
          >
            Capaian
          </a>
          <a
            href="#mentor"
            className="text-sm text-white mb-2 block cursor-pointer"
          >
            Mentor
          </a>
          <a
            href="#modul"
            className="text-sm text-white mb-2 block cursor-pointer"
          >
            Modul
          </a>
          <a
            href="#download"
            className="text-sm text-white mb-2 block cursor-pointer"
          >
            Download
          </a>
        </div>

        {/* Kolom Kanan */}
        <div className="flex justify-end">
          <div className="text-sm text-white">
            <p className="mb-2 font-semibold">Hubungi Kami</p>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-white" />
              <p className="text-sm">admin@ukaisyndrome.id</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaPhoneAlt className="text-white" />
              <p className="text-sm">+628213007505</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
