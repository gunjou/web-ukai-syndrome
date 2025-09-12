import { toast } from "react-toastify";

export const ConfirmToast = (message, onConfirm, onCancel) => {
  let isLoading = false;

  const toastId = toast(
    ({ closeToast }) => {
      return (
        <div className="relative z-[9999] flex flex-col gap-2 bg-white">
          <p>{message}</p>
          <div className="flex gap-2">
            <button
              disabled={isLoading}
              onClick={async () => {
                if (isLoading) return;
                isLoading = true;

                // update tampilan toast → biar spinner muncul
                toast.update(toastId, {
                  render: ({ closeToast }) => (
                    <div className="relative z-[9999] flex flex-col gap-2 bg-white">
                      <p>{message}</p>
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="flex items-center gap-2 bg-red-500 rounded-lg text-white px-3 py-1 cursor-not-allowed opacity-80"
                        >
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
                          Memproses...
                        </button>
                        <button
                          onClick={() => {
                            onCancel?.();
                            closeToast();
                            removeBackdrop();
                          }}
                          className="bg-gray-300 rounded-lg text-gray-800 px-3 py-1"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ),
                });

                try {
                  await onConfirm?.();
                  closeToast();
                  removeBackdrop();
                } catch (err) {
                  console.error("Confirm error:", err);
                  toast.error("Terjadi kesalahan");
                  closeToast();
                  removeBackdrop();
                }
              }}
              className="bg-red-500 rounded-lg text-white px-3 py-1"
            >
              Ya
            </button>
            <button
              onClick={() => {
                onCancel?.();
                closeToast();
                removeBackdrop();
              }}
              className="bg-gray-300 rounded-lg text-gray-800 px-3 py-1"
            >
              Batal
            </button>
          </div>
        </div>
      );
    },
    { autoClose: false, closeOnClick: false }
  );

  // backdrop
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
