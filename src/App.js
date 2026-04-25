import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";

import useAntiInspect from "./utils/useAntiInspect";
import ProtectedRoute from "./utils/ProtectedRoute";
import RedirectByRole from "./utils/RedirectByRole";

// LAZY LOAD (IMPORTANT)
const LoginPage = lazy(() => import("./pages/LoginPage"));

// ADMIN
const HomeAdmin = lazy(() => import("./pages/admin/HomeAdmin"));
const DaftarAkunPublik = lazy(() => import("./pages/admin/DaftarAkunPublik"));
const PesertaPage = lazy(() => import("./pages/admin/DaftarPeserta"));
const DaftarMentor = lazy(() => import("./pages/admin/DaftarMentor"));
const DaftarBatch = lazy(() => import("./pages/admin/DaftarBatch"));
const DaftarKelas = lazy(() => import("./pages/admin/DaftarKelas"));
const DaftarPrivate = lazy(() => import("./pages/admin/DaftarPrivate"));
const DaftarModul = lazy(() => import("./pages/admin/DaftarModul"));
const DaftarMateri = lazy(() => import("./pages/admin/DaftarMateri"));
const TryoutPage = lazy(() => import("./pages/admin/TryoutPage"));
const LaporanPage = lazy(() => import("./pages/admin/LaporanPage"));

// USER
const User = lazy(() => import("./User"));
const HomePageUser = lazy(() => import("./pages/users/HomePage"));
const Pembayaran = lazy(() => import("./pages/users/Pembayaran"));
const MateriPrivateListContent = lazy(
  () => import("./pages/users/MateriPrivateListContent"),
);

// MENTOR
const HomeMentor = lazy(() => import("./pages/mentor/HomeMentor"));
const MentorJs = lazy(() => import("./Mentor"));

function App() {
  useAntiInspect(true);

  return (
    <Router>
      <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
        <Routes>
          {/* ROOT REDIRECT */}
          <Route path="/" element={<RedirectByRole />} />

          {/* AUTH */}
          <Route path="/login" element={<LoginPage />} />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin-home"
            element={
              <ProtectedRoute allow={["superadmin"]}>
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

          <Route
            path="/private"
            element={
              <ProtectedRoute allow={["superadmin"]}>
                <DaftarPrivate />
              </ProtectedRoute>
            }
          />

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

          {/* ================= USER ================= */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allow={["peserta"]}>
                <User />
              </ProtectedRoute>
            }
          />

          <Route path="/home" element={<HomePageUser />} />
          <Route path="/pembayaran" element={<Pembayaran />} />

          <Route
            path="/materi-private"
            element={<MateriPrivateListContent tipe="document" />}
          />

          <Route
            path="/video-private"
            element={<MateriPrivateListContent tipe="video" />}
          />

          {/* ================= MENTOR ================= */}
          <Route
            path="/mentor-home"
            element={
              <ProtectedRoute allow={["mentor"]}>
                <HomeMentor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-dashboard/*"
            element={
              <ProtectedRoute allow={["mentor"]}>
                <MentorJs />
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<RedirectByRole />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-center" autoClose={3000} />
    </Router>
  );
}

export default App;
