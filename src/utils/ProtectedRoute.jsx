import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Api from "../utils/Api";

const ProtectedRoute = ({ allow, children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isBatchActive, setIsBatchActive] = useState(null);

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    user = null;
  }

  useEffect(() => {
    const verifyStatus = async () => {
      // Jika user adalah peserta, kita wajib cek status batch ke server
      if (user && user.role === "peserta") {
        try {
          const res = await Api.get("/peserta-kelas/status-batch-peserta");
          setIsBatchActive(res.data.is_batch_active);
        } catch (err) {
          setIsBatchActive(0);
        }
      }
      setIsVerifying(false);
    };

    if (user) {
      verifyStatus();
    } else {
      setIsVerifying(false);
    }
  }, [user]);

  // 1. Loading state saat cek API
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Jika belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  // 3. PROTEKSI LANJUTAN PESERTA
  if (role === "peserta") {
    // Lolos hanya jika status === 1
    if (isBatchActive === 1) {
      return children;
    } else {
      // Jika 0 atau null, lempar ke home (landing page info)
      return <Navigate to="/home" replace />;
    }
  }

  // 4. Proteksi Admin / Mentor (Role Based)
  // if (!allow.includes(role)) {
  //   const fallback = role === "mentor" ? "/mentor-home" : "/admin-home";
  //   return <Navigate to={fallback} replace />;
  // }

  return children;
};

export default ProtectedRoute;
