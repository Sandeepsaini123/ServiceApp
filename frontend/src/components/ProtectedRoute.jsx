import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Redirects to /login if not authenticated
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Redirects to / if not admin
export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};
