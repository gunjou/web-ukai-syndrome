// src/pages/PrivacyPolicy.jsx
export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
      <p className="mb-6">
        <strong>Effective date:</strong> September 13, 2025
      </p>

      <p className="mb-4">
        Outlook-Project (“we”, “our”, or “us”) built the{" "}
        <strong>Syndrome Ukai</strong> mobile application (“Application”) as a
        free service. This Privacy Policy explains how we collect, use, and
        protect your information when you use our Application. By using the
        Application, you agree to the practices described in this Privacy
        Policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Information We Collect
      </h2>
      <p>
        When you use the Application, we may collect the following types of
        information:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-2">
        <li>
          <strong>Device Information:</strong> such as IP address, operating
          system, and app usage data (e.g., pages visited, time spent).
        </li>
        <li>
          <strong>Location Data:</strong> approximate or precise location, if
          you grant permission, to enable location-based features.
        </li>
        <li>
          <strong>User-Provided Data:</strong> such as name, email address,
          phone number, or age, when you choose to provide it.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        How We Use Information
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Delivering core app functionality.</li>
        <li>Improving app performance and user experience.</li>
        <li>Providing personalized content and recommendations.</li>
        <li>
          Sending important notifications (e.g., updates, service-related
          messages).
        </li>
        <li>Ensuring safety, compliance, and fraud prevention.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Third-Party Services
      </h2>
      <p>
        The Application may use third-party services that collect information to
        help us improve and support our services. These include but are not
        limited to:
      </p>
      <ul className="list-disc list-inside mt-2">
        <li>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Play Services
          </a>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Data Sharing & Disclosure
      </h2>
      <p>We may share information only in the following cases:</p>
      <ul className="list-disc list-inside mt-2 space-y-2">
        <li>When required by law or legal processes.</li>
        <li>
          To protect the rights, property, or safety of our users or others.
        </li>
        <li>
          With trusted service providers who operate on our behalf under strict
          confidentiality agreements.
        </li>
      </ul>
      <p className="mt-2">
        We do <strong>not</strong> sell or rent your personal information to
        third parties.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Data Retention & Control
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          We retain user-provided data for as long as necessary to deliver our
          services and for a reasonable period thereafter.
        </li>
        <li>
          You may request deletion of your data at any time by contacting us at{" "}
          <a
            href="mailto:outlookest2019@gmail.com"
            className="text-blue-600 hover:underline"
          >
            outlookest2019@gmail.com
          </a>
          .
        </li>
        <li>
          You can also stop all data collection immediately by uninstalling the
          Application.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Children’s Privacy
      </h2>
      <p>
        Our Application is{" "}
        <strong>not directed at children under 13 years old</strong>. We do not
        knowingly collect personal information from children. If we become aware
        that we have collected personal data from a child under 13, we will
        promptly delete it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Security
      </h2>
      <p>
        We implement reasonable administrative, technical, and physical
        safeguards to protect your information against unauthorized access,
        loss, or misuse. However, no system is 100% secure, and we cannot
        guarantee absolute security.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Changes to This Policy
      </h2>
      <p>
        We may update this Privacy Policy from time to time. Updates will be
        posted on this page with a revised “Effective Date”. We encourage you to
        review this Privacy Policy periodically.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-900">
        Contact Us
      </h2>
      <p>If you have questions or concerns, please contact us at:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:outlookest2019@gmail.com"
            className="text-blue-600 hover:underline"
          >
            outlookest2019@gmail.com
          </a>
        </li>
        <li>
          <strong>Website:</strong>{" "}
          <a
            href="https://ukaisyndrome.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://ukaisyndrome.id
          </a>
        </li>
      </ul>

      <footer className="mt-10 text-center text-sm text-gray-500">
        &copy; 2025 Outlook-Project. All rights reserved.
      </footer>
    </div>
  );
}
