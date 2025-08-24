import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/users/Navbar";
import garis from "../../assets/garis-kanan.png";
import ModalMetode from "../../components/users/ModalMetode";

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const Pembayaran = () => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [paket, setPaket] = useState(null);

  useEffect(() => {
    // Ambil data dari location.state dulu
    if (location.state) {
      setPaket(location.state);
      localStorage.setItem("paketTerpilih", JSON.stringify(location.state));
    } else {
      // Kalau kosong, coba ambil dari localStorage
      const saved = localStorage.getItem("paketTerpilih");
      if (saved) {
        setPaket(JSON.parse(saved));
      }
    }
  }, [location.state]);

  if (!paket) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-r from-[#a11d1d] to-[#531d1d]">
        <div>
          <p className="mb-4">Tidak ada paket yang dipilih.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-yellow-500 px-4 py-2 rounded"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a11d1d] to-[#531d1d] relative">
      <Navbar />
      <img
        src={garis}
        className="absolute -top-12 right-0 pt-[90px] h-full w-50"
      />
      <img
        src={garis}
        className="absolute bottom-0 left-0 pt-[15rem] h-full w-auto scale-x-[-1] transform z-0"
      />

      {/* Card Putih */}
      <div className="fixed bottom-0 right-0 w-[80%] bg-white rounded-t-[60px] shadow-lg p-8 pl-[10%] z-10">
        {/* Header */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-500 text-white text-lg font-bold py-2 px-6 rounded-full shadow">
            Keranjang Anda
          </div>
        </div>

        {/* Daftar Pesanan */}
        <div className="mt-8 border border-gray-300 rounded-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 mb-2">Daftar Pesanan</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Jenis Paket</span>
                <span>: {paket.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Harga</span>
                <span>: Rp {paket.harga.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon</span>
                <span>: -</span>
              </div>
            </div>
          </div>

          <div className="p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Pajak</span>
              <span>: -</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              (Dihitung setelah informasi penagihan)
            </p>
            <div className="flex justify-between font-semibold text-base mt-4">
              <span>Subtotal</span>
              <span>: Rp {paket.harga.toLocaleString("id-ID")}</span>
            </div>

            <div className="text-left pt-8">
              <a
                href={`https://wa.me/6281917250391?text=${encodeURIComponent(
                  (() => {
                    const user = JSON.parse(localStorage.getItem("user")) || {};
                    return `Halo Admin, saya ingin memesan paket:\n\nID User: ${
                      user.id_user || "-"
                    }\nNama: ${capitalizeWords(user.nama)}\nJenis Paket: ${
                      paket.title
                    }\nHarga: Rp ${paket.harga.toLocaleString(
                      "id-ID"
                    )}\n\nMohon informasi lebih lanjut.`;
                  })()
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium inline-block"
              >
                Lanjutkan via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalMetode show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Pembayaran;
