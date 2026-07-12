import { useNavigate } from "react-router-dom";

const ROLES = [
  { role: "student", label: "სტუდენტის სივრცე" },
  { role: "teacher", label: "ლექტორის სივრცე" },
  { role: "parent", label: "მშობლის სივრცე" },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="hero__pills">
        {ROLES.map(({ role, label }) => (
          <button key={role} className="hero__pill" onClick={() => navigate("/login", { state: { role } })}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
