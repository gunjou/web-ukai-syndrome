// src/components/mentor/PrivateSidebar.jsx

import { useEffect, useState } from "react";

import homepage_img from "../../assets/logo-1.svg";

import Api from "../../utils/Api";

import { Search, BookOpen, ChevronRight, X } from "lucide-react";

/* =========================
   SIDEBAR CONTENT
========================= */
function SidebarContent({
  desktop,
  onClose,
  search,
  setSearch,
  loading,
  filteredClass,
  selectedClass,
  onSelectClass,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* LOGO */}
      <div className="h-[65px] border-b dark:border-gray-800 flex items-center justify-between px-5 shrink-0">
        <a href="/mentor-home">
          <img src={homepage_img} alt="Logo" className="h-12 object-contain" />
        </a>

        {/* MOBILE CLOSE */}
        {!desktop && (
          <button
            onClick={onClose}
            className="
              md:hidden
              p-2
              rounded-lg
              hover:bg-gray-100
              dark:hover:bg-gray-800
              transition
            "
          >
            <X size={20} className="text-gray-700 dark:text-gray-200" />
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="px-4 pb-4 mt-4 shrink-0">
        <div className="relative">
          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Cari peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              bg-gray-100
              dark:bg-gray-800
              border
              border-transparent
              focus:border-yellow-500
              focus:ring-0
              rounded-xl
              py-2.5
              pl-9
              pr-3
              text-sm
              text-gray-700
              dark:text-white
              placeholder:text-gray-400
              outline-none
              transition
            "
          />
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {loading ? (
          <div className="text-sm text-gray-500 px-2">Memuat kelas...</div>
        ) : filteredClass.length === 0 ? (
          <div className="text-sm text-gray-500 px-2">Tidak ada mentorship</div>
        ) : (
          <div className="space-y-2">
            {filteredClass.map((kelas) => {
              const isActive =
                selectedClass?.id_mentorship === kelas.id_mentorship;

              return (
                <button
                  key={kelas.id_mentorship}
                  onClick={() => {
                    onSelectClass(kelas);

                    if (window.innerWidth < 768) {
                      onClose?.();
                    }
                  }}
                  className={`
                    w-full
                    text-left
                    rounded-2xl
                    px-3
                    py-3
                    transition-all
                    border
                    group
                    ${
                      isActive
                        ? `
                          bg-gradient-to-r
                          from-[#a11d1d]
                          to-[#531d1d]
                          text-white
                          border-transparent
                          shadow-lg
                        `
                        : `
                          bg-white
                          dark:bg-gray-900
                          border-gray-100
                          dark:border-gray-800
                          hover:bg-gray-50
                          dark:hover:bg-gray-800
                        `
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* ICON */}
                    <div
                      className={`
                        min-w-[42px]
                        h-[42px]
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${
                          isActive
                            ? "bg-white/20"
                            : "bg-yellow-100 dark:bg-yellow-500/10"
                        }
                      `}
                    >
                      <BookOpen
                        size={18}
                        className={isActive ? "text-white" : "text-yellow-600"}
                      />
                    </div>

                    {/* TEXT */}
                    <div className="flex-1 min-w-0">
                      <h2
                        className={`
                          text-sm
                          font-semibold
                          leading-snug
                          line-clamp-2
                          ${
                            isActive
                              ? "text-white"
                              : "text-gray-800 dark:text-white"
                          }
                        `}
                      >
                        {kelas.nama_mentorship}
                      </h2>

                      <p
                        className={`
                          text-xs
                          mt-1
                          truncate
                          ${isActive ? "text-white/80" : "text-gray-500"}
                        `}
                      >
                        {kelas.nama_peserta}
                      </p>
                    </div>

                    {/* ARROW */}
                    <ChevronRight
                      size={16}
                      className={isActive ? "text-white" : "text-gray-400"}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
const PrivateSidebar = ({
  open,
  onClose,
  selectedClass,
  onSelectClass,
  desktop = false,
}) => {
  const [kelasList, setKelasList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH PRIVATE CLASS
  ========================= */
  useEffect(() => {
    const fetchPrivateClass = async () => {
      try {
        setLoading(true);

        const response = await Api.get("/kelas-private/mentor");

        setKelasList(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil kelas private:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateClass();
  }, []);

  /* =========================
     FILTER SEARCH
  ========================= */
  const filteredClass = kelasList.filter((item) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      item.nama_mentorship?.toLowerCase().includes(keyword) ||
      item.nama_peserta?.toLowerCase().includes(keyword)
    );
  });

  /* =========================
     DESKTOP MODE
  ========================= */
  if (desktop) {
    return (
      <aside
        className="
          w-[320px]
          h-screen
          bg-white
          dark:bg-[#0f172a]
          border-r
          dark:border-gray-800
          flex
          flex-col
        "
      >
        <SidebarContent
          desktop={desktop}
          onClose={onClose}
          search={search}
          setSearch={setSearch}
          loading={loading}
          filteredClass={filteredClass}
          selectedClass={selectedClass}
          onSelectClass={onSelectClass}
        />
      </aside>
    );
  }

  /* =========================
     MOBILE MODE
  ========================= */
  return (
    <>
      {/* OVERLAY */}
      {open && (
        <div
          onClick={onClose}
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            z-40
            md:hidden
          "
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          top-0
          left-0
          h-full
          w-[320px]
          bg-white
          dark:bg-[#0f172a]
          border-r
          dark:border-gray-800
          z-50
          transition-transform
          duration-300
          md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent
          desktop={desktop}
          onClose={onClose}
          search={search}
          setSearch={setSearch}
          loading={loading}
          filteredClass={filteredClass}
          selectedClass={selectedClass}
          onSelectClass={onSelectClass}
        />
      </aside>
    </>
  );
};

export default PrivateSidebar;
