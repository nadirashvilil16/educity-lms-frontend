import { useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { submitAssignment } from "../../services/student.service";

const WEEKDAYS = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"];
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
const menuItems = [
  { to: "/student", icon: "▦", label: "Dashboard", end: true },
  { to: "/student/assignments", icon: "◇", label: "ჩემი დავალებები" },
  { to: "/student/grades", icon: "♧", label: "ჩემი შეფასებები" },
];

const formatDate = (value) => value ? new Intl.DateTimeFormat("ka-GE").format(new Date(value)) : "არ არის მითითებული";
const formatTime = (value) => value ? new Intl.DateTimeFormat("ka-GE", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "--:--";
const dateKey = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

function EduCityLogo() {
  return <div className="student-brand"><img src="/assets/logos/educity-logo.svg" alt="EduCity" /></div>;
}

function ProfileIcon() {
  return <svg viewBox="0 0 88 88" aria-hidden="true"><circle cx="44" cy="44" r="36.7" /><circle cx="44" cy="32.5" r="11.5" /><path d="M19.3 67.1c5.2-10.4 14-15.6 24.7-15.6s19.5 5.2 24.7 15.6" /></svg>;
}

function EditIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.3 5.2 18.8 10.7M4 20h4.2L19 9.2a2.8 2.8 0 0 0-4-4L4.2 16 4 20Z" /><path d="M12 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5" /></svg>;
}

function buildMonthDays(activeDate, lectures) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayIndex);
  const eventDates = new Set(lectures.map((lecture) => dateKey(lecture.date)).filter(Boolean));
  const selectedKey = dateKey(activeDate);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    return { key, day: date.getDate(), muted: date.getMonth() !== month, event: eventDates.has(key), selected: key === selectedKey };
  });
}

function ProgressBar({ label, value, detail, tone = "yellow" }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return <div className="student-progress"><div className="student-progress__value">{safeValue}%</div><div className="student-progress__track"><span className={`is-${tone}`} style={{ width: `${safeValue}%` }} /></div><p>{label}: {safeValue}%.</p><small>{detail}</small></div>;
}

function Sidebar({ student, attendance, progress }) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
  return <aside className="student-sidebar">
    <EduCityLogo /><h2>ჩემი პროფილი</h2>
    <div className="student-profile">
      <button className="student-profile__edit" type="button" aria-label="პროფილის რედაქტირება"><EditIcon /></button>
      <div className="student-profile__avatar"><ProfileIcon /></div><strong>{fullName}</strong>
    </div>
    <nav className="student-menu" aria-label="სტუდენტის მენიუ">{menuItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}><span aria-hidden="true">{item.icon}</span>{item.label}</NavLink>)}</nav>
    <section className="student-progress-section"><h3>⌁ ჩემი პროგრესი</h3>
      <ProgressBar label="დასწრება" value={attendance.percentage} detail={`${attendance.attended}/${attendance.held} ჩატარებული ლექციიდან`} />
      <ProgressBar label="კურსის პროგრესი" value={progress.percentage} detail={`${progress.completed}/${progress.total} დავალება`} tone="orange" />
    </section>
  </aside>;
}

function CalendarCard({ lectures, nextLecture }) {
  const initialDate = nextLecture?.date ? new Date(nextLecture.date) : new Date();
  const [activeDate, setActiveDate] = useState(initialDate);
  const days = useMemo(() => buildMonthDays(activeDate, lectures), [activeDate, lectures]);
  const moveMonth = (offset) => setActiveDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));

  return <section className="student-card student-calendar">
    <header className="student-card__header"><h2>ლექციების კალენდარი <span aria-hidden="true">▦</span></h2><div className="calendar-switcher"><button onClick={() => moveMonth(-1)} aria-label="წინა თვე">‹</button><strong>{MONTHS[activeDate.getMonth()]} {activeDate.getFullYear()}</strong><button onClick={() => moveMonth(1)} aria-label="შემდეგი თვე">›</button></div></header>
    <div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-grid">{days.map((item) => <span key={item.key} className={`${item.muted ? "is-muted" : ""} ${item.event ? "has-event" : ""} ${item.selected ? "is-selected" : ""}`}>{item.day}</span>)}</div>
    <div className="calendar-legend"><span>● არჩეული დღე</span><span>● ლექციის დღე</span></div>
    <div className="next-lecture"><span><small>უახლოესი ლექცია</small><strong>{nextLecture ? `${nextLecture.title} — ${nextLecture.topic}` : "ლექცია დაგეგმილი არ არის"}</strong></span><b>{formatTime(nextLecture?.date)}</b></div>
  </section>;
}

