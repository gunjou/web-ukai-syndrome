import { useEffect, useState, useMemo } from "react";
import { BsSearch } from "react-icons/bs";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const AssignMentorModal = ({ onClose, onSave, excludedIds = [] }) => {
  const [mentorList, setMentorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // =========================
  // FETCH SEMUA MENTOR
  // =========================
  const fetchMentor = async () => {
    setLoading(true);

    try {
      // Sesuaikan endpoint ini dengan endpoint list mentor Anda
      const res = await Api.get(`/mentor`);

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setMentorList(list);
    } catch (err) {
      console.error("Gagal fetch daftar mentor:", err);

      toast.error("Gagal memuat daftar mentor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
  }, []);

  // =========================
  // EXCLUDED MENTOR
  // =========================
  const excludedIdSet = useMemo(() => new Set(excludedIds), [excludedIds]);

  const availableMentor = useMemo(() => {
    return mentorList.filter((mentor) => !excludedIdSet.has(mentor.id_user));
  }, [mentorList, excludedIdSet]);

  // =========================
  // SEARCH
  // =========================
  const filteredMentor = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return availableMentor.filter((mentor) => {
      return (
        mentor.nama?.toLowerCase().includes(keyword) ||
        mentor.email?.toLowerCase().includes(keyword) ||
        mentor.no_hp?.toLowerCase().includes(keyword)
      );
    });
  }, [availableMentor, searchTerm]);

  // =========================
  // SELECT ALL
  // =========================
  const isAllSelected =
    filteredMentor.length > 0 &&
    filteredMentor.every((mentor) => selectedIds.includes(mentor.id_user));

  const handleSelectAll = () => {
    const ids = filteredMentor.map((mentor) => mentor.id_user);

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // =========================
  // TOGGLE
  // =========================
  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // =========================
  // SAVE
  // =========================
  const handleSave = async () => {
    if (selectedIds.length === 0) {
      toast.warn("Pilih minimal satu mentor.");
      return;
    }

    setSaving(true);

    try {
      await onSave(selectedIds);
    } finally {
      setSaving(false);
    }
  };

  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="flex flex-col max-h-[75vh]">
      <h2 className="text-lg font-bold mb-4">Assign Mentor</h2>

      {/* SEARCH */}
      <div className="relative mb-3">
        <BsSearch className="absolute left-2.5 top-2.5 text-gray-400" />

        <input
          type="text"
          placeholder="Cari nama, email, atau no HP..."
          className="pl-8 pr-3 py-2 border rounded-lg text-xs w-full outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* DATA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : filteredMentor.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
          Tidak ada mentor yang bisa di-assign.
        </div>
      ) : (
        <div className="overflow-y-auto border rounded-xl shadow-sm flex-1">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
              <tr className="text-gray-600">
                <th className="px-3 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5"
                  />
                </th>

                <th className="px-3 py-3 text-center">No</th>

                <th className="px-3 py-3 text-left">Nama</th>

                <th className="px-3 py-3 text-left">Email</th>

                <th className="px-3 py-3 text-left">No HP</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredMentor.map((mentor, index) => {
                const id = mentor.id_user;

                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50" : "hover:bg-blue-50/30"
                    }`}
                    onClick={() => handleToggle(id)}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-5">
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          {selectedIds.length} Mentor Terpilih
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMentorModal;
