import { useLocation, useNavigate } from "react-router-dom";

export function AuthLayout({ activeTab, subtitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;

  function goTo(tab) {
    navigate(tab === "login" ? "/login" : "/register", { state: { role } });
  }

  return (
    <div className="auth-page">
      <div className={`auth-card ${activeTab === "register" ? "auth-card--top" : ""}`}>
        <div className="auth-card__header">
          <h1>მოგესალმებით</h1>
          <p>{subtitle}</p>
        </div>

        <div className="auth-tabs">
          <button className={activeTab === "login" ? "is-active" : ""} onClick={() => goTo("login")}>
            ავტორიზაცია
          </button>
          <button className={activeTab === "register" ? "is-active" : ""} onClick={() => goTo("register")}>
            რეგისტრაცია
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
