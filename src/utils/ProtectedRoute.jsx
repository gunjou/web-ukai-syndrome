import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allow, children }) => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user) {
    // belum login
    return <Navigate to="/" replace />;
  }

  const nickname = user.nickname;

  // allow = ["superadmin", "tryout"]
  if (!allow.includes(nickname)) {
    return <Navigate to="/admin-home" replace />;
  }

  return children;
};

export default ProtectedRoute;
