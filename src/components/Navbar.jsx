import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <span className="navbar__brand">EduCity LMS</span>
      {user && (
        <div className="navbar__user">
          <span>
            {user.firstName} {user.lastName} · {user.role}
          </span>
          <button onClick={handleLogout}>გასვლა</button>
        </div>
      )}
    </nav>
  );
}
