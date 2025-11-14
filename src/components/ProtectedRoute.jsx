import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import app from "../firebase";

const ProtectedRoute = ({ children, allowedRole, userRole }) => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role
  if (allowedRole && userRole !== allowedRole)
    return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
