// EditMateriForm.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const EditMateriForm = ({ materi, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    id_materi: "",
    id_owner: "",
    id_modul: "",
    tipe_materi: "document",
    judul: "",
    url_file: "",
    visibility: "hold",
    is_downloadable: 0,
  });

  const [loading, setLoading] = useState(false);
  const [modulOptions, setModulOptions] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);

  // Load data materi ke form saat modal dibuka
  useEffect(() => {
    if (materi) {
      setFormData({
        id_materi: materi.id_materi || "",
        id_owner: materi.id_owner || "",
        id_modul: materi.id_modul || "",
        tipe_materi: materi.tipe_materi || "document",
        judul: materi.judul || "",
        url_file: materi.url_file || "",
        visibility: materi.visibility || "hold",
        is_downloadable: materi.is_downloadable || 0,
      });
    }
  }, [materi]);

  // Fetch modul
  useEffect(() => {
    const fetchModul = async () => {
      try {
        const res = await Api.get("/modul");
        setModulOptions(res.data.data);
      } catch (err) {
        console.error("Gagal fetch modul:", err);
        toast.error("Gagal mengambil data modul");
      }
    };
    fetchModul();
  }, []);

  // Fetch mentor
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await Api.get("/mentor/bio-mentor");
        // pastikan responsenya sesuai (misal array of mentor dengan field nickname)
        setMentorOptions(res.data.data);
      } catch (err) {
        console.error("Gagal fetch mentor:", err);
        toast.error("Gagal mengambil data mentor");
      }
    };
    fetchMentor();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // helper untuk update judul
  const updateJudul = (prevJudul, mentor, modul) => {
    // pecah judul jadi bagian-bagian dipisah "_"
    const parts = prevJudul ? prevJudul.split("_") : [];

    // pastikan minimal ada 4 bagian: tanggal, mentor, modul, part
    // kalau tidak lengkap, buat default
    if (parts.length < 4) {
      parts[0] = parts[0] || "Tanggal"; // manual input
      parts[1] = mentor || "Mentor";
      parts[2] = modul || "Modul";
      parts[3] = parts[3] || "";
    } else {
      if (mentor) parts[1] = mentor;
      if (modul) parts[2] = modul;
    }

    return parts.join("_");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await Api.put(
        `/materi/autogenerate-title/${formData.id_materi}`,
        formData
      );
      toast.success(`Materi "${formData.judul}" berhasil diperbarui!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Gagal update materi:", err);
      toast.error("Gagal memperbarui materi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Edit Materi</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Modul */}
        <label className="block text-sm font-medium text-gray-700">Modul</label>
        <Select
          options={modulOptions.map((m) => ({
            value: m.id_modul,
            label: m.judul,
          }))}
          value={
            formData.id_modul
              ? modulOptions
                  .map((m) => ({ value: m.id_modul, label: m.judul }))
                  .find((opt) => opt.value === formData.id_modul)
              : null
          }
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              id_modul: selected?.value || "",
              nama_modul: selected?.label || "",
              judul: updateJudul(
                prev.judul,
                prev.nickname_mentor,
                selected?.label
              ),
            }))
          }
          placeholder="Pilih modul..."
          isClearable
          isSearchable
        />

        {/* Mentor */}
        <label className="block text-sm font-medium text-gray-700">Owner</label>
        <Select
          options={mentorOptions.map((m) => ({
            value: m.nickname,
            label: m.nama,
            id_user: m.id_user,
          }))}
          value={
            formData.id_owner
              ? mentorOptions
                  .map((m) => ({
                    value: m.nickname,
                    label: m.nama,
                    id_user: m.id_user,
                  }))
                  .find((opt) => opt.id_user === formData.id_owner)
              : null
          }
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              nickname_mentor: selected?.value || "",
              id_owner: selected?.id_user || "",
              judul: updateJudul(prev.judul, selected?.value, prev.nama_modul),
            }))
          }
          placeholder="Pilih mentor owner..."
          isClearable
          isSearchable
        />

        {/* Judul Materi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Judul Materi
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, judul: e.target.value }))
            }
            required
            placeholder="Masukkan judul materi"
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* URL File */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL / File Path
          </label>
          <input
            type="text"
            name="url_file"
            value={formData.url_file}
            onChange={handleChange}
            required
            placeholder="https://example.com/file.pdf"
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visibility Materi
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className={`mt-1 block w-full border font-semibold px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${
                formData.visibility === "hold"
                  ? "text-yellow-600"
                  : formData.visibility === "open"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
          >
            <option value="hold">Hold</option>
            <option value="open">Open</option>
            <option value="close">Close</option>
          </select>
        </div>
        {/* Editable Downloadable Setting */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_downloadable === 1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_downloadable: e.target.checked ? 1 : 0,
                }))
              }
              className="w-5 h-5 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Izinkan pengguna mendownload file
            </span>
          </label>

          {/* Badge preview */}
          <div className="mt-2">
            {formData.is_downloadable === 1 ? (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600 border border-green-300">
                ✔ Download Allowed
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600 border border-red-300">
                ✖ Download Disabled
              </span>
            )}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-1 rounded-xl flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loading ? "Menyimpan..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMateriForm;
