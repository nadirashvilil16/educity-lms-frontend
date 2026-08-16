import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user || location.pathname.startsWith("/student") || location.pathname.startsWith("/teacher")) return null;

  return (
    <nav className="navbar">
      <span className="navbar__brand">EduCity LMS</span>
      <div className="navbar__user">
        <span>
          {user.firstName} {user.lastName} · {user.role}
        </span>
        <button onClick={handleLogout}>გასვლა</button>
      </div>
    </nav>
  );
}
