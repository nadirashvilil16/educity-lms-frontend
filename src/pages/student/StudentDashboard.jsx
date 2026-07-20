import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

const menuItems = [
  { to: "/student", icon: "▦", label: "Dashboard", end: true },
  { to: "/student/assignments", icon: "◇", label: "კურსი: UI/UX დიზაინი" },
  { to: "/student/grades", icon: "♧", label: "ქულები: მოკლე" },
  { to: "/student/assignments", icon: "▱", label: "შეტყობინებები" },
  { to: "/student/grades", icon: "⌘", label: "ფინანსები" },
];

const calendarDays = [
  { day: 29, muted: true }, { day: 30, muted: true }, { day: 1, event: true }, { day: 2 }, { day: 3, event: true }, { day: 4 }, { day: 5 },
  { day: 6 }, { day: 7, event: true }, { day: 8 }, { day: 9, event: true }, { day: 10 }, { day: 11 }, { day: 12 },
  { day: 13 }, { day: 14, event: true }, { day: 15 }, { day: 16 }, { day: 17, selected: true }, { day: 18 }, { day: 19 },
  { day: 20 }, { day: 21, event: true }, { day: 22 }, { day: 23, event: true }, { day: 24 }, { day: 25 }, { day: 26 },
  { day: 27 }, { day: 28, event: true }, { day: 29 }, { day: 30, event: true }, { day: 31 },
];

function ProgressBar({ label, value, detail, tone = "yellow" }) {
  return (
    <div className="student-progress">
      <div className="student-progress__value">{value}%</div>
      <div className="student-progress__track"><span className={`is-${tone}`} style={{ width: `${value}%` }} /></div>
      <p>{label}: {value}%.</p>
      <small>{detail}</small>
    </div>
  );
}

function Sidebar({ user, attendance, progress }) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "ანა აბაშიძე";

  return (
    <aside className="student-sidebar">
      <div className="student-brand">EduCity</div>
      <h2>ჩემი პროფილი</h2>
      <div className="student-profile">
        <div className="student-profile__avatar" aria-hidden="true">♙</div>
        <strong>{fullName}</strong>
      </div>
      <nav className="student-menu" aria-label="სტუდენტის მენიუ">
        {menuItems.map((item, index) => (
          <NavLink key={`${item.to}-${index}`} to={item.to} end={item.end} className={({ isActive }) => isActive && index === 0 ? "is-active" : ""}>
            <span aria-hidden="true">{item.icon}</span>{item.label}
          </NavLink>
        ))}
      </nav>
      <section className="student-progress-section">
        <h3>⌁ ჩემი პროგრესი</h3>
        <ProgressBar label="დასწრება" value={attendance} detail="(ჩატარებული ლექციებიდან)" />
        <ProgressBar label="კურსის პროგრესი" value={progress} detail="(შესრულებული დავალებებიდან)" tone="orange" />
      </section>
    </aside>
  );
}

function CalendarCard() {
  return (
    <section className="student-card student-calendar">
      <header className="student-card__header">
        <h2>ლექციების კალენდარი <span aria-hidden="true">▦</span></h2>
        <div className="calendar-switcher"><button aria-label="წინა თვე">‹</button><strong>ივლისი 2026</strong><button aria-label="შემდეგი თვე">›</button></div>
      </header>
      <div className="calendar-weekdays">{["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {calendarDays.map((item, index) => <span key={index} className={`${item.muted ? "is-muted" : ""} ${item.event ? "has-event" : ""} ${item.selected ? "is-selected" : ""}`}>{item.day}</span>)}
      </div>
      <div className="calendar-legend"><span>● დღეს</span><span>● ლექციის დღე</span></div>
      <div className="next-lecture"><span><small>უახლოესი ლექცია</small><strong>UI/UX დიზაინი — მობილური აპლიკაცია</strong></span><b>17:00</b></div>
    </section>
  );
}

function AssignmentCard() {
  return (
    <section className="student-card student-deadline">
      <header className="student-card__header"><h2>წინა ლექცია</h2><time>14.07.2026</time></header>
      <article>
        <h3>▱ დავალება #5: dashboard UX wireframe</h3>
        <p><strong>აღწერა:</strong> შექმენით სტუდენტის დემო-გვერდის სტრუქტურა</p>
        <p>⌛ <strong>deadline:</strong> 21.07.2026</p>
        <div className="upload-file">♧ ატვირთე ფაილი <small>PDF, PNG, DRIVE</small></div>
        <p className="status-line">◷ <strong>STATUS:</strong> მიმდინარე / ჩასაბარებელი</p>
      </article>
      <article className="lecture-task">
        <h3>▱ წინა დავალების შეფასება</h3>
        <p>დავალება #6: “Color Palette &amp; Typography” <b>8/10</b></p>
        <button>✓ გახსენი ლექტორის კომენტარი</button>
      </article>
    </section>
  );
}

function TasksPanel() {
  return (
    <section className="student-tasks">
      <aside>
        <strong>▱ TASKS</strong><button>⊕ CREATE</button><button>✓ ALL TASKS</button><button>★ STARRED</button>
      </aside>
      <div className="student-tasks__list">
        <h3>MY TASKS</h3><button className="add-task">ADD TASK ＋</button><hr />
        <label><input type="checkbox" /> RAGHAC TASKI</label>
        <label><input type="checkbox" defaultChecked /> RAGHAC TASKI</label>
        <small>⚑ COMPLETED</small>
      </div>
    </section>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/student/dashboard").then((res) => active && setData(res.data)).catch(() => active && setData({}));
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => ({
    attendance: Math.round(data?.attendance?.percentage ?? 87.5),
    progress: Math.round(data?.progress?.percentage ?? 66),
  }), [data]);

  return (
    <main className="student-dashboard">
      <Sidebar user={user} {...stats} />
      <div className="student-dashboard__content">
        <header className="student-summary">
          <div><span className="summary-icon is-yellow">♧</span><p><strong>შემდეგი ლექცია:</strong><b>დღეს 17:00</b></p></div>
          <div><span className="summary-icon is-green">♧</span><p><strong>თემა:</strong> აპლიკაციის<br />ინტერაქციული დიზაინი</p></div>
          <div><span className="summary-icon is-blue">▱</span><p><strong>დავალებების პანელი</strong></p></div>
        </header>
        <div className="student-dashboard__workspace">
          <div className="student-dashboard__top"><CalendarCard /><AssignmentCard /></div>
          <TasksPanel />
        </div>
      </div>
    </main>
  );
}
