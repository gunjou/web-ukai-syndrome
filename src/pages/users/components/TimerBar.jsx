import React from "react";

const TimerBar = ({ timeLeft }) => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="font-semibold text-lg text-red-500">
      ⏱ {formatTime(timeLeft)}
    </div>
  );
};

export default TimerBar;
