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
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filter Lanjutan</h2>
          <button onClick={() => setOpen(false)}>
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold">Status</label>
            <select
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={filters.statusPengerjaan}
              onChange={(e) =>
                setFilters({ ...filters, statusPengerjaan: e.target.value })
              }
            >
              <option value="">Semua Status</option>
              <option value="submitted">Submitted</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold">Attempt Ke</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={filters.attemptKe}
              onChange={(e) =>
                setFilters({ ...filters, attemptKe: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Nilai Min</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={filters.nilaiMin}
              onChange={(e) =>
                setFilters({ ...filters, nilaiMin: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Nilai Max</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={filters.nilaiMax}
              onChange={(e) =>
                setFilters({ ...filters, nilaiMax: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Tanggal Mulai</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={filters.tanggalMulai}
              onChange={(e) =>
                setFilters({ ...filters, tanggalMulai: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Tanggal Akhir</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={filters.tanggalAkhir}
              onChange={(e) =>
                setFilters({ ...filters, tanggalAkhir: e.target.value })
              }
            />
          </div>
        </div>

        {/* TRYOUT SINGLE SELECT */}
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1">Pilih Tryout</p>

          <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
            {listTryout.length === 0 && (
              <p className="text-xs text-gray-500">Tidak ada tryout</p>
            )}

            {listTryout.map((t) => (
              <label
                key={t.id_tryout}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  name="tryout"
                  checked={filters.selectedTryouts[0] === t.id_tryout}
                  onChange={() => toggleTryout(t.id_tryout)}
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
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm rounded-lg"
          >
            Reset
          </button>

          <button
            onClick={() => {
              onApply(filters);
              setOpen(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
