import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { DateInput } from "../components/DateInput";
import { SocialButtons } from "../components/SocialButtons";
import { GEORGIA_REGIONS } from "../constants/regions";

const DASHBOARD_BY_ROLE = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  region: "",
  birthDate: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const role = location.state?.role || "student";

  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("გთხოვთ დაეთანხმოთ წესებსა და პირობებს");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("პაროლები არ ემთხვევა ერთმანეთს");
      return;
    }

    const [firstName, ...rest] = form.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ") || firstName;

    try {
      const { data } = await api.post("/auth/register", {
        role,
        firstName,
        lastName,
        email: form.email,
        phone: form.phone,
        region: form.region,
        birthDate: form.birthDate || undefined,
        password: form.password,
      });
      setSession(data.token, data.user);
      navigate(DASHBOARD_BY_ROLE[data.user.role] || "/login");
    } catch (err) {
      setError(err.response?.data?.message || "რეგისტრაცია ვერ მოხერხდა");
    }
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  return (
    <AuthLayout
      activeTab="register"
      subtitle="გთხოვთ გაიაროთ რეგისტრაცია, თუ არ გაქვთ ანგარიში გაიარეთ რეგისტრაცია რათა ისარგებლოთ ჩვენი სერვისებით"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input">
          <input placeholder="სახელი/გვარი" value={form.fullName} onChange={update("fullName")} required />
        </div>

        <div className="auth-input">
          <input type="email" placeholder="ელ ფოსტა" value={form.email} onChange={update("email")} required />
        </div>

        <div className="auth-input">
          <input placeholder="ტელეფონის ნომერი" value={form.phone} onChange={update("phone")} required />
        </div>

        <div className="auth-input">
          <select value={form.region} onChange={update("region")} required>
            <option value="" disabled>
              რეგიონი
            </option>
            {GEORGIA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-input">
          <DateInput placeholder="დაბადების თარიღი" value={form.birthDate} onChange={update("birthDate")} />
        </div>

        <PasswordInput value={form.password} onChange={update("password")} placeholder="პაროლი" />
        <PasswordInput
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          placeholder="დაადასტურეთ პაროლი"
        />

        <div className="auth-form__hints">
          <span className={hasUppercase ? "is-met" : ""}>მინ. 1 დიდი ასო A</span>
          <span className={hasLowercase ? "is-met" : ""}>მინ. 1 პატარა ასო a</span>
        </div>

        <label className="auth-form__agree">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          გაეცანი და ვეთანხმები წესებსა და პირობებს
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="auth-form__submit">
          რეგისტრაცია
        </button>

        <div className="auth-divider">
          <span>ან</span>
        </div>

        <SocialButtons />
      </form>
    </AuthLayout>
  );
}
