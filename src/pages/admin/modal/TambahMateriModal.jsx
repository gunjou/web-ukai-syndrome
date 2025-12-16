// TambahMateriForm.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../../utils/Api";
import { toast } from "react-toastify";

const TambahMateriForm = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    id_modul: "",
    tipe_materi: "document",
    id_owner: null,
    judul: "", // ✅ judul materi tetap ada
    url_file: "",
    is_downloadable: null,
    visibility: "hold", // default visibility materi
  });

  const [loading, setLoading] = useState(false);
  const [modulOptions, setModulOptions] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);

  // Fetch modul aktif
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

  // ✅ Fetch mentor
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting form data:", formData);
    try {
      await Api.post("/materi/autogenerate-title", formData);
      toast.success(`Materi "${formData.judul}" berhasil ditambahkan!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Gagal tambah materi:", err);
      toast.error("Gagal menambahkan materi.");
    } finally {
      setLoading(false);
    }
  };

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Tambah Materi</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Modul (searchable dropdown) */}
        {/* 📅 Tanggal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tanggal
          </label>
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            required
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm"
          />
        </div>

        {/* Modul */}
        <div>
          <label className="block text-sm font-medium mb-1">Modul</label>
          <Select
            options={modulOptions.map((m) => ({
              value: m.id_modul,
              label: m.judul,
              deskripsi: m.deskripsi,
            }))}
            value={
              formData.id_modul
                ? modulOptions
                    .map((m) => ({
                      value: m.id_modul,
                      label: m.judul,
                      deskripsi: m.deskripsi,
                    }))
                    .find((opt) => opt.value === formData.id_modul)
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                id_modul: selected?.value || "",
                nama_modul: selected?.label || "", // simpan nama modul
              }))
            }
            placeholder="Pilih modul..."
            isClearable
            isSearchable
          />
        </div>

        {/* Nickname Mentor */}
        <div>
          <label className="block text-sm font-medium mb-1">Owner</label>
          <Select
            options={mentorOptions.map((m) => ({
              value: m.nickname,
              label: m.nama,
              id_user: m.id_user,
            }))}
            value={
              formData.nickname_mentor
                ? {
                    value: formData.nickname_mentor,
                    label: formData.nickname_mentor,
                  }
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                nickname_mentor: toTitleCase(selected?.value) || "",
                id_owner: selected?.id_user || null,
              }))
            }
            placeholder="Pilih mentor..."
            isClearable
            isSearchable
          />
        </div>

        {/* Jenis Materi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jenis Materi
          </label>
          <select
            name="tipe_materi"
            value={formData.tipe_materi}
            onChange={handleChange}
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm"
          >
            <option value="document">Document</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Tipe Video (muncul kalau tipe_materi = video) */}
        {formData.tipe_materi === "video" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipe Video
            </label>
            <select
              name="tipe_video"
              value={formData.tipe_video}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm"
            >
              <option value="">Pilih tipe video</option>
              <option value="full">Full</option>
              <option value="part_1">Part 1</option>
              <option value="part_2">Part 2</option>
              <option value="part_3">Part 3</option>
              <option value="terjeda">Terjeda</option>
            </select>
          </div>
        )}

        {/* Time (muncul kalau tipe_video = terjeda) */}
        {formData.tipe_video === "terjeda" &&
          formData.tipe_materi === "video" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Waktu (HH:MM)
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required={formData.tipe_video === "terjeda"}
                className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm"
              />
            </div>
          )}

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
            className="mt-1 block w-full border px-3 py-2 rounded-md shadow-sm"
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
            className={`mt-1 block w-full border font-semibold px-3 py-2 rounded-md shadow-sm
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

        {/* Downloadable Setting */}
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
          <p className="text-xs text-gray-500 mt-1">
            Jika dimatikan, tombol download tidak muncul di materi.
          </p>
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
                : "bg-blue-600 hover:bg-blue-700 text-white"
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
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahMateriForm;
