// src/pages/PrivacyPolicyID.jsx
import React from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { Link } from "react-router-dom";
export default function PrivacyPolicyID() {
  const adminEmail = "admin@ukaisyndrome.id";
  const websiteURL = "https://ukaisyndrome.id";

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-gray-800">
      {/* 🚀 START: Icon Back ke Halaman Utama (/) */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/" // Mengarah ke rute halaman utama
          className="text-custom-merah hover:text-red-700 gap-1 transition duration-150 flex items-center"
          aria-label="Kembali ke Halaman Utama"
        >
          <span className="text-2xl">
            <MdOutlineKeyboardBackspace />
          </span>
          <span className="text-sm font-medium hidden sm:inline">Kembali</span>
        </Link>
        {/* Toggle Bahasa tetap ada di sebelah kanan */}
        <a
          href="/privacy-policy"
          className="text-custom-merah hover:text-red-600 font-medium border-b border-custom-merah pb-0.5"
        >
          View in English
        </a>
      </div>
      {/* 🚀 END: Icon Back */}

      <h1 className="text-3xl font-bold mb-4 text-custom-merah">
        Kebijakan Privasi
      </h1>
      <p className="mb-6">
        <strong>Tanggal berlaku:</strong> 13 September 2025
      </p>

      <p className="mb-4">
        Outlook-Project (“kami”) membangun aplikasi seluler
        <strong>Syndrome UKAI</strong> sebagai layanan gratis. Kebijakan Privasi
        ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi
        informasi Anda saat Anda menggunakan Aplikasi kami. Dengan menggunakan
        Aplikasi, Anda menyetujui praktik yang dijelaskan dalam Kebijakan
        Privasi ini.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Informasi yang Kami Kumpulkan
      </h2>
      <p>
        Saat Anda menggunakan Aplikasi, kami dapat mengumpulkan jenis informasi
        berikut:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-2">
        <li>
          <strong>Informasi Perangkat:</strong> seperti alamat IP, sistem
          operasi, dan data penggunaan aplikasi (misalnya, halaman yang
          dikunjungi, waktu yang dihabiskan).
        </li>
        <li>
          <strong>Data Lokasi:</strong> perkiraan atau lokasi yang tepat, jika
          Anda memberikan izin, untuk mengaktifkan fitur berbasis lokasi.
        </li>
        <li>
          <strong>Data yang Disediakan Pengguna:</strong> seperti nama, alamat
          email, nomor telepon, atau usia, saat Anda memilih untuk
          memberikannya.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Cara Kami Menggunakan Informasi
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Menyediakan fungsionalitas inti aplikasi.</li>
        <li>Meningkatkan kinerja aplikasi dan pengalaman pengguna.</li>
        <li>Menyediakan konten dan rekomendasi yang dipersonalisasi.</li>
        <li>
          Mengirimkan pemberitahuan penting (misalnya, pembaruan, pesan terkait
          layanan).
        </li>
        <li>Memastikan keamanan, kepatuhan, dan pencegahan penipuan.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Layanan Pihak Ketiga
      </h2>
      <p>
        Aplikasi dapat menggunakan layanan pihak ketiga yang mengumpulkan
        informasi untuk membantu kami meningkatkan dan mendukung layanan kami.
        Ini termasuk tetapi tidak terbatas pada:
      </p>
      <ul className="list-disc list-inside mt-2">
        <li>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-custom-merah hover:underline"
          >
            Layanan Google Play (Google Play Services)
          </a>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Pembagian & Pengungkapan Data
      </h2>
      <p>Kami dapat membagikan informasi hanya dalam kasus berikut:</p>
      <ul className="list-disc list-inside mt-2 space-y-2">
        <li>Ketika diwajibkan oleh hukum atau proses hukum.</li>
        <li>
          Untuk melindungi hak, properti, atau keselamatan pengguna kami atau
          orang lain.
        </li>
        <li>
          Dengan penyedia layanan tepercaya yang beroperasi atas nama kami di
          bawah perjanjian kerahasiaan yang ketat.
        </li>
      </ul>
      <p className="mt-2">
        Kami <strong>tidak</strong> menjual atau menyewakan informasi pribadi
        Anda kepada pihak ketiga.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Penyimpanan & Kontrol Data
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Kami menyimpan data yang disediakan pengguna selama diperlukan untuk
          menyediakan layanan kami dan untuk jangka waktu yang wajar setelahnya.
        </li>
        <li>
          Anda dapat meminta penghapusan data Anda kapan saja dengan menghubungi
          kami di{" "}
          <a
            href={`mailto:${adminEmail}`}
            className="text-custom-merah hover:underline"
          >
            {adminEmail}
          </a>
          .
        </li>
        <li>
          Anda juga dapat menghentikan semua pengumpulan data segera dengan
          menghapus instalasi (uninstall) Aplikasi.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Privasi Anak
      </h2>
      <p>
        Aplikasi kami{" "}
        <strong>tidak ditujukan untuk anak di bawah usia 13 tahun</strong>. Kami
        tidak dengan sengaja mengumpulkan informasi pribadi dari anak-anak. Jika
        kami menyadari bahwa kami telah mengumpulkan data pribadi dari anak di
        bawah usia 13 tahun, kami akan segera menghapusnya.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Keamanan
      </h2>
      <p>
        Kami menerapkan perlindungan administratif, teknis, dan fisik yang wajar
        untuk melindungi informasi Anda dari akses, kehilangan, atau
        penyalahgunaan yang tidak sah. Namun, tidak ada sistem yang 100% aman,
        dan kami tidak dapat menjamin keamanan mutlak.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Perubahan pada Kebijakan Ini
      </h2>
      <p>
        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
        Pembaruan akan diposting di halaman ini dengan "Tanggal Berlaku" yang
        direvisi. Kami mendorong Anda untuk meninjau Kebijakan Privasi ini
        secara berkala.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-custom-merah">
        Hubungi Kami
      </h2>
      <p>
        Jika Anda memiliki pertanyaan atau kekhawatiran, silakan hubungi kami
        di:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${adminEmail}`}
            className="text-custom-merah hover:underline"
          >
            {adminEmail}
          </a>
        </li>
        <li>
          <strong>Website:</strong>{" "}
          <a
            href={websiteURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-custom-merah hover:underline"
          >
            {websiteURL}
          </a>
        </li>
      </ul>

      <footer className="mt-10 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Outlook-Project. Hak cipta dilindungi
        undang-undang.
      </footer>
    </div>
  );
}
