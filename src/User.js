import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Api from "./utils/Api";
import Sidebar from "./components/users/Sidebar";
import MenuBar from "./components/users/Menubar";
import Video from "./pages/users/Video";
import Materi from "./pages/users/Materi";
import TryOut from "./pages/users/TryOut";
import HasilTO from "./pages/users/HasilTO";
import Modul from "./pages/users/Modul";

const User = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Proteksi aktif
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
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

  useEffect(() => {
    const checkBatchStatus = async () => {
      try {
        const res = await Api.get("/peserta-kelas/status-batch-peserta");
        // Jika tidak aktif (0) atau tidak punya batch (null), lempar ke home
        if (res.data.is_batch_active !== 1) {
          navigate("/home", { replace: true });
        }
      } catch (err) {
        navigate("/login");
      } finally {
        setChecking(false);
      }
    };

    checkBatchStatus();

    // Proteksi Inspect Element
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    // ... rest of your protection code
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <MenuBar onToggleSidebar={setSidebarOpen} />
      <div className="flex pt-[65px]">
        <Sidebar
          isOpenExternal={sidebarOpen}
          onCloseExternal={setSidebarOpen}
        />
        <main className="flex-1 p-4 md:ml-64 transition-all duration-300">
          <Routes>
            <Route path="/tryout/*" element={<TryOut />} />
            <Route path="/hasil-to" element={<HasilTO />} />
            <Route path="/video/*" element={<Video />} />
            <Route path="/materi/*" element={<Materi />} />
            <Route path="/modul/*" element={<Modul />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default User;
