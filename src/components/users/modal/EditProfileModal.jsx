import React from "react";
import ModalMenu from "./ModalMenu";

const EditProfileModal = ({
  isOpen,
  onClose,
  editData,
  setEditData,
  handleSaveProfile,
  saving,
}) => {
  return (
    <ModalMenu isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form className="space-y-3" onSubmit={handleSaveProfile}>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Nama"
            className="w-full border px-3 py-2 rounded-lg"
            value={editData.nama}
            onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded-lg bg-gray-100"
            value={editData.email}
            disabled
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Nomor HP</label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="8123456789"
              className="w-full px-3 py-2 outline-none"
              value={editData.no_hp}
              onChange={(e) =>
                setEditData({ ...editData, no_hp: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={saving}
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </ModalMenu>
  );
};

export default EditProfileModal;
