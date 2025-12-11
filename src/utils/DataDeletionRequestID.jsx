// src/components/DataDeletionRequestID.jsx
import React from "react";
import { Link } from "react-router-dom";

import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";

const DataDeletionRequestID = () => {
  const adminEmail = "admin@ukaisyndrome.id";
  const appName = "Syndrome UKAI";
  const developerName = "Outlook-Project";
  // Asumsi link Kebijakan Privasi ID: /privacy-policy-id
  const privacyPolicyLink = "/privacy-policy-id";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
        {/* START: Navigasi Atas (Back dan Language Toggle) */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/" // Mengarah ke rute halaman utama
            className="text-custom-merah hover:text-red-700 transition duration-150 flex items-center"
            aria-label="Back to Home Page"
          >
            <span className="text-2xl">
              <MdOutlineKeyboardBackspace />
            </span>
            <span className="text-sm font-medium hidden sm:inline">
              Kembali
            </span>
          </Link>

          {/* Language Toggle tetap di kanan */}
          <a
            href="/data-deletion-request-en"
            className="text-custom-merah hover:text-red-600 font-medium border-b border-custom-merah pb-0.5"
          >
            View in English
          </a>
        </div>
        {/* END: Navigasi Atas */}

        <header className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-custom-merah sm:text-4xl">
            Permintaan Penghapusan Akun dan Data
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Aplikasi <span className="font-semibold">{appName}</span>
          </p>
        </header>

        <section className="space-y-8">
          <div className="bg-custom-merah/30 border-l-4 border-custom-merah p-6 rounded-md">
            <h2 className="text-2xl gap-2 font-bold text-custom-merah mb-4 flex items-center">
              <LuSparkles />
              Langkah Pengajuan Permintaan
            </h2>
            <p className="text-black">
              Kami, <span className="font-semibold">{developerName}</span>,
              memproses permintaan penghapusan akun melalui email. Harap
              kirimkan email ke alamat kontak kami di bawah ini untuk memulai
              prosesnya.
            </p>
            <div className="mt-4 p-4 bg-red-50 rounded-md text-center">
              <p className="text-lg font-semibold text-custom-merah">
                Alamat Email untuk Permintaan:
              </p>
              <a
                href={`mailto:${adminEmail}?subject=Permintaan Penghapusan Akun - ${appName}`}
                className="text-2xl font-extrabold text-custom-merah hover:text-red-800 transition duration-150"
              >
                {adminEmail}
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Detail yang Wajib Disertakan dalam Email
            </h2>
            <p className="text-gray-600 mb-4">
              Untuk memastikan permintaan Anda diproses dengan cepat dan aman,
              wajib sertakan detail berikut dalam email Anda:
            </p>
            <ul className="space-y-3 list-none p-0">
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-3 text-green-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </span>
                <div>
                  <strong className="font-semibold text-gray-700">
                    Subjek Email:
                  </strong>
                  <code className="bg-gray-200 text-red-600 px-2 py-1 rounded ml-2">
                    Permintaan Penghapusan Akun - {appName}
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-3 text-green-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </span>
                <div>
                  <strong className="font-semibold text-gray-700">
                    Identifikasi Akun:
                  </strong>
                  Sertakan alamat email atau Nama Pengguna yang terdaftar di
                  akun <span className="font-semibold">{appName}</span> Anda.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-3 text-green-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </span>
                <div>
                  <strong className="font-semibold text-gray-700">
                    Konfirmasi Permintaan:
                  </strong>
                  Nyatakan secara jelas bahwa Anda ingin{" "}
                  <span className="font-semibold">
                    menghapus akun dan semua data terkait secara permanen
                  </span>
                  .
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Data yang Dihapus dan Dipertahankan
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>Setelah permintaan diproses dan identitas diverifikasi:</p>
              <blockquote className="border-l-4 border-red-500 pl-4 italic bg-red-50 p-3 rounded-md">
                <strong className="text-red-700">
                  Data yang Dihapus Permanen:
                </strong>{" "}
                Kami akan menghapus semua{" "}
                <span className="font-semibold">User-Provided Data</span>{" "}
                (seperti nama, email, nomor telepon, usia) dan data identifikasi
                perangkat yang terkait dengan akun Anda.
              </blockquote>
              <blockquote className="border-l-4 border-yellow-500 pl-4 italic bg-yellow-50 p-3 rounded-md">
                <strong className="text-yellow-700">
                  Data yang Dipertahankan:
                </strong>{" "}
                Kami dapat menyimpan data tertentu dalam bentuk anonim
                (non-pribadi) untuk statistik, atau menyimpannya untuk periode
                waktu yang wajar (sesuai hukum) untuk tujuan{" "}
                <span className="font-semibold">
                  kepatuhan, audit, atau pencegahan penipuan
                </span>
                , sebagaimana diatur dalam
                <a
                  href={privacyPolicyLink}
                  className="text-custom-merah hover:underline font-medium"
                >
                  {" "}
                  Kebijakan Privasi
                </a>
                .
              </blockquote>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
          <p>
            Disediakan oleh {developerName} - &copy; {new Date().getFullYear()}{" "}
            All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DataDeletionRequestID;
