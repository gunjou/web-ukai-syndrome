import React from "react";
import ModalMenu from "./ModalMenu";

const AboutModal = ({ isOpen, onClose }) => (
  <ModalMenu isOpen={isOpen} onClose={onClose} title="Tentang Aplikasi">
    <p className="text-gray-600">
      Aplikasi ini dibuat untuk membantu persiapan UKAI dengan fitur tryout,
      materi, hasil analisis, dan lainnya.
    </p>
  </ModalMenu>
);

export default AboutModal;
