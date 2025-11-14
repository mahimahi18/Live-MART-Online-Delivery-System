import { Navigate } from "react-router-dom";
// --- FIX START ---
// We don't need getAuth or app
// We just need the pre-initialized auth object from firebase.js
import { auth } from "../firebase";
// --- FIX END ---

const ProtectedRoute = ({ children, allowedRole, userRole }) => {
  // const auth = getAuth(app); // No longer needed
  const user = auth.currentUser; // 'auth' is now the direct import

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role
  if (allowedRole && userRole !== allowedRole)
    return <Navigate to="/" replace />; // Send to home if role doesn't match

  // If user is logged in AND (there's no role requirement OR the role matches), show the page
  return children;
};

export default ProtectedRoute;