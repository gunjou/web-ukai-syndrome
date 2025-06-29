import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Mentor from "../components/Mentor";
import Modul from "../components/Modul";
import Features from "../components/Features";
import Footer from "../components/Footer";
import About from "../components/About";

const LandingPage = () => {
  return (
    <div className="bg-custom-bg">
      <Navbar />
      <Hero />
      <Mentor />
      <Modul />
      <Features />
      <About />
      <Footer />
    </div>
  );
};

export default LandingPage;