function AssignmentCard({ assignment, recentGrade, onUploaded }) {
  const inputRef = useRef(null);
  const [upload, setUpload] = useState({ loading: false, error: null });

  async function handleFile(file) {
    if (!file || !assignment?.id) return;
    setUpload({ loading: true, error: null });
    try { await submitAssignment(assignment.id, file); setUpload({ loading: false, error: null }); onUploaded(); }
    catch (error) { setUpload({ loading: false, error }); }
  }

  return <section className="student-card student-deadline">
    <header className="student-card__header"><h2>მიმდინარე დავალება</h2><time>{formatDate(assignment?.dueDate)}</time></header>
    {assignment ? <article><h3>▱ {assignment.title}</h3><p><strong>აღწერა:</strong> {assignment.description}</p><p>⌛ <strong>deadline:</strong> {formatDate(assignment.dueDate)}</p>
      <input ref={inputRef} className="visually-hidden" type="file" onChange={(event) => handleFile(event.target.files?.[0])} />
      <button className="upload-file" disabled={upload.loading || Boolean(assignment.submission)} onClick={() => inputRef.current?.click()}>♧ {upload.loading ? "იტვირთება..." : assignment.submission ? "დავალება ჩაბარებულია" : "ატვირთე ფაილი"} <small>{assignment.allowedFileTypes.join(", ")}</small></button>
      {upload.error && <p className="dashboard-inline-error">ფაილი ვერ აიტვირთა. სცადეთ ხელახლა.</p>}
      <p className="status-line">◷ <strong>STATUS:</strong> {assignment.submission?.status || "ჩასაბარებელი"}</p></article> : <article><p>აქტიური დავალება არ არის.</p></article>}
    {recentGrade && <article className="lecture-task"><h3>▱ ბოლო შეფასება</h3><p>{recentGrade.title} <b>{recentGrade.submission.score}/10</b></p><button type="button">✓ ლექტორის კომენტარი</button></article>}
  </section>;
}

function TasksPanel({ tasks }) {
  return <section className="student-tasks"><aside><strong>▱ TASKS</strong><button>⊕ CREATE</button><button>✓ ALL TASKS</button><button>★ STARRED</button></aside><div className="student-tasks__list"><h3>MY TASKS</h3><button className="add-task">ADD TASK ＋</button><hr />
    {tasks.length ? tasks.map((task) => <label key={task._id || task.id || task.title}><input type="checkbox" checked={Boolean(task.completed)} readOnly /> {task.title}</label>) : <p className="student-tasks__empty">დავალებები ჯერ არ არის</p>}<small>⚑ COMPLETED</small>
  </div></section>;
}

function DashboardState({ message, onRetry }) {
  return <main className="student-dashboard-state"><div><EduCityLogo /><p>{message}</p>{onRetry && <button onClick={onRetry}>ხელახლა ცდა</button>}</div></main>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useStudentDashboard(user);
  if (loading && !data) return <DashboardState message="Dashboard იტვირთება..." />;
  if (error || !data) return <DashboardState message="Dashboard-ის მონაცემები ვერ ჩაიტვირთა." onRetry={retry} />;

  return <main className="student-dashboard"><Sidebar student={data.student} attendance={data.attendance} progress={data.progress} /><div className="student-dashboard__content">
    <header className="student-summary"><div><span className="summary-icon is-yellow">♧</span><p><strong>შემდეგი ლექცია:</strong><b>{data.nextLecture ? `${formatDate(data.nextLecture.date)} ${formatTime(data.nextLecture.date)}` : "დაგეგმილი არ არის"}</b></p></div><div><span className="summary-icon is-green">♧</span><p><strong>თემა:</strong>{data.nextLecture?.topic || "არ არის მითითებული"}</p></div><div><span className="summary-icon is-blue">▱</span><p><strong>დავალებები:</strong>{data.assignments.length} აქტიური ჩანაწერი</p></div></header>
    <div className="student-dashboard__workspace"><div className="student-dashboard__top"><CalendarCard lectures={data.lectures} nextLecture={data.nextLecture} /><AssignmentCard assignment={data.latestAssignment} recentGrade={data.recentGrade} onUploaded={retry} /></div><TasksPanel tasks={data.tasks} /></div>
  </div></main>;
}
