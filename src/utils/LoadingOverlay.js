import React from "react";

const LoadingOverlay = () => {
  return (
    // Komponen Loading Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingOverlay;
