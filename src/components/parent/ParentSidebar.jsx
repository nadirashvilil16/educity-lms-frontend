import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { EduCityLogo, SidebarAsset } from "../student/StudentSidebar";
import { listEnrollments, setSelectedGroupId } from "../../services/parent.service";

function ProfileIcon() {
  return <svg viewBox="0 0 88 88" aria-hidden="true">
    <defs><clipPath id="parent-profile-circle"><circle cx="44" cy="44" r="36.67" /></clipPath></defs>
    <circle cx="44" cy="44" r="36.67" />
    <circle cx="44" cy="34.64" r="12.03" />
    <path clipPath="url(#parent-profile-circle)" d="M19.29 80.67c2.73-15.31 11.01-24.08 24.71-24.08s21.98 8.77 24.71 24.08" />
  </svg>;
}

const menuItems = [
  { to: "/parent", icon: "category-2.svg", label: "Dashboard", end: true },
  { to: "/parent/attendance", icon: "diagram.svg", label: "დასწრება" },
  { to: "/parent/assignments", dir: "body", icon: "book-saved.svg", label: "დავალებები" },
  { to: "/parent/grades", dir: "body", icon: "book-saved-1.svg", label: "შეფასებები" },
];

function CourseSwitcher({ courseName }) {
  const [open, setOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    listEnrollments().then((data) => { setEnrollments(data); setLoaded(true); });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(groupId) {
    setSelectedGroupId(groupId);
    window.location.reload();
  }

  return (
    <div className="student-notifications" ref={wrapperRef}>
      <button type="button" className="student-menu__item student-notifications__trigger" onClick={() => setOpen((v) => !v)}>
        <SidebarAsset file="tag-right.svg" className="student-menu__icon" />კურსი: {courseName || "არ არის მითითებული"}
      </button>
      {open && (
        <div className="student-notifications__panel">
          {!loaded ? <p className="student-tasks__empty">იტვირთება...</p>
            : enrollments.length ? enrollments.map((e) => (
              <button type="button" key={e._id} className="student-notifications__row" onClick={() => handleSelect(e.groupId)}>
                <span>{e.courseName || "კურსი"}</span>
                <small>ჯგუფი: {e.groupName || "—"}</small>
              </button>
            )) : <p className="student-tasks__empty">კურსები ჯერ არ არის</p>}
        </div>
      )}
    </div>
  );
}

export function ParentSidebar({ childName, courseName }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return <aside className="student-sidebar">
    <EduCityLogo /><h2>შვილის პროფილი</h2>
    <div className="student-profile">
      <div className="student-profile__avatar"><ProfileIcon /></div>
      <strong><span>{childName || "სტუდენტი"}</span></strong>
    </div>
    <nav className="student-menu" aria-label="მშობლის მენიუ">
      {menuItems.map((item) => (
        <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}>
          <SidebarAsset file={item.icon} dir={item.dir} className="student-menu__icon" />{item.label}
        </NavLink>
      ))}
      <CourseSwitcher courseName={courseName} />
    </nav>
    <button type="button" className="sidebar-logout" onClick={() => { logout(); navigate("/login"); }}>გასვლა</button>
  </aside>;
}

export function ParentState({ message, onRetry }) {
  return <main className="student-dashboard-state"><div><EduCityLogo /><p>{message}</p>{onRetry && <button onClick={onRetry}>ხელახლა ცდა</button>}</div></main>;
}
