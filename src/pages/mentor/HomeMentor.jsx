// src/pages/mentor/HomeMentor.jsx

import React, { useEffect, useState } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Api, { CDN_ASSET_URL } from "../../utils/Api";
import ModalProfile from "../../components/mentor/modal/ModalProfile";
import LoadingOverlay from "../../utils/LoadingOverlay";
import { FiChevronDown, FiSearch } from "react-icons/fi";

const HomeMentor = () => {
  const [kelasList, setKelasList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("semua");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.nama || "User";

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const saturation = 40 + (hash % 30);
    const lightness = 45 + (hash % 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const avatarColor = stringToColor(userName);

  // ambil kelas mentor
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        setLoading(true);

        let endpoint = "/paket-kelas/mentor";

        if (activeTab === "wali") {
          endpoint = "/paket-kelas/wali-kelas";
        } else if (activeTab === "private") {
          endpoint = "/kelas-private/mentor";
        }

        const response = await Api.get(endpoint);

        setKelasList(response.data.data || []);

        console.log("Data kelas:", response.data.data);
      } catch (error) {
        console.error("Gagal mengambil kelas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, [activeTab]);

  /* =========================
    UNIQUE BATCH
  ========================= */
  const batchOptions = [
    "all",
    ...new Set(kelasList.map((item) => item.nama_batch).filter(Boolean)),
  ];

  /* =========================
    FILTER SEARCH
    ========================= */
  const filteredKelas = kelasList.filter((kelas) => {
    const keyword = search.trim().toLowerCase();

    const namaKelas =
      activeTab === "private" ? kelas.nama_mentorship : kelas.nama_kelas;

    const subText =
      activeTab === "private" ? kelas.nama_peserta : kelas.nama_batch;

    /* SEARCH MATCH */
    const matchesSearch =
      !keyword ||
      namaKelas?.toLowerCase().includes(keyword) ||
      subText?.toLowerCase().includes(keyword);

    /* BATCH MATCH */
    const matchesBatch =
      selectedBatch === "all" || kelas.nama_batch === selectedBatch;

    return matchesSearch && matchesBatch;
  });

  const handleKelasClick = (kelas) => {
    const isPrivate = activeTab === "private";

    const kelasId = isPrivate ? kelas.id_mentorship : kelas.id_paketkelas;

    const namaKelas = isPrivate ? kelas.nama_mentorship : kelas.nama_kelas;

    localStorage.setItem("kelas", kelasId);

    localStorage.setItem("namaKelas", JSON.stringify({ namaKelas }));

    // PRIVATE CLASS
    if (isPrivate) {
      localStorage.setItem("selectedPrivateClass", JSON.stringify(kelas));

      navigate("/mentor-dashboard/private");
      return;
    }

    // REGULAR CLASS
    navigate("/mentor-dashboard/materi");
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Yakin ingin logout?");

    if (!confirmed) return;

    try {
      await Api.post("/auth/logout");
    } catch (error) {
      console.error("Gagal logout dari server:", error);
    } finally {
      localStorage.clear();

      navigate("/login");
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      <div className="min-h-screen w-auto bg-gradient-to-r from-[#a11d1d] to-[#531d1d] flex flex-col items-center relative">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 shadow-lg bg-white rounded-b-[40px] relative">
          {/* Kiri: Logo */}
          <div className="flex items-center space-x-2">
            <img
              src={`${CDN_ASSET_URL}/logo_syndrome_kuning.png`}
              alt="logo"
              className="h-10"
            />
          </div>

          {/* Tengah: Judul */}
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-biru-gelap m-0">
            Selamat Datang Mentor
          </h1>

          <div className="flex items-center space-x-4">
            {/* Tabs */}
            <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
              <button
                onClick={() => {
                  setActiveTab("semua");
                  setSearch("");
                  setSelectedBatch("all");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "semua"
                    ? "bg-yellow-500 text-white shadow"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Semua
              </button>

              <button
                onClick={() => {
                  setActiveTab("wali");
                  setSearch("");
                  setSelectedBatch("all");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "wali"
                    ? "bg-green-500 text-white shadow"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Wali Kelas
              </button>

              <button
                onClick={() => {
                  setActiveTab("private");
                  setSearch("");
                  setSelectedBatch("all");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "private"
                    ? "bg-blue-500 text-white shadow"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Private
              </button>
            </div>
            {/* Kanan: Profile */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                {initials}
              </button>
              {/* Modal */}
              <ModalProfile
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                user={storedUser}
                avatarColor={avatarColor}
                initials={initials}
              />
              <button
                onClick={handleLogout}
                className="py-1 px-4 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center rounded-full"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl px-4 mt-12 relative min-h-auto flex flex-col lg:flex-row">
          {/* Right Menu */}
          <div className="w-full lg:w-3/4 ml-auto text-center lg:text-right">
            <div className="text-3xl lg:text-6xl mt-1 font-bold lg:mt-6 text-white mb-2">
              Kelas Anda
            </div>
            <div className="text-lg text-white font-normal mb-2 sm:mb-8 min-w-md leading-[20px]">
              Pilih kelas yang Anda ampu untuk masuk ke materi
            </div>

            {/* SEARCH & FILTER */}
            <div className="w-full flex flex-col sm:flex-row gap-3 justify-end mb-5">
              {/* FILTER BATCH */}
              {activeTab !== "private" && (
                <div className="relative min-w-[180px]">
                  {/* ICON */}
                  <FiChevronDown
                    className="
      absolute
      right-4
      top-1/2
      -translate-y-1/2
        text-gray-500
        z-10
        pointer-events-none
    "
                    size={18}
                  />

                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="
      appearance-none
      w-full
      rounded-2xl
      bg-white/95
      backdrop-blur-sm
      border
      border-white/20
      px-4
      pr-10
      py-3
      text-sm
      text-gray-800
      outline-none
      focus:ring-2
      focus:ring-yellow-400
      shadow-lg
      cursor-pointer
    "
                  >
                    <option value="all">Semua Batch</option>

                    {batchOptions
                      .filter((batch) => batch !== "all")
                      .map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* SEARCH */}
              <div className="relative w-full max-w-md">
                <FiSearch
                  className="
        absolute
        left-3
        top-1/2
        -translate-y-1/2
        text-gray-500
        z-10
        pointer-events-none
      "
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Cari nama kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
        w-full
        rounded-2xl
        bg-white/95
        backdrop-blur-sm
        border
        border-white/20
        pl-10
        pr-4
        py-3
        text-sm
        text-gray-800
        placeholder:text-gray-400
        outline-none
        focus:ring-2
        focus:ring-yellow-400
        shadow-lg
      "
                />
              </div>
            </div>

            <div className="w-full max-h-[60vh] overflow-y-auto py-4">
              {loading ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
                </div>
              ) : filteredKelas.length === 0 ? (
                <div className="text-white">Anda belum memiliki kelas.</div>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  {filteredKelas.map((kelas, idx) => {
                    const namaKelas =
                      activeTab === "private"
                        ? kelas.nama_mentorship
                        : kelas.nama_kelas;

                    const subText =
                      activeTab === "private"
                        ? kelas.nama_peserta
                        : kelas.nama_batch;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleKelasClick(kelas)}
                        className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div
                            className={`min-w-[38px] h-[38px] rounded-lg flex items-center justify-center text-white text-sm ${
                              activeTab === "private"
                                ? "bg-blue-500"
                                : activeTab === "wali"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                            }`}
                          >
                            <FaChalkboardTeacher />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0 text-left">
                            <h2 className="text-sm font-semibold text-gray-800 truncate">
                              {namaKelas}
                            </h2>

                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-gray-500 truncate">
                                {subText}
                              </p>

                              {activeTab === "private" && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                                  Private
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="text-gray-400 text-sm">→</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMentor;
