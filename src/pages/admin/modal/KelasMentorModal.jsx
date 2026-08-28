import { useEffect, useState, useMemo, useRef } from "react";
import { BsTrash3, BsPlus, BsSearch, BsX } from "react-icons/bs";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";
import { ConfirmToast } from "./ConfirmToast.jsx";
import AssignMentorModal from "./AssignMentorModal.jsx";

const KelasMentorModal = ({ idTarget, namaTarget, onRefresh }) => {
  const [mentorData, setMentorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Selected mentor untuk bulk delete
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllRef = useRef(null);

  const fetchMentor = async () => {
    if (!idTarget) return;

    setLoading(true);

    try {
      const res = await Api.get(`/paket-kelas/mentor/${idTarget}`);

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setMentorData(list);
      setSelectedIds([]);
    } catch (err) {
      console.error("Gagal fetch list mentor:", err);
      toast.error("Gagal memuat daftar mentor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTarget]);

  // =========================
  // FILTER
  // =========================
  const filteredData = useMemo(() => {
    return mentorData.filter((mentor) => {
      const keyword = searchTerm.toLowerCase();

      return (
        mentor.nama?.toLowerCase().includes(keyword) ||
        mentor.email?.toLowerCase().includes(keyword) ||
        mentor.no_hp?.toLowerCase().includes(keyword)
      );
    });
  }, [mentorData, searchTerm]);

  // =========================
  // SELECT
  // =========================
  const isAllFilteredSelected =
    filteredData.length > 0 &&
    filteredData.every((mentor) => selectedIds.includes(mentor.id_mentorkelas));

  const isIndeterminate = selectedIds.length > 0 && !isAllFilteredSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredData.map((mentor) => mentor.id_mentorkelas);

    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // =========================
  // DELETE SATU
  // =========================
  const handleDelete = (id_mentorkelas) => {
    ConfirmToast(`Yakin ingin menghapus mentor dari kelas ini?`, async () => {
      try {
        await Api.delete(`/paket-kelas/mentor/${id_mentorkelas}`);

        toast.success("Mentor berhasil dihapus dari kelas.");

        fetchMentor();
        onRefresh?.();
      } catch (err) {
        toast.error("Gagal menghapus mentor.");
        console.error(err);
      }
    });
  };

  // =========================
  // BULK DELETE
  // =========================
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn("Pilih minimal satu mentor.");
      return;
    }

    ConfirmToast(
      `Yakin ingin menghapus ${selectedIds.length} mentor terpilih dari kelas ini?`,
      async () => {
        try {
          await Promise.all(
            selectedIds.map((id) => Api.delete(`/paket-kelas/mentor/${id}`)),
          );

          toast.success(`${selectedIds.length} mentor berhasil dihapus.`);

          setSelectedIds([]);
          fetchMentor();
          onRefresh?.();
        } catch (err) {
          toast.error("Gagal menghapus beberapa mentor.");
          console.error(err);
        }
      },
    );
  };

  // =========================
  // ASSIGN MENTOR
  // =========================
  const handleSaveAssign = async (idMentorList) => {
    if (!idTarget) return;

    try {
      await Api.post(`/mentor-kelas/assign-mentor/${idTarget}`, {
        id_mentor: idMentorList,
      });
      console.log(idMentorList);

      toast.success("Mentor berhasil di-assign.");

      setShowAssignModal(false);

      fetchMentor();
      onRefresh?.();
    } catch (err) {
      toast.error("Gagal assign mentor.");
      console.error(err);
    }
  };

  // =========================
  // TITLE CASE
  // =========================
  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-bold">
          Daftar Mentor Kelas - {namaTarget}
        </h2>

        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <BsSearch className="absolute left-2.5 top-2.5 text-gray-400" />

          <input
            type="text"
            placeholder="Cari mentor..."
            className="pl-8 pr-3 py-2 border rounded-lg text-xs w-full outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>

          <p className="text-gray-500 text-xs mt-3">Memuat data mentor...</p>
        </div>
      ) : mentorData.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
          Belum ada mentor pada kelas ini.
        </div>
      ) : (
        <>
          {/* BULK ACTION BAR */}
          <div className="flex justify-between items-center mb-3 min-h-[40px]">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-3 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 w-full justify-between">
                <span className="text-xs font-bold text-red-700">
                  {selectedIds.length} mentor terpilih
                </span>

                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm"
                >
                  Hapus Terpilih
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-gray-400 font-medium italic">
                * Gunakan checkbox untuk menghapus banyak mentor
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-xl shadow-sm">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                <tr className="text-gray-600">
                  <th className="px-3 py-3 text-center w-10">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={isAllFilteredSelected}
                      onChange={handleSelectAllFiltered}
                      className="w-3.5 h-3.5"
                    />
                  </th>

                  <th className="px-3 py-3 text-center">No</th>

                  <th className="px-3 py-3 text-left">Nama</th>

                  <th className="px-3 py-3 text-left">Email</th>

                  <th className="px-3 py-3 text-left">No HP</th>

                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredData.map((mentor, index) => {
                  const id = mentor.id_mentorkelas;

                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={id}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? "bg-red-50" : "hover:bg-blue-50/30"
                      }`}
                      onClick={() => handleCheckboxChange(id)}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                        {toTitleCase(mentor.nama)}
                      </td>

                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                        {mentor.email}
                      </td>

                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                        {mentor.no_hp}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(id);
                          }}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <BsTrash3 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="py-10 text-center text-gray-400 italic">
                Mentor tidak ditemukan.
              </div>
            )}
          </div>
        </>
      )}

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-5">
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          Total: {filteredData.length} Mentor
        </p>

        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md transition-transform hover:scale-105"
        >
          <BsPlus size={18} />
          Assign Mentor
        </button>
      </div>

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <BsX size={24} />
            </button>

            <AssignMentorModal
              onClose={() => setShowAssignModal(false)}
              onSave={handleSaveAssign}
              excludedIds={mentorData.map((mentor) => mentor.id_user)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KelasMentorModal;
