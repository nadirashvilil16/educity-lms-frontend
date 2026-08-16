import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/student.service";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export function EduCityLogo() {
  return <div className="student-brand"><img src="/assets/logos/educity-logo.svg" alt="EduCity" /></div>;
}

function ProfileIcon() {
  return <svg viewBox="0 0 88 88" aria-hidden="true">
    <defs><clipPath id="student-profile-circle"><circle cx="44" cy="44" r="36.67" /></clipPath></defs>
    <circle cx="44" cy="44" r="36.67" />
    <circle cx="44" cy="34.64" r="12.03" />
    <path clipPath="url(#student-profile-circle)" d="M19.29 80.67c2.73-15.31 11.01-24.08 24.71-24.08s21.98 8.77 24.71 24.08" />
  </svg>;
}

export function SidebarAsset({ file, dir = "sidebar", className = "" }) {
  return <img className={className} src={`/assets/icons/${dir}/${file}`} alt="" aria-hidden="true" />;
}

function buildMenuItems(student) {
  return [
    { to: "/student", icon: "category-2.svg", label: "Dashboard", end: true },
    { icon: "tag-right.svg", label: `კურსი: ${student.courseName || "არ არის მითითებული"}` },
    { icon: "people.svg", label: `ჯგუფი: ${student.groupName || "არ არის მითითებული"}` },
    { icon: "messages.svg", label: "შეტყობინებები" },
    { icon: "card-coin.svg", label: "ფინანსები" },
  ];
}

function ProgressBar({ label, value, detail, tone = "yellow" }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return <div className="student-progress"><div className="student-progress__value">{safeValue}%</div><div className="student-progress__track"><span className={`is-${tone}`} style={{ width: `${safeValue}%` }} /></div><p>{label}: {safeValue}%.</p><small>{detail}</small></div>;
}

function ProfileEditModal({ student, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(student.firstName || "");
  const [lastName, setLastName] = useState(student.lastName || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [state, setState] = useState({ saving: false, error: null });
  const fileRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ saving: true, error: null });
    try {
      await updateProfile({ firstName, lastName, avatar: avatarFile });
      setState({ saving: false, error: null });
      onSaved();
      onClose();
    } catch (error) {
      setState({ saving: false, error });
    }
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <form className="profile-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>პროფილის რედაქტირება</h3>
        <label>
          სახელი
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          გვარი
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        <label>
          ფოტო
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
        </label>
        {state.error && <p className="dashboard-inline-error">ვერ შეინახა. სცადეთ ხელახლა.</p>}
        <div className="profile-modal__actions">
          <button type="button" onClick={onClose} disabled={state.saving}>გაუქმება</button>
          <button type="submit" disabled={state.saving}>{state.saving ? "ინახება..." : "შენახვა"}</button>
        </div>
      </form>
    </div>
  );
}

export function StudentSidebar({ student, attendance, progress, onProfileUpdated }) {
  const menuItems = buildMenuItems(student);
  const [editing, setEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const avatarSrc = student.avatarUrl
    ? (student.avatarUrl.startsWith("http") ? student.avatarUrl : `${API_ORIGIN}${student.avatarUrl}`)
    : null;

  return <aside className="student-sidebar">
    <EduCityLogo /><h2>ჩემი პროფილი</h2>
    <div className="student-profile">
      <button className="student-profile__edit" type="button" aria-label="პროფილის რედაქტირება" onClick={() => setEditing(true)}><SidebarAsset file="edit.svg" /></button>
      <div className="student-profile__avatar">{avatarSrc ? <img src={avatarSrc} alt="" /> : <ProfileIcon />}</div>
      <strong><span>{student.firstName}</span><span>{student.lastName}</span></strong>
    </div>
    {editing && <ProfileEditModal student={student} onClose={() => setEditing(false)} onSaved={() => onProfileUpdated?.()} />}
    <nav className="student-menu" aria-label="სტუდენტის მენიუ">{menuItems.map((item) => item.to
      ? <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}><SidebarAsset file={item.icon} dir={item.dir} className="student-menu__icon" />{item.label}</NavLink>
      : <span className="student-menu__item" key={item.label}><SidebarAsset file={item.icon} dir={item.dir} className="student-menu__icon" />{item.label}</span>)}</nav>
    <section className="student-progress-section"><h3><SidebarAsset file="diagram.svg" /> ჩემი პროგრესი</h3>
      <ProgressBar label="დასწრება" value={attendance.percentage} detail={`(ჩატარებული ${attendance.attended}/${attendance.held})`} />
      <ProgressBar label="კურსის პროგრესი" value={progress.percentage} detail={`(ჩატარდა ${progress.completed}/${progress.total} ლექციიდან)`} tone="orange" />
    </section>
    <button type="button" className="sidebar-logout" onClick={() => { logout(); navigate("/login"); }}>გასვლა</button>
  </aside>;
}

export function StudentState({ message, onRetry }) {
  return <main className="student-dashboard-state"><div><EduCityLogo /><p>{message}</p>{onRetry && <button onClick={onRetry}>ხელახლა ცდა</button>}</div></main>;
}
