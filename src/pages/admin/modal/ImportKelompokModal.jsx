import React, { useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Api from "../../../utils/Api.jsx";

const getPayloadLayers = (payload) => {
  const layers = [payload];
  if (payload?.data && !Array.isArray(payload.data)) {
    layers.push(payload.data);
  }
  if (payload?.result && typeof payload.result === "object") {
    layers.push(payload.result);
  }
  return layers;
};

const getFirstArray = (layers, keys) => {
  for (const layer of layers) {
    for (const key of keys) {
      if (Array.isArray(layer?.[key])) return layer[key];
    }
  }
  return [];
};

const getMessage = (payload, fallback) => {
  const layers = getPayloadLayers(payload);
  for (const layer of layers) {
    if (typeof layer?.message === "string" && layer.message.trim()) {
      return layer.message;
    }
  }
  return fallback;
};

const formatValue = (value) => {
  if (value == null || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const ImportKelompokModal = ({ batchData, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [batchId, setBatchId] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState("");
  const [formError, setFormError] = useState("");
  const [templateError, setTemplateError] = useState("");

  const resultPayload = importResult || validationResult;
  const payloadLayers = useMemo(
    () => getPayloadLayers(resultPayload),
    [resultPayload]
  );
  const previewRows = useMemo(
    () => getFirstArray(payloadLayers, ["preview", "rows", "valid_rows"]),
    [payloadLayers]
  );
  const errorRows = useMemo(
    () =>
      getFirstArray(payloadLayers, [
        "errors",
        "row_errors",
        "validation_errors",
        "invalid_rows",
      ]),
    [payloadLayers]
  );
  const previewColumns = useMemo(
    () =>
      previewRows.length > 0 && typeof previewRows[0] === "object"
        ? Object.keys(previewRows[0])
        : [],
    [previewRows]
  );
  const hasValidationErrors =
    errorRows.length > 0 ||
    payloadLayers.some(
      (layer) =>
        layer?.status === "error" ||
        layer?.status === false ||
        layer?.success === false
    );
  const canImport =
    Boolean(validationResult) &&
    !hasValidationErrors &&
    !isValidating &&
    !isImporting &&
    !downloadingFormat;

  const resetResults = () => {
    setValidationResult(null);
    setImportResult(null);
    setFormError("");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    resetResults();
  };

  const handleBatchChange = (event) => {
    setBatchId(event.target.value);
    resetResults();
  };

  const handleDownloadTemplate = async (format) => {
    setDownloadingFormat(format);
    setTemplateError("");

    try {
      const params = new URLSearchParams();
      if (batchId) params.set("id_batch", batchId);
      const query = params.toString();
      const response = await Api.get(
        `/kelompok/bulk/template${query ? `?${query}` : ""}`,
        { responseType: "blob" }
      );
      const extension = format === "xlsx" ? "xlsx" : "csv";
      const contentType =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv;charset=utf-8";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `template_import_kelompok.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      console.error("Gagal mengunduh template kelompok:", requestError);
      let message =
        requestError.response?.data?.message ||
        "Gagal mengunduh template. Silakan coba lagi.";

      if (requestError.response?.data instanceof Blob) {
        try {
          const responseText = await requestError.response.data.text();
          const errorPayload = JSON.parse(responseText);
          message = errorPayload.message || errorPayload.error || message;
        } catch (parseError) {
          console.error("Gagal membaca respons error template:", parseError);
        }
      }

      setTemplateError(message);
    } finally {
      setDownloadingFormat("");
    }
  };

  const submitImport = async (dryRun) => {
    if (!file || !batchId) {
      setFormError("Pilih file dan batch terlebih dahulu.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_batch", batchId);
    formData.append("dry_run", String(dryRun));

    const response = await Api.post("/kelompok/bulk/import", formData);
    return response.data;
  };

  const handleValidate = async (event) => {
    event.preventDefault();
    resetResults();
    setIsValidating(true);

    try {
      const result = await submitImport(true);
      setValidationResult(result);
      if (
        !getFirstArray(getPayloadLayers(result), [
          "errors",
          "row_errors",
          "validation_errors",
          "invalid_rows",
        ]).length &&
        !getPayloadLayers(result).some(
          (layer) =>
            layer?.status === "error" ||
            layer?.status === false ||
            layer?.success === false
        )
      ) {
        setFormError("");
      }
    } catch (requestError) {
      console.error("Gagal memvalidasi import kelompok:", requestError);
      const responsePayload = requestError.response?.data;
      if (responsePayload) {
        setValidationResult(responsePayload);
      } else {
        setFormError(
          "Validasi gagal karena masalah jaringan. Periksa koneksi lalu coba lagi."
        );
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!canImport) return;
    setFormError("");
    setIsImporting(true);

    try {
      const result = await submitImport(false);
      setImportResult(result);
      const resultLayers = getPayloadLayers(result);
      const resultErrors = getFirstArray(resultLayers, [
        "errors",
        "row_errors",
        "validation_errors",
        "invalid_rows",
      ]);
      const failed = resultErrors.length > 0 || resultLayers.some(
        (layer) =>
          layer?.status === "error" ||
          layer?.status === false ||
          layer?.success === false
      );

      if (!failed) onSuccess();
    } catch (requestError) {
      console.error("Gagal mengimpor anggota kelompok:", requestError);
      if (requestError.response?.data) {
        setImportResult(requestError.response.data);
      } else {
        setFormError(
          "Import gagal karena masalah jaringan. Periksa koneksi lalu coba lagi."
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <section
        className="my-6 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-kelompok-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="import-kelompok-title" className="text-xl font-bold">
            Import Anggota Kelompok
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600"
          >
            <AiOutlineClose size={22} />
          </button>
        </div>

        <form onSubmit={handleValidate} className="space-y-4">
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Batch <span className="text-red-600">*</span>
            <select
              required
              value={batchId}
              onChange={handleBatchChange}
              className="w-full rounded-lg border px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Pilih batch</option>
              {batchData.map((batch) => (
                <option key={batch.id_batch} value={batch.id_batch}>
                  {batch.nama_batch}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm font-medium text-gray-700">
            File CSV atau XLSX <span className="text-red-600">*</span>
            <input
              required
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="block w-full rounded-lg border p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2"
            />
            <span className="block text-xs font-normal text-gray-500">
              Kolom wajib: nama_kelompok. Isi email dan/atau nama peserta.
            </span>
          </label>
          {file && (
            <p className="text-sm text-gray-600">File dipilih: {file.name}</p>
          )}

          {formError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {formError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={
                isValidating || isImporting || Boolean(downloadingFormat) || !file || !batchId
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isValidating ? "Memvalidasi..." : "Validasi & Preview"}
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!canImport}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isImporting ? "Mengimpor..." : "Import Data"}
            </button>
          </div>
        </form>

        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-gray-800">
            Unduh template import
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Batch yang dipilih akan digunakan untuk mengisi daftar anggota dan
            dropdown nama kelompok pada template Excel. Jika batch belum
            dipilih, template dibuat tanpa filter batch.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownloadTemplate("xlsx")}
              disabled={Boolean(downloadingFormat)}
              className="rounded-lg border border-blue-600 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingFormat === "xlsx"
                ? "Mengunduh Excel..."
                : "Unduh Excel (.xlsx)"}
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTemplate("csv")}
              disabled={Boolean(downloadingFormat)}
              className="rounded-lg border border-blue-600 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingFormat === "csv"
                ? "Mengunduh CSV..."
                : "Unduh CSV"}
            </button>
          </div>
          {templateError && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {templateError}
            </p>
          )}
        </div>

        {resultPayload && (
          <div
            className={`mt-5 rounded-lg border p-4 ${
              hasValidationErrors
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
            role="status"
          >
            <p className="font-semibold">
              {getMessage(
                resultPayload,
                hasValidationErrors
                  ? "Validasi menemukan error. Data belum diimpor."
                  : importResult
                    ? "Import selesai."
                    : "Validasi berhasil. Periksa preview sebelum import."
              )}
            </p>
            {canImport && (
              <p className="mt-1 text-sm">
                Tidak ada error validasi. Tekan Import Data untuk menyimpan
                seluruh anggota.
              </p>
            )}

            {errorRows.length > 0 && (
              <div className="mt-3">
                <h3 className="font-semibold">Error validasi</h3>
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                  {errorRows.map((error, index) => (
                    <li key={index}>
                      {typeof error === "string"
                        ? error
                        : [
                            error.row != null ? `Baris ${error.row}` : null,
                            error.message || error.error || error.reason,
                            error.email,
                            error.nama,
                          ]
                            .filter(Boolean)
                            .join(": ") || JSON.stringify(error)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <h3 className="border-b px-3 py-2 font-semibold text-gray-800">
                  Preview ({previewRows.length} baris ditampilkan)
                </h3>
                <table className="min-w-full text-left text-sm text-gray-800">
                  <thead className="bg-gray-100">
                    <tr>
                      {previewColumns.map((column) => (
                        <th key={column} className="whitespace-nowrap px-3 py-2">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, index) => (
                      <tr key={index} className="border-t">
                        {previewColumns.map((column) => (
                          <td key={column} className="px-3 py-2">
                            {formatValue(row?.[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ImportKelompokModal;
