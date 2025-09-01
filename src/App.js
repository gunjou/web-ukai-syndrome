import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Import components
import Features from "./components/Features";
import Modul from "./components/Modul";
import Mentor from "./components/Mentor";
import LandingPage from "./pages/LandingPage";

// Import admin pages
import HomeAdmin from "./pages/admin/HomeAdmin";
import PesertaPage from "./pages/admin/DaftarPeserta.jsx";
import SoalPage from "./pages/admin/SoalPage";
import MateriPage from "./pages/admin/MateriPage";
import VideoPage from "./pages/admin/VideoPage";
import PaketPage from "./pages/admin/PaketPage.jsx";
import PendaftaranPage from "./pages/admin/PendaftaranPage.jsx";
import LaporanPage from "./pages/admin/LaporanPage.jsx";
import PesertaKelas from "./pages/admin/PesertaKelas.jsx";
import DaftarMentor from "./pages/admin/DaftarMentor.jsx";
import DaftarKelas from "./pages/admin/DaftarKelas.jsx";
import DaftarModul from "./pages/admin/DaftarModul.jsx";
import DaftarMateri from "./pages/admin/DaftarMateri.jsx";

// Import authentication pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import HomePageUser from "./pages/users/HomePage.jsx";

// Import components
import About from "./components/About";
import User from "./User"; // Import User component
import Pembayaran from "./pages/users/Pembayaran.jsx";
import DaftarBatch from "./pages/admin/DaftarBatch.jsx";
import MentorKelas from "./pages/admin/MentorKelas.jsx";
import UserBatch from "./pages/admin/UserBatch.jsx";

// mentor
import MentorJs from "./Mentor.js";

function App() {
  useEffect(() => {
    // Disable klik kanan
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // Disable shortcut tertentu
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" || // Inspect
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        (e.ctrlKey && (e.key === "S" || e.key === "s")) ||
        (e.ctrlKey && (e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "X" || e.key === "x"))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Routes for landing, login, and register pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Routes for admin dashboard */}
        <Route path="/admin-home" element={<HomeAdmin />} />
        <Route path="/peserta" element={<PesertaPage />} />
        <Route path="/peserta/peserta-kelas" element={<PesertaKelas />} />
        <Route path="/mentor" element={<DaftarMentor />} />
        <Route path="/kelas" element={<DaftarKelas />} />
        <Route path="/batch" element={<DaftarBatch />} />
        <Route path="/batch/peserta-batch" element={<UserBatch />} />
        <Route path="/mentor/mentor-kelas" element={<MentorKelas />} />
        <Route path="/modul" element={<DaftarModul />} />
        <Route path="/materi" element={<DaftarMateri />} />
        <Route path="/soal" element={<SoalPage />} />
        <Route path="/materi" element={<MateriPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/paket" element={<PaketPage />} />
        <Route path="/pendaftaran" element={<PendaftaranPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        {/* Routes for user */}
        <Route path="/home" element={<HomePageUser />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        {/* Route for User Dashboard */}
        <Route path="/dashboard/*" element={<User />} />
        <Route path="/mentor-dashboard/*" element={<MentorJs />} />
      </Routes>
    </Router>
  );
}

export default App;
