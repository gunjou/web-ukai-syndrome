import React, { useEffect, useState } from "react";
import { FiX, FiPlus, FiUploadCloud, FiEdit3 } from "react-icons/fi";
import Api from "../../../utils/Api.jsx";
import TambahSoalModal from "./TambahSoalModal.jsx";
import UploadSoalModal from "./UploadSoalModal.jsx";
import EditSoalModal from "./EditSoalModal.jsx";

const LihatSoalModal = ({ tryout, onClose }) => {
  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTambah, setShowTambah] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editData, setEditData] = useState(null); // <-- untuk modal edit

  const getSoal = async () => {
    try {
      const res = await Api.get(`/soal-tryout/${tryout.id_tryout}`);
      setSoal(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat soal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSoal();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-red-600 to-indigo-600 text-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold">Daftar Soal Tryout</h2>
            <p className="text-sm opacity-90 capitalize">{tryout.judul}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b">
          <div className="flex gap-3">
            <button
              onClick={() => setShowTambah(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              <FiPlus size={16} /> Tambah Soal
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              <FiUploadCloud size={16} /> Upload Soal
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Total Soal:{" "}
            <span className="font-semibold text-gray-800">{soal.length}</span>
          </p>
        </div>

        {/* Konten */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
              <div className="w-8 h-8 border-4 border-blue-600 border-dashed rounded-full animate-spin mb-3"></div>
              Memuat soal...
            </div>
          ) : soal.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-2">📄</div>
              Belum ada soal pada tryout ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {soal.map((s, i) => (
                <div
                  key={s.id_soaltryout}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative"
                >
                  {/* Tombol Edit */}
                  <button
                    onClick={() => setEditData(s)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition"
                  >
                    <FiEdit3 size={18} />
                  </button>

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-base leading-snug">
                      <span className="text-blue-600 font-bold mr-2">
                        {i + 1}.
                      </span>
                      {s.pertanyaan}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {[
                      { key: "A", text: s.pilihan_a },
                      { key: "B", text: s.pilihan_b },
                      { key: "C", text: s.pilihan_c },
                      { key: "D", text: s.pilihan_d },
                      { key: "E", text: s.pilihan_e },
                    ].map((p) => {
                      const isCorrect = s.jawaban_benar === p.key;
                      return (
                        <div
                          key={p.key}
                          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                            isCorrect
                              ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                          }`}
                        >
                          <span className="font-bold">{p.key}.</span>
                          <span>{p.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {s.pembahasan && (
                    <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <strong className="text-blue-700">Pembahasan:</strong>{" "}
                      {s.pembahasan}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Tambah, Upload, Edit */}
        {showTambah && (
          <TambahSoalModal
            idTryout={tryout.id_tryout}
            onClose={() => {
              setShowTambah(false);
              getSoal();
            }}
            onSuccess={getSoal}
          />
        )}

        {showUpload && (
          <UploadSoalModal
            idTryout={tryout.id_tryout}
            onClose={() => {
              setShowUpload(false);
              getSoal();
            }}
          />
        )}

        {editData && (
          <EditSoalModal
            data={editData}
            onClose={() => setEditData(null)}
            onSuccess={() => {
              setEditData(null);
              getSoal();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LihatSoalModal;
