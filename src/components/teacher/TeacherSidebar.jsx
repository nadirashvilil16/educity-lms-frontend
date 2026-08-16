import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { EduCityLogo, SidebarAsset } from "../student/StudentSidebar";

function ProfileIcon() {
  return <svg viewBox="0 0 88 88" aria-hidden="true">
    <defs><clipPath id="teacher-profile-circle"><circle cx="44" cy="44" r="36.67" /></clipPath></defs>
    <circle cx="44" cy="44" r="36.67" />
    <circle cx="44" cy="34.64" r="12.03" />
    <path clipPath="url(#teacher-profile-circle)" d="M19.29 80.67c2.73-15.31 11.01-24.08 24.71-24.08s21.98 8.77 24.71 24.08" />
  </svg>;
}

const menuItems = [
  { to: "/teacher", icon: "category-2.svg", label: "Dashboard", end: true },
  { to: "/teacher/assignments", dir: "body", icon: "book-saved.svg", label: "დავალებები" },
];

export function TeacherSidebar({ teacher, groupCount, pendingGradingCount }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return <aside className="student-sidebar">
    <EduCityLogo /><h2>ჩემი პროფილი</h2>
    <div className="student-profile">
      <div className="student-profile__avatar"><ProfileIcon /></div>
      <strong><span>{teacher.firstName}</span><span>{teacher.lastName}</span></strong>
    </div>
    <nav className="student-menu" aria-label="ლექტორის მენიუ">
      {menuItems.map((item) => (
        <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}>
          <SidebarAsset file={item.icon} dir={item.dir} className="student-menu__icon" />{item.label}
        </NavLink>
      ))}
      <NavLink to="/teacher" end className={({ isActive }) => isActive ? "is-active" : ""}><SidebarAsset file="people.svg" className="student-menu__icon" />ჯგუფები: {groupCount}</NavLink>
      <NavLink to="/teacher/assignments" className={({ isActive }) => isActive ? "is-active" : ""}><SidebarAsset file="tag-right.svg" className="student-menu__icon" />შესამოწმებელი: {pendingGradingCount}</NavLink>
    </nav>
    <button type="button" className="sidebar-logout" onClick={() => { logout(); navigate("/login"); }}>გასვლა</button>
  </aside>;
}

export function TeacherState({ message, onRetry }) {
  return <main className="student-dashboard-state"><div><EduCityLogo /><p>{message}</p>{onRetry && <button onClick={onRetry}>ხელახლა ცდა</button>}</div></main>;
}
