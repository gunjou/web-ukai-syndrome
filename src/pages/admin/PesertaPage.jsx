import React, { useState, useEffect } from "react";
import Header from "../../components/admin/Header.jsx";
import { FaUpload } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import garisKanan from "../../assets/garis-kanan.png";
import Api from "../../utils/Api.jsx"; // import axios instance

const PesertaPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [file, setFile] = useState(null);

  // Ambil data dari endpoint /peserta-kelas
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Api.get("/peserta");
        setUserData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter data berdasarkan nama
  const filteredData = userData.filter((user) =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTableRows = () => {
    return filteredData.map((user, index) => (
      <tr key={index} className="bg-gray-100">
        <td className="px-4 py-2 text-xs sm:text-sm text-gray-800 border-b border-r border-l capitalize">
          {user.nama}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-left text-gray-800 border-b border-r">
          {user.email}
        </td>
        <td className="px-2 py-2 text-xs sm:text-sm text-left text-gray-800 border-b border-r">
          {user.kode_pemulihan || "-"}
        </td>
        {/* <td className="px-2 py-2 text-xs sm:text-sm text-center text-gray-800 border-b border-r">
          <div
            className={`inline-block px-3 py-1 text-white rounded-full
              ${
                user.paket === "Premium"
                  ? "bg-[#CD7F32]"
                  : user.paket === "Gold"
                  ? "bg-yellow-500"
                  : user.paket === "Silver"
                  ? "bg-gray-400"
                  : user.paket === "Diamond"
                  ? "bg-blue-700"
                  : "bg-gray-300"
              }`}
          >
            {user.paket}
          </div>
        </td> */}
        <td className="px-4 py-2 text-xs text-center sm:text-sm border-b border-r">
          <div className="flex justify-center gap-2">
            <button className="flex justify-center bg-gray-200  pl-2 rounded-full hover:bg-gray-500 hover:text-white items-center gap-2">
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
    <div className="user bg-custom-bg min-h-screen relative px-4">
      <img
        src={garisKanan}
        className="absolute top-0 right-0 pt-[90px]  h-full w-auto opacity-40 z-0"
        alt=""
      />
      <img
        src={garisKanan}
        className="absolute bottom-0 left-0 pt-[90px]  h-full w-auto opacity-40 rotate-180 transform z-0"
        alt=""
      />
      <Header />
      <div className="bg-white shadow-md rounded-[30px] mx-4 mt-8 pb-6 max-h-screen relative">
        {/* Search Bar, Title, Upload */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center py-2 px-8 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            className="border rounded-lg px-4 py-2 w-2/5 sm:w-1/6"
          />
          <h1 className="text-xl font-bold text-center sm:text-left w-full sm:w-auto">
            Peserta Ukai Syndrome
          </h1>
          <div className="flex items-center gap-2 w-11/12 sm:w-1/4">
            <input type="file" className="border px-4 py-1 w-full rounded-md" />
            <button className="bg-blue-600 text-white rounded-md px-2 py-2 hover:bg-blue-700 flex items-center gap-2">
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
                <th className="px-4 py-2 text-xs sm:text-sm">Nama</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Email</th>
                <th className="px-2 py-2 text-xs sm:text-sm">Kode Pemulihan</th>
                {/* <th className="px-4 py-2 text-xs sm:text-sm">Paket</th> */}
                <th className="px-4 py-2 text-xs sm:text-sm">Detail</th>
                <th className="px-4 py-2 text-xs sm:text-sm">Hapus</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PesertaPage;
