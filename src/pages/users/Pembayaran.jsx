import React from "react";
import Navbar from "../../components/users/Navbar";
import garis from "../../assets/garis-kanan.png";

const Pembayaran = () => {
  return (
    <div className="min-h-screen bg-custom-bg relative">
      <Navbar />
      <img
        src={garis}
        className="absolute top-0 right-0 pt-[90px] h-full w-auto"
      />
      <img
        src={garis}
        className="absolute bottom-0 left-0 pt-[15rem] h-full w-auto scale-x-[-1]  transform z-0"
      />
      {/* Card Putih di Kanan Bawah */}
      <div className="fixed bottom-0 right-0 w-[80%] bg-white rounded-t-[60px] shadow-lg p-8 pl-[10%]">
        {/* Header Floating */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white text-lg font-bold py-2 px-6 rounded-full shadow">
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
                <span>: Paket Diamond</span>
              </div>
              <div className="flex justify-between">
                <span>Harga</span>
                <span>: Rp. 3.500.000</span>
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
              <span>: Rp. 3.500.000</span>
            </div>

            <div className="text-center mt-6">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium">
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pembayaran;
