import { useEffect } from "react";

const useAntiInspect = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleContextMenu = (event) => event.preventDefault();
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrCommand = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toUpperCase();

      if (
        event.key === "F12" ||
        (ctrlOrCommand && event.shiftKey && ["I", "J", "C"].includes(key)) ||
        (ctrlOrCommand && key === "U")
      ) {
        event.preventDefault();
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
