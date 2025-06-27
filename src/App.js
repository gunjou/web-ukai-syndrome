import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import Features from "./components/Features";
import Modul from "./components/Modul";
import Mentor from "./components/Mentor";

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
        <Route path="/Modul" element={<Modul />} />
      </Routes>
    </Router>
  );
}

export default App;
