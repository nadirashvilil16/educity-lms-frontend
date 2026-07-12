import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { SocialButtons } from "../components/SocialButtons";

const DASHBOARD_BY_ROLE = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
  admin: "/admin",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(DASHBOARD_BY_ROLE[user.role] || "/login");
    } catch {
      setError("ელფოსტა ან პაროლი არასწორია");
    }
  }

  return (
    <AuthLayout
      activeTab="login"
      subtitle="გთხოვთ გაიაროთ ავტორიზაცია, თუ არ გაქვთ ანგარიში გაიარეთ რეგისტრაცია, რათა ისარგებლოთ ჩვენი სერვისებით"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input">
          <input
            type="email"
            placeholder="ელ. ფოსტა"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="პაროლი" />

        <button type="button" className="auth-form__forgot">
          დაგავიწყდათ პაროლი?
        </button>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="auth-form__submit">
          ავტორიზაცია
        </button>

        <div className="auth-divider">
          <span>ან</span>
        </div>

        <SocialButtons />
      </form>
    </AuthLayout>
  );
}
