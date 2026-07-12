import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>EduCity LMS</h1>
      <input type="email" placeholder="ელფოსტა" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input
        type="password"
        placeholder="პაროლი"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="form-error">{error}</p>}
      <button type="submit">შესვლა</button>
    </form>
  );
}
