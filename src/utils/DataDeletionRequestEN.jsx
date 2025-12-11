// src/components/DataDeletionRequestEN.jsx
import React from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";
import { Link } from "react-router-dom";

const DataDeletionRequestEN = () => {
  const adminEmail = "admin@ukaisyndrome.id";
  const appName = "Syndrome UKAI";
  const developerName = "Outlook-Project";
  // Asumsi link Kebijakan Privasi EN: /privacy-policy-en
  const privacyPolicyLink = "/privacy-policy-en";

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
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>

          {/* Language Toggle tetap di kanan */}
          <a
            href="/data-deletion-request-id"
            className="text-custom-merah hover:text-red-600 font-medium border-b border-custom-merah pb-0.5"
          >
            Lihat dalam Bahasa Indonesia
          </a>
        </div>
        {/* END: Navigasi Atas */}

        <header className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-custom-merah sm:text-4xl">
            Account and Data Deletion Request
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Application <span className="font-semibold">{appName}</span>
          </p>
        </header>

        <section className="space-y-8">
          <div className="bg-custom-merah/30 border-l-4 border-custom-merah p-6 rounded-md">
            <h2 className="text-2xl gap-2 font-bold text-custom-merah mb-4 flex items-center">
              <LuSparkles />
              Request Submission Steps
            </h2>
            <p className="text-black">
              We, <span className="font-semibold">{developerName}</span>,
              process account deletion requests via email. Please send your
              request to the contact address below to begin the process.
            </p>
            <div className="mt-4 p-4 bg-red-50 rounded-md text-center">
              <p className="text-lg font-semibold text-custom-merah">
                Email Address for Deletion Requests:
              </p>
              <a
                href={`mailto:${adminEmail}?subject=Account Deletion Request - ${appName}`}
                className="text-2xl font-extrabold text-custom-merah hover:text-red-800 transition duration-150"
              >
                {adminEmail}
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Required Details in the Email
            </h2>
            <p className="text-gray-600 mb-4">
              To ensure your request is processed quickly and securely, you must
              include the following details in your email:
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
                    Email Subject:
                  </strong>
                  <code className="bg-gray-200 text-red-600 px-2 py-1 rounded ml-2">
                    Account Deletion Request - {appName}
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
                    Account Identification:
                  </strong>
                  Include the email address or Username registered with your{" "}
                  <span className="font-semibold">{appName}</span> account.
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
                    Request Confirmation:
                  </strong>
                  Clearly state that you wish to{" "}
                  <span className="font-semibold">
                    permanently delete the account and all associated data
                  </span>
                  .
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Data Deleted and Retained
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>After the request is processed and identity is verified:</p>
              <blockquote className="border-l-4 border-red-500 pl-4 italic bg-red-50 p-3 rounded-md">
                <strong className="text-red-700">
                  Permanently Deleted Data:
                </strong>{" "}
                We will delete all{" "}
                <span className="font-semibold">User-Provided Data</span> (such
                as name, email, phone number, age) and device identification
                data associated with your account.
              </blockquote>
              <blockquote className="border-l-4 border-yellow-500 pl-4 italic bg-yellow-50 p-3 rounded-md">
                <strong className="text-yellow-700">Data Retained:</strong> We
                may retain certain data in an anonymous form for statistics, or
                for a reasonable period (as required by law) for the purposes of{" "}
                <span className="font-semibold">
                  compliance, auditing, or fraud prevention
                </span>
                , as outlined in our
                <a
                  href={privacyPolicyLink}
                  className="text-custom-merah hover:underline font-medium"
                >
                  {" "}
                  Privacy Policy
                </a>
                .
              </blockquote>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
          <p>
            Provided by {developerName} - &copy; {new Date().getFullYear()} All
            rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DataDeletionRequestEN;
