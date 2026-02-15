import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  return localStorage.getItem("access")
    ? children
    : <Navigate to="/login" />;
}
