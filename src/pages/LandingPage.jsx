import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Mentor from "../components/Mentor";
import Modul from "../components/Modul";
import Features from "../components/Features";
import Footer from "../components/Footer";
import About from "../components/About";
import Download from "../components/Download";

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d]">
      <Navbar />
      <Hero />
      <Mentor />
      <Modul />
      <Features />
      <Download />
      <About />
      <Footer />
    </div>
  );
};

export default LandingPage;
