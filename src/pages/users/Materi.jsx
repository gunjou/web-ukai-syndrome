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
import MateriListContent from "./MateriListContent";

const menuItems = [
  "Farmasi",
  "Kimia",
  "Biologi",
  "Fisika",
  "Matematika",
  "Anatomi",
  "Fisiologi",
  "Etika Profesi",
];

const MateriList = ({ onFolderClick }) => (
  <div className="flex flex-wrap gap-6 p-4">
    {menuItems.map((item) => (
      <div
        key={item}
        className="relative bg-white w-[160px] h-[120px] shadow border border-gray-200 rounded-lg cursor-pointer flex flex-col items-center pt-10"
        onClick={() => onFolderClick(item)}
      >
        <img
          src={icon_folder}
          alt="Folder Icon"
          className="w-auto h-[5rem] absolute -top-5 left-1/2 transform -translate-x-1/2"
        />
        <div className="mt-2 text-center px-2 flex-1 flex items-center justify-center">
          <span className="text-gray-700 font-medium text-base">{item}</span>
        </div>
      </div>
    ))}
  </div>
);

const FolderContent = () => {
  return <MateriListContent />;
};

const Materi = () => {
  const [backStack, setBackStack] = React.useState([]);
  const [forwardStack, setForwardStack] = React.useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { folder } = useParams();

  const basePath = "/dashboard/materi";

  const pathSegments = location.pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);

  const handleFolderClick = (folderName) => {
    const slug = folderName.toLowerCase().replace(/\s+/g, "-");
    setBackStack((prev) => [...prev, location.pathname]);
    setForwardStack([]);
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
    <div className="bg-white w-full h-auto h-p-6">
      <div className="w-full bg-gray-100 p-4 rounded-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Materi Explorer</h1>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (backStack.length > 0) {
                  const last = backStack[backStack.length - 1];
                  setBackStack((prev) => prev.slice(0, -1));
                  setForwardStack((prev) => [location.pathname, ...prev]);
                  navigate(last);
                }
              }}
              disabled={backStack.length === 0}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] transition ${
                backStack.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <HiArrowLeft className="text-lg" />
              Back
            </button>

            <button
              onClick={() => {
                if (forwardStack.length > 0) {
                  const next = forwardStack[0];
                  setForwardStack((prev) => prev.slice(1));
                  setBackStack((prev) => [...prev, location.pathname]);
                  navigate(next);
                }
              }}
              disabled={forwardStack.length === 0}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-[20px] transition ${
                forwardStack.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
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
            Materi
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
            element={<MateriList onFolderClick={handleFolderClick} />}
          />
          <Route path=":folder" element={<FolderContent />} />
        </Routes>
      </div>
    </div>
  );
};

export default Materi;
