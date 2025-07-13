import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Import components
import Features from "./components/Features";
import Modul from "./components/Modul";
import Mentor from "./components/Mentor";
import LandingPage from "./pages/LandingPage";

// Import admin pages
import HomeAdmin from "./pages/admin/HomeAdmin.jsx";
import PesertaPage from "./pages/admin/PesertaPage.jsx";
import SoalPage from "./pages/admin/SoalPage";
import MateriPage from "./pages/admin/MateriPage";
import VideoPage from "./pages/admin/VideoPage";
import PaketPage from "./pages/admin/PaketPage.jsx";
import PendaftaranPage from "./pages/admin/PendaftaranPage.jsx";
import LaporanPage from "./pages/admin/LaporanPage.jsx";
import PesertaKelas from "./pages/admin/PesertaKelas.jsx";
import DaftarMentor from "./pages/admin/DaftarMentor.jsx";
import DaftarKelas from "./pages/admin/DaftarKelas.jsx";

// Import authentication pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import HomePageUser from "./pages/users/HomePage.jsx";

// Import components
import About from "./components/About";
import User from "./User"; // Import User component
import Pembayaran from "./pages/users/Pembayaran.jsx";
import DaftarBatch from "./pages/admin/DaftarBatch.jsx";
import MentorKelas from "./pages/admin/MentorKelas.jsx";
import UserBatch from "./pages/admin/UserBatch.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes for landing, login, and register pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/homepage" element={<HomePage />} />
        {/* Routes for admin dashboard */}
        <Route path="/home-admin" element={<HomeAdmin />} />
        <Route path="/peserta" element={<PesertaPage />} />
        <Route path="/peserta/peserta-kelas" element={<PesertaKelas />} />
        <Route path="/daftar-mentor" element={<DaftarMentor />} />
        <Route path="/daftar-kelas" element={<DaftarKelas />} />
        <Route path="/daftar-batch" element={<DaftarBatch />} />
        <Route path="/daftar-batch/peserta-batch" element={<UserBatch />} />
        <Route path="/daftar-mentor/mentor-kelas" element={<MentorKelas />} />
        <Route path="/soal" element={<SoalPage />} />
        <Route path="/materi" element={<MateriPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/paket" element={<PaketPage />} />
        <Route path="/pendaftaran" element={<PendaftaranPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        {/* Routes for features and modules */}
        <Route path="/features" element={<Features />} />
        <Route path="/modul" element={<Modul />} />
        <Route path="/mentor" element={<Mentor />} />
        {/* About page */}
        <Route path="/about" element={<About />} />
        {/* Routes for user */}
        <Route path="/home" element={<HomePageUser />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        {/* Route for User Dashboard */}
        <Route path="/dashboard/*" element={<User />} />{" "}
        {/* Add '/user-dashboard/*' as the route */}
      </Routes>
    </Router>
  );
}

export default App;
