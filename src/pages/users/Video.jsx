import React from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import icon_folder from "../../assets/icon_folder.svg";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Obat from "./menu-video/Obat";
import CPOB from "./menu-video/CPOB";

const menuItems = [
  "Senku",
  "CPOB",
  "Ilmu Resep",
  "Obat",
  "Suntik",
  "Infeksi",
  "Covid-19",
  "Demam",
];

// Komponen untuk daftar folder
const VideoList = ({ onFolderClick }) => (
  <div className="flex flex-wrap gap-6 p-4">
    {menuItems.map((item) => (
      <div
        key={item}
        className="relative bg-white w-[180px] h-[140px] shadow border border-gray-200 rounded-lg cursor-pointer flex flex-col items-center pt-10"
        onClick={() => onFolderClick(item)}
      >
        <img
          src={icon_folder}
          alt="Folder Icon"
          className="w-auto h-[6rem] absolute -top-5 left-1/2 transform -translate-x-1/2"
        />
        <div className="mt-2 text-center px-2 flex-1 flex items-center justify-center">
          <span className="text-gray-700 font-medium text-base">{item}</span>
        </div>
      </div>
    ))}
  </div>
);

// Komponen untuk isi folder
const FolderContent = () => {
  const { folder } = useParams();
  if (folder === "obat") return <Obat />;
  if (folder === "cpob") return <CPOB />;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {folder.replace(/-/g, " ")}
      </h2>
      <p>
        Ini adalah konten untuk folder <b>{folder.replace(/-/g, " ")}</b>.
      </p>
    </div>
  );
};

const Video = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { folder } = useParams();

  const basePath = "/dashboard/video";

  const pathSegments = location.pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);

  const handleFolderClick = (folderName) => {
    const slug = folderName.toLowerCase().replace(/\s+/g, "-");
    navigate(`${basePath}/${slug}`);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      navigate(basePath);
    } else {
      const to = `${basePath}/${pathSegments.slice(0, index + 1).join("/")}`;
      navigate(to);
    }
  };

  return (
    <div className="bg-white w-full h-auto p-4">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Video Explorer</h1>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] bg-blue-500 text-white hover:bg-blue-600`}
            >
              <HiArrowLeft className="text-lg" />
              Back
            </button>
            <button
              onClick={() => navigate(1)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] bg-blue-500 text-white hover:bg-blue-600`}
            >
              Forward
              <HiArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Breadcrumb Path */}
        <div className="text-sm text-gray-700 mb-6 flex items-center flex-wrap">
          <span className="font-semibold mr-2">Path:</span>
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-blue-600 hover:underline mr-1"
          >
            Video
          </button>
          {pathSegments.map((seg, index) => (
            <span key={index} className="flex items-center">
              <span className="mx-1">/</span>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-blue-600 hover:underline"
              >
                {seg.replace(/-/g, " ")}
              </button>
            </span>
          ))}
        </div>

        {/* Route Content */}
        <Routes>
          <Route
            path="/"
            element={<VideoList onFolderClick={handleFolderClick} />}
          />
          <Route path=":folder" element={<FolderContent />} />
        </Routes>
      </div>
    </div>
  );
};

export default Video;
