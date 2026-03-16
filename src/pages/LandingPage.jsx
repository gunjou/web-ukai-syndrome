import { lazy, Suspense } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const Mentor = lazy(() => import("../components/Mentor"));
const Modul = lazy(() => import("../components/Modul"));
const Features = lazy(() => import("../components/Features"));
const Download = lazy(() => import("../components/Download"));
const About = lazy(() => import("../components/About"));
const Footer = lazy(() => import("../components/Footer"));

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-r from-[#a11d1d] to-[#531d1d]">
      <Navbar />
      <Hero />
      <Suspense
        fallback={
          <div className="text-white text-center py-10">Loading...</div>
        }
      >
        <Mentor />
        <Modul />
        <Features />
        <Download />
        <About />
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;
