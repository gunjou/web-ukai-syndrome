// eslint-disable-next-line no-unused-vars
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAntiInspect from "./utils/useAntiInspect.js";

// Import components
// import Features from "./components/Features";
// import Modul from "./components/Modul";
// import Mentor from "./components/Mentor";
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
import TryoutPage from "./pages/admin/TryoutPage.jsx";
// import PesertaKelas from "./pages/admin/PesertaKelas.jsx";
import DaftarAkunPublik from "./pages/admin/DaftarAkunPublik.jsx";
import DaftarMentor from "./pages/admin/DaftarMentor.jsx";
import DaftarKelas from "./pages/admin/DaftarKelas.jsx";
import DaftarModul from "./pages/admin/DaftarModul.jsx";
import DaftarMateri from "./pages/admin/DaftarMateri.jsx";

// Import authentication pages
import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";

import HomePageUser from "./pages/users/HomePage.jsx";

// Import components
// import About from "./components/About";
import User from "./User"; // Import User component
import Pembayaran from "./pages/users/Pembayaran.jsx";
import DaftarBatch from "./pages/admin/DaftarBatch.jsx";
import MentorKelas from "./pages/admin/MentorKelas.jsx";
// import UserBatch from "./pages/admin/UserBatch.jsx";

// mentor

import MentorJs from "./Mentor.js";
import PrivacyPolicyEN from "./utils/PrivacyPolicyEN.jsx";
import PrivacyPolicyID from "./utils/PrivacyPolicyID.jsx";
import DataDeletionRequestEN from "./utils/DataDeletionRequestEN.jsx";
import DataDeletionRequestID from "./utils/DataDeletionRequestID.jsx";
import HomeMentor from "./pages/mentor/HomeMentor.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";

function App() {
  // aktifkan proteksi → ganti ke false kalau lagi ngedevelop
  useAntiInspect(true);

  return (
    <Router>
      <Routes>
        {/* Routes for ADMIN */}
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allow={["superadmin", "tryout"]}>
              <HomeAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/akun-publik"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <DaftarAkunPublik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peserta"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <PesertaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <DaftarMentor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <DaftarBatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kelas"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <DaftarKelas />
            </ProtectedRoute>
          }
        />
        <Route path="/mentor/mentor-kelas" element={<MentorKelas />} />
        <Route
          path="/modul"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <DaftarModul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <DaftarMateri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tryout"
          element={
            <ProtectedRoute allow={["superadmin", "tryout"]}>
              <TryoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute allow={["superadmin", "tryout"]}>
              <LaporanPage />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/batch/peserta-batch" element={<UserBatch />} /> */}
        {/* <Route path="/peserta/peserta-kelas" element={<PesertaKelas />} /> */}

        {/* Routes for landing, login, and register pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/register" element={<RegisterPage />} />  */}
        {/* Routes for admin dashboard */}
        <Route path="/soal" element={<SoalPage />} />
        <Route path="/materi" element={<MateriPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/paket" element={<PaketPage />} />
        <Route path="/pendaftaran" element={<PendaftaranPage />} />
        {/* Routes for user */}
        <Route path="/home" element={<HomePageUser />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        {/* Route for User Dashboard */}
        <Route path="/dashboard/*" element={<User />} />
        <Route path="/mentor-home" element={<HomeMentor />} />
        <Route path="/mentor-dashboard/*" element={<MentorJs />} />
        {/* Privacy Policy */}
        <Route path="/privacy-policy" element={<PrivacyPolicyEN />} />
        <Route path="/privacy-policy-id" element={<PrivacyPolicyID />} />
        {/* Data Deletion */}
        <Route
          path="/data-deletion-request-en"
          element={<DataDeletionRequestEN />}
        />
        <Route
          path="/data-deletion-request-id"
          element={<DataDeletionRequestID />}
        />
      </Routes>
      {/* Notifikasi Toast */}
      <ToastContainer position="top-center" autoClose={3000} />
    </Router>
  );
}

export default App;
