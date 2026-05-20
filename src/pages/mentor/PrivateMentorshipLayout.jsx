// src/layouts/PrivateMentorshipLayout.jsx

import { useState } from "react";
import { Outlet } from "react-router-dom";

import PrivateMenubar from "../../components/mentor/PrivateMenubar";
import PrivateSidebar from "../../components/mentor/PrivateSidebar";

const PrivateMentorshipLayout = () => {
  /* =========================
     MOBILE SIDEBAR
  ========================= */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================
     SELECTED CLASS
  ========================= */
  const [selectedClass, setSelectedClass] = useState(() => {
    const stored = localStorage.getItem("selectedPrivateClass");

    return stored ? JSON.parse(stored) : null;
  });

  /* =========================
     HANDLE SELECT CLASS
  ========================= */
  const handleSelectClass = (kelas) => {
    setSelectedClass(kelas);

    localStorage.setItem("selectedPrivateClass", JSON.stringify(kelas));

    // auto close sidebar mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-[#020817]">
      {/* =========================
          DESKTOP SIDEBAR
      ========================= */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-0 z-40">
          <PrivateSidebar
            desktop={true}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
          />
        </div>
      </div>

      {/* =========================
          MOBILE SIDEBAR
      ========================= */}
      {sidebarOpen && (
        <PrivateSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedClass={selectedClass}
          onSelectClass={handleSelectClass}
        />
      )}

      {/* =========================
          RIGHT SIDE
      ========================= */}
      <div className="md:ml-[320px] flex flex-col h-screen">
        {/* =========================
            NAVBAR
        ========================= */}
        <div className="shrink-0 h-[65px] border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <PrivateMenubar onToggleSidebar={() => setSidebarOpen(true)} />
        </div>

        {/* =========================
            CONTENT
        ========================= */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 sm:p-5">
            <div
              className="
                h-full
                rounded-3xl
                bg-white
                dark:bg-slate-900
                border
                border-gray-100
                dark:border-slate-800
                shadow-sm
                overflow-hidden
              "
            >
              <Outlet
                context={{
                  selectedClass,
                  setSelectedClass: handleSelectClass,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivateMentorshipLayout;
