import { useEffect } from "react";

const useAntiInspect = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return; // kalau tidak aktif, jangan pasang listener

    // Disable klik kanan
    const handleContextMenu = (e) => e.preventDefault();

    // Disable shortcut DevTools
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey; // metaKey = ⌘ (Command)

      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }

      // Ctrl/Cmd + Shift + I, J, C
      if (
        ctrlOrCmd &&
        e.shiftKey &&
        ["I", "J", "C"].includes(e.key.toUpperCase())
      ) {
        e.preventDefault();
      }

      // Ctrl/Cmd + U (View Source)
      if (ctrlOrCmd && e.key.toUpperCase() === "U") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
};

export default useAntiInspect;
