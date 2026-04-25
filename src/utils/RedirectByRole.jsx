import { Navigate } from "react-router-dom";

export default function RedirectByRole() {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user) return <Navigate to="/login" />;

  if (user.role === "admin") return <Navigate to="/admin-home" />;
  if (user.role === "mentor") return <Navigate to="/mentor-home" />;
  if (user.role === "peserta") return <Navigate to="/dashboard/materi" />;

  return <Navigate to="/login" />;
}
