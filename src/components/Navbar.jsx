import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) return null; // no chrome on the landing/login/register pages

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
