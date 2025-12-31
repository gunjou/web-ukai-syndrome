import React from "react";
import { AiOutlineClose } from "react-icons/ai";

export default function FilterLaporanModal({
  open,
  setOpen,
  listTryout,
  filters,
  setFilters,
  onApply,
  onReset,
}) {
  if (!open) return null;

  const toggleTryout = (id) => {
    setFilters({
      ...filters,
      selectedTryouts: [id], // hanya boleh satu
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filter Lanjutan
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={filters.statusPengerjaan}
              onChange={(e) =>
                setFilters({ ...filters, statusPengerjaan: e.target.value })
              }
            >
              <option value="">Semua Status</option>
              <option value="submitted">Submitted</option>
              <option value="ongoing">In Progress</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Attempt Ke
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={filters.attemptKe}
              onChange={(e) =>
                setFilters({ ...filters, attemptKe: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nilai Min
            </label>
            <input
              type="number"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={filters.nilaiMin}
              onChange={(e) =>
                setFilters({ ...filters, nilaiMin: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nilai Max
            </label>
            <input
              type="number"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={filters.nilaiMax}
              onChange={(e) =>
                setFilters({ ...filters, nilaiMax: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tanggal Mulai
            </label>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={filters.tanggalMulai}
              onChange={(e) =>
                setFilters({ ...filters, tanggalMulai: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tanggal Akhir
            </label>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={filters.tanggalAkhir}
              onChange={(e) =>
                setFilters({ ...filters, tanggalAkhir: e.target.value })
              }
            />
          </div>
        </div>

        {/* TRYOUT SINGLE SELECT */}
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Pilih Tryout
          </p>

          <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900">
            {listTryout.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tidak ada tryout
              </p>
            )}

            {listTryout.map((t) => (
              <label
                key={t.id_tryout}
                className="flex items-center gap-2 text-sm cursor-pointer text-gray-800 dark:text-gray-200"
              >
                <input
                  type="radio"
                  name="tryout"
                  checked={filters.selectedTryouts[0] === t.id_tryout}
                  onChange={() => toggleTryout(t.id_tryout)}
                  className="accent-indigo-600 dark:accent-indigo-400"
                />
                {t.judul}
              </label>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onReset}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 text-sm rounded-lg transition"
          >
            Reset
          </button>

          <button
            onClick={() => {
              onApply(filters);
              setOpen(false);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg transition"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
