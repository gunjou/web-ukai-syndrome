import React from "react";
import ModalMenu from "./ModalMenu";

const HelpModal = ({ isOpen, onClose }) => (
  <ModalMenu isOpen={isOpen} onClose={onClose} title="Bantuan">
    <p className="text-gray-600">
      Jika mengalami kendala, silakan hubungi tim support melalui email{" "}
      <a
        href="mailto:admin@ukaisyndrome.id"
        className="text-blue-600 hover:underline"
        aria-label="Kirim email ke admin@ukaisyndrome.id"
      >
        admin@ukaisyndrome.id
      </a>{" "}
      atau melalui WhatsApp di{" "}
      <a
        href="https://wa.me/628213007505"
        className="text-blue-600 hover:underline"
        aria-label="Hubungi admin melalui WhatsApp"
      >
        WhatsApp
      </a>
      .
    </p>
  </ModalMenu>
);

export default HelpModal;
