import { toast } from "react-toastify";

export const ConfirmToast = (message, onConfirm, onCancel) => {
  const toastId = toast(
    ({ closeToast }) => (
      <div className="relative z-[9999] flex flex-col gap-2 bg-white">
        <p>{message}</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await onConfirm?.();
              closeToast();
              removeBackdrop();
            }}
            className="bg-red-500 text-white px-3 py-1 "
          >
            Ya
          </button>
          <button
            onClick={() => {
              onCancel?.();
              closeToast();
              removeBackdrop();
            }}
            className="bg-gray-300 text-gray-800 px-3 py-1 "
          >
            Batal
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false }
  );

  const backdrop = document.createElement("div");
  backdrop.className = "fixed inset-0 bg-black/40 z-[9998]";
  backdrop.onclick = () => {
    toast.dismiss(toastId);
    removeBackdrop();
    onCancel?.();
  };
  document.body.appendChild(backdrop);

  function removeBackdrop() {
    backdrop.remove();
  }
};
