import React from "react";
import { MdClose } from "react-icons/md";

const ModalMetode = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-custom-bg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          Pilih Metode Pembayaran
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          <MdClose />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* BANK */}
        <section>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Transfer Bank
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg"
              name="BCA"
            />
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg"
              name="BNI"
            />
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg"
              name="BRI"
            />
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg"
              name="Mandiri"
            />
          </div>
        </section>

        {/* E-Wallet */}
        <section>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">E-Wallet</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg"
              name="DANA"
            />
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg"
              name="GoPay"
            />
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg"
              name="OVO"
            />
            <BankItem
              logo="https://shopeepay.co.id/src/pages/home/assets/images/new-homepage/new-spp-logo.svg"
              name="ShopeePay"
            />
          </div>
        </section>

        {/* QRIS */}
        <section>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">QRIS</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <BankItem
              logo="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg"
              name="QRIS"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const BankItem = ({ logo, name }) => (
  <div className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl p-4 cursor-pointer transition text-center">
    <img src={logo} alt={name} className="h-10 object-contain mb-2" />
    <span className="text-xs font-medium text-gray-700">{name}</span>
  </div>
);

export default ModalMetode;
