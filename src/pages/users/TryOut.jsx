// src/pages/users/TryOut.jsx
import React, { useState } from "react";
import { FiBookOpen } from "react-icons/fi"; // ✅ icon
import TryoutListContent from "./TryOutListContent";

const dummyTryouts = [
  { id: 1, judul: "Tryout Matematika" },
  { id: 2, judul: "Tryout Bahasa Indonesia" },
  { id: 3, judul: "Tryout IPA" },
];

const Tryout = () => {
  const [selectedTryout, setSelectedTryout] = useState(null);

  if (selectedTryout) {
    return (
      <TryoutListContent
        tryout={selectedTryout}
        onBack={() => setSelectedTryout(null)}
      />
    );
  }

  return (
    <div className="bg-gray-100 w-full h-auto p-6 rounded-[20px] shadow">
      <h1 className="text-2xl font-semibold mb-4">Daftar Tryout</h1>
      <div className="space-y-3">
        {dummyTryouts.map((to) => (
          <div
            key={to.id}
            className="p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition flex items-center gap-3"
            onClick={() => setSelectedTryout(to)}
          >
            <FiBookOpen className="text-red-500 text-xl" />{" "}
            <span className="text-md font-medium">{to.judul}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tryout;
