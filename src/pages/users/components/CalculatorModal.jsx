import React, { useState } from "react";

const CalculatorModal = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [calcPos, setCalcPos] = useState({
    x: window.innerWidth / 2 - 150,
    y: 100,
  });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [calcSize, setCalcSize] = useState(300);

  const buttons = [
    ["sin", "cos", "tan", "π"],
    ["log", "ln", "√", "e"],
    ["(", ")", "^", "%"],
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "C", "+"],
    ["⌫", "="],
  ];

  const handlePress = (value) => {
    if (value === "C") return setInput("");
    if (value === "⌫") return setInput(input.slice(0, -1));

    if (value === "=") {
      try {
        const exp = input
          .replace(/π/g, Math.PI)
          .replace(/e/g, Math.E)
          .replace(/√/g, "Math.sqrt")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/log/g, "Math.log10")
          .replace(/ln/g, "Math.log")
          .replace(/\^/g, "**")
          .replace(/×/g, "*")
          .replace(/÷/g, "/");

        setInput(eval(exp).toString());
      } catch {
        setInput("Error");
      }
      return;
    }

    setInput((prev) => prev + value);
  };

  const handleMouseDown = (e) => {
    if (e.target.dataset.resize) setResizing(true);
    else {
      setDragging(true);
      setOffset({
        x: e.clientX - calcPos.x,
        y: e.clientY - calcPos.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setCalcPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }

    if (resizing) {
      setCalcSize(Math.max(250, e.clientX - calcPos.x));
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  return (
    <div
      className="absolute inset-0 bg-transparent z-[99999]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        style={{ left: calcPos.x, top: calcPos.y, width: calcSize }}
        className="absolute bg-[#1E1E1E] rounded-2xl p-4 shadow-xl border border-gray-700"
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-3 cursor-default">
          <span className="text-gray-300 text-sm font-semibold">
            Scientific Calculator
          </span>

          <button
            onClick={onClose}
            className="w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full transition"
            title="Close"
          />
        </div>

        {/* Display */}
        <div className="bg-black text-green-400 text-xl p-3 rounded mb-4 text-right min-h-[50px] font-mono border border-gray-600">
          {input || "0"}
        </div>

        {/* Buttons */}
        {buttons.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2">
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => handlePress(btn)}
                className={`p-3 rounded-lg font-bold transition active:scale-95 text-white
                  ${
                    btn === "="
                      ? "bg-green-600 hover:bg-green-700"
                      : btn === "C"
                      ? "bg-red-500 hover:bg-red-600"
                      : btn === "⌫"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }
                `}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}

        {/* Resize Handle */}
        <div
          data-resize
          onMouseDown={handleMouseDown}
          className="absolute bottom-2 right-2 w-4 h-4 bg-gray-400 opacity-60 cursor-se-resize rounded"
        />
      </div>
    </div>
  );
};

export default CalculatorModal;
