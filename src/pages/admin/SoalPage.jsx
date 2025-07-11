import React, { useState } from "react";
import Header from "../../components/admin/Header.jsx";
import { FaUpload } from "react-icons/fa"; // Importing the icons
import garisKanan from "../../assets/garis-kanan.png";
import bgmaps from "../../assets/maps.png";
import { MdClose } from "react-icons/md";
import soalData from "./soalData.js";
import { LuPencil } from "react-icons/lu";

const SoalPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    if (file) {
      // Implement your file upload logic here
      alert(`File ${file.name} uploaded!`);
    } else {
      alert("Please select a file to upload.");
    }
  };

  // Filter the soalData based on the search term
  const filteredData = soalData.filter((soal) =>
    soal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render a row for each item in soalData
  const renderTableRows = () => {
    return filteredData.map((soal, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border-b border-r border-l">
          {soal.name}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
          {soal.jumlahSoal}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center font-semibold border-b border-r">
          <span
            className={`${
              soal.status === "Open"
                ? "text-green-500"
                : soal.status === "Hold"
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {soal.status}
          </span>
        </td>
        <td className=" px-4 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
          <div className="flex justify-center bg-gray-200 pl-4 rounded-full items-center gap-2">
            {soal.waktu}{" "}
            <div className="flex justify justify-right font-semibold bg-gray-300 pl-2 pr-2 w-full py-2 rounded-r-full">
              Menit
            </div>
          </div>
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
          {soal.tanggal}
        </td>
        <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button className="flex justify-center bg-gray-200 pl-2 rounded-full hover:bg-gray-500 hover:text-white items-center gap-2">
              Detail
              <div className="bg-gray-500 rounded-r-full px-2 py-2">
                <LuPencil className="text-white font-extrabold" />
              </div>
            </button>
          </div>
        </td>
        <td className="px-4 py-2 text-xs sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button className="bg-gray-200 pl-2 rounded-full hover:bg-red-500 hover:text-white flex items-center gap-2">
              Hapus
              <div className="bg-red-500 rounded-r-full px-2 py-2">
                <MdClose className="text-white font-extrabold" />
              </div>
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="soal bg-custom-bg min-h-screen relative px-4">
      {/* <img
        src={bgmaps}
        alt="Background Image"
        className="absolute top-0 right-0 pt-[90px] w-full h-full object-cover opacity-10 z-0"
      /> */}

      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px]  h-full w-auto opacity-40 z-0"
      />
      <img
        src={garisKanan}
        className="absolute bottom-0 left-0 pt-[90px]  h-full w-auto opacity-40 rotate-180 transform z-0"
      />
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 max-h-screen relative">
        {/* Search Bar, Title, and File Upload with Upload Button */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center py-2 px-8 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            className="border rounded-lg px-4 py-2 w-2/5 sm:w-1/6"
          />
          <h1 className="text-xl font-bold text-center sm:text-left w-full sm:w-auto">
            Master Soal
          </h1>
          <div className="flex items-center gap-2 w-11/12 sm:w-1/4">
            <input
              type="file"
              onChange={handleFileChange}
              className="border px-4 py-1 w-full rounded-md"
            />
            <button
              onClick={handleUploadClick}
              className="bg-blue-600 text-white rounded-md px-2 py-2 hover:bg-blue-700 flex items-center gap-2"
            >
              <FaUpload />
              Upload
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="min-w-full bg-white">
            <thead className="border border-gray-200 font-bold bg-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-xs sm:text-sm">Nama Try Out</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Jumlah Soal</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Status</th>
                <th className="px-4 py-2 text-xs sm:text-sm">Waktu</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Tanggal</th>
                <th className="px-4 py-2 text-xs sm:text-sm">Detail</th>
                <th className="px-4 py-2 text-xs sm:text-sm">Hapus</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">{renderTableRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoalPage;
