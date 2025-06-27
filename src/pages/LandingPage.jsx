import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Mentor from "../components/Mentor";
import Modul from "../components/Modul";
import Features from "../components/Features";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="bg-custom-bg">
      <Navbar />
      <Hero />
      <Mentor />
      <Modul />
      <Features />
      <Footer />
    </div>
  );
};

export default LandingPage;
