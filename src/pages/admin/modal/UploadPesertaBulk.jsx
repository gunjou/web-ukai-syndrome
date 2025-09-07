import { useState } from "react";
import Api from "../../../utils/Api";

const UploadPesertaBulk = ({ setShowModal, fetchUsers }) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await Api.get("/peserta/template", {
        responseType: "blob", // penting supaya dapat file
      });

      // buat link download manual
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_peserta.csv"); // nama file
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal download template:", err);
      alert("Gagal download template!");
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setIsSubmitting(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const response = await Api.post("/peserta/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // kalau sukses
      setUploadResult(response.data);
      setBulkFile(null);
      fetchUsers();
    } catch (err) {
      console.error("Upload gagal:", err);

      if (err.response && err.response.data) {
        // Ambil error detail dari API
        setUploadResult(err.response.data);
      } else {
        // Kalau tidak ada response detail (network error dll.)
        setUploadResult({
          status: "error",
          message: "Terjadi kesalahan jaringan. Coba lagi.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-4 text-center">
        Upload Peserta Bulk
      </h2>

      <div className="space-y-4">
        {/* Download Template */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          📥 Download Template CSV
        </button>

        {/* Upload Form */}
        <form
          className="space-y-4"
          onSubmit={handleBulkUpload}
          encType="multipart/form-data"
        >
          {/* Drag & Drop area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              bulkFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onClick={() => document.getElementById("fileInput").click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setBulkFile(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
              }
            }}
          >
            <input
              id="fileInput"
              type="file"
              accept=".csv, .xlsx"
              className="hidden"
              onChange={(e) => setBulkFile(e.target.files[0])}
            />

            {!bulkFile ? (
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16V4m0 0l-3 3m3-3l3 3M17 8v12m0 0l3-3m-3 3l-3-3"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  Klik atau seret file CSV/XLSX ke sini
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-600 mb-2 -mt-1"
                  fill="none"
                  viewBox="0 3 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-6h6v6h5l-8 8-8-8h5z"
                  />
                </svg>
                <p className="text-sm text-green-700 font-medium">
                  {bulkFile.name}
                </p>
              </div>
            )}
          </div>

          {/* Tombol submit */}
          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting || !bulkFile}
              className={`px-4 py-2 rounded-md text-white font-medium transition ${
                isSubmitting || !bulkFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Mengupload..." : "Upload"}
            </button>
          </div>
        </form>
      </div>

      {/* Alert hasil upload */}
      {uploadResult && (
        <div
          className={`p-4 rounded-lg text-sm mt-4 ${
            uploadResult.status === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <p className="font-medium">{uploadResult.message}</p>

          {/* Peserta duplikat */}
          {uploadResult.duplicates && uploadResult.duplicates.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold text-red-600">Peserta duplikat:</p>
              <ul className="list-disc list-inside text-red-500 text-sm">
                {uploadResult.duplicates.map((d, i) => (
                  <li key={i}>
                    {d.nama} ({d.email})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Kelas tidak tersedia */}
          {uploadResult.invalid_kelas &&
            uploadResult.invalid_kelas.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-orange-600">
                  Kelas tidak tersedia:
                </p>
                <ul className="list-disc list-inside text-orange-500 text-sm">
                  {uploadResult.invalid_kelas.map((k, i) => (
                    <li key={i}>{k.kelas}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </>
  );
};

export default UploadPesertaBulk;
