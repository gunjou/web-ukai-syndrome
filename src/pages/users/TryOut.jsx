import React, { useState } from "react";
import { FiBookOpen } from "react-icons/fi";
import TryoutListContent from "./TryOutListContent";

const dummyTryouts = [
  { id: 1, judul: "Tryout 1 (Tester)" },
  { id: 2, judul: "Tryout 2 (Tester)" },
  { id: 3, judul: "Tryout 3 (Tester)" },
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
