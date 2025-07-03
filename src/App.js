import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Features from "./components/Features";
import Modul from "./components/Modul";
import Mentor from "./components/Mentor";
import LandingPage from "./pages/LandingPage";

import Header from "./components/Header";
import Dashboard from "./pages/admin/Dashboard";
import UserPage from "./pages/admin/UserPage";
import SoalPage from "./pages/admin/SoalPage";
import MateriPage from "./pages/admin/MateriPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

import About from "./components/About";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/modul" element={<Modul />} />
        <Route path="/about" element={<About />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/soal" element={<SoalPage />} />
        <Route path="/materi" element={<MateriPage />} />
        {/* Tambahkan route lainnya sesuai kebutuhan */}
      </Routes>
    </Router>
  );
}

export default App;
