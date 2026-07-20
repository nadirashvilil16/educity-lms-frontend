import { useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { submitAssignment } from "../../services/student.service";

const WEEKDAYS = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"];
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
const menuItems = [
  { to: "/student", icon: "category-2.svg", label: "Dashboard", end: true },
  { icon: "tag-right.svg", label: "კურსი: UI/UX დიზაინი" },
  { icon: "people.svg", label: "ჯგუფი: მეორე" },
  { icon: "messages.svg", label: "შეტყობინებები" },
  { icon: "card-coin.svg", label: "ფინანსები" },
];

const formatDate = (value) => {
  if (!value) return "არ არის მითითებული";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "არ არის მითითებული";
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()].map((part, index) => index < 2 ? String(part).padStart(2, "0") : part).join(".");
};
const formatTime = (value) => value ? new Intl.DateTimeFormat("ka-GE", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "--:--";
const formatLectureDay = (value) => {
  if (!value) return "დაგეგმილი არ არის";
  const date = new Date(value);
  const today = new Date();
  const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  return isToday ? "დღეს" : formatDate(value);
};
const dateKey = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

function EduCityLogo() {
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

function SidebarAsset({ file, className = "" }) {
  return <img className={className} src={`/assets/icons/sidebar/${file}`} alt="" aria-hidden="true" />;
}

function HeaderAsset({ file }) {
  return <img className="student-summary__icon" src={`/assets/icons/header/${file}`} alt="" aria-hidden="true" />;
}

function BodyAsset({ file, className = "" }) {
  return <img className={className} src={`/assets/icons/body/${file}`} alt="" aria-hidden="true" />;
}

function FooterAsset({ file, className = "" }) {
  return <img className={className} src={`/assets/icons/footer/${file}`} alt="" aria-hidden="true" />;
}

function TopicSummary({ topic }) {
  if (topic === "აპლიკაციის ინტერფეისი დიზაინი") {
    return <p><span className="student-summary__topic-line"><strong>თემა:</strong> აპლიკაციის</span><span className="student-summary__topic-line">ინტერფეისი დიზაინი</span></p>;
  }
  return <p><strong>თემა:</strong> <span>{topic || "არ არის მითითებული"}</span></p>;
}

function buildMonthDays(activeDate, lectures) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayIndex);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((mondayIndex + daysInMonth) / 7) * 7;
  const eventDates = new Set(lectures.map((lecture) => dateKey(lecture.date)).filter(Boolean));
  const selectedKey = dateKey(activeDate);

  return Array.from({ length: cellCount }, (_, index) => {
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
  return <aside className="student-sidebar">
    <EduCityLogo /><h2>ჩემი პროფილი</h2>
    <div className="student-profile">
      <button className="student-profile__edit" type="button" aria-label="პროფილის რედაქტირება"><SidebarAsset file="edit.svg" /></button>
      <div className="student-profile__avatar"><ProfileIcon /></div>
      <strong><span>{student.firstName}</span><span>{student.lastName}</span></strong>
    </div>
    <nav className="student-menu" aria-label="სტუდენტის მენიუ">{menuItems.map((item) => item.to
      ? <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}><SidebarAsset file={item.icon} className="student-menu__icon" />{item.label}</NavLink>
      : <span className="student-menu__item" key={item.label}><SidebarAsset file={item.icon} className="student-menu__icon" />{item.label}</span>)}</nav>
    <section className="student-progress-section"><h3><SidebarAsset file="diagram.svg" /> ჩემი პროგრესი</h3>
      <ProgressBar label="დასწრება" value={attendance.percentage} detail={`(ჩატარებული ${attendance.attended}/${attendance.held})`} />
      <ProgressBar label="კურსის პროგრესი" value={progress.percentage} detail={`(ჩატარდა ${progress.completed}/${progress.total} ლექციიდან)`} tone="orange" />
    </section>
  </aside>;
}

function CalendarCard({ lectures, nextLecture }) {
  const initialDate = nextLecture?.date ? new Date(nextLecture.date) : new Date();
  const [activeDate, setActiveDate] = useState(initialDate);
  const days = useMemo(() => buildMonthDays(activeDate, lectures), [activeDate, lectures]);
  const moveMonth = (offset) => setActiveDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));

  return <section className="student-card student-calendar">
    <header className="student-card__header"><h2>ლექციების კალენდარი <BodyAsset file="calendar.svg" className="student-calendar__title-icon" /></h2><div className="calendar-switcher"><button onClick={() => moveMonth(-1)} aria-label="წინა თვე">‹</button><strong>{MONTHS[activeDate.getMonth()]} {activeDate.getFullYear()}</strong><button onClick={() => moveMonth(1)} aria-label="შემდეგი თვე">›</button></div></header>
    <div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-grid">{days.map((item) => <span key={item.key} className={`${item.muted ? "is-muted" : ""} ${item.event ? "has-event" : ""} ${item.selected ? "is-selected" : ""}`}>{item.day}</span>)}</div>
    <div className="calendar-legend"><span>● არჩეული დღე</span><span>● ლექციის დღე</span></div>
    <div className="next-lecture"><span><small>უახლოესი ლექცია</small><strong>{nextLecture ? `${nextLecture.title} — ${nextLecture.topic}` : "ლექცია დაგეგმილი არ არის"}</strong></span><b>{formatTime(nextLecture?.date)}</b></div>
  </section>;
}

function AssignmentCard({ assignment, recentGrade, previousLectureDate, onUploaded }) {
  const inputRef = useRef(null);
  const [upload, setUpload] = useState({ loading: false, error: null });

  async function handleFile(file) {
    if (!file || !assignment?.id) return;
    setUpload({ loading: true, error: null });
    try { await submitAssignment(assignment.id, file); setUpload({ loading: false, error: null }); onUploaded(); }
    catch (error) { setUpload({ loading: false, error }); }
  }

  return <section className="student-card student-deadline">
    <header className="student-card__header"><h2>წინა ლექცია</h2><div className="student-deadline__date"><BodyAsset file="bookmark-2.svg" /><time>{formatDate(previousLectureDate)}</time></div></header>
    {assignment ? <article className="student-deadline__current">
      <h3><BodyAsset file="book-saved.svg" /><span><em>დავალება{assignment.number ? ` #${assignment.number}` : ""}:</em> {assignment.title}</span></h3>
      <p className="student-deadline__description"><strong>აღწერა:</strong> {assignment.description}</p>
      <p className="student-deadline__deadline"><BodyAsset file="timer.svg" /><span><strong>deadline:</strong> {formatDate(assignment.dueDate)}</span></p>
      <input ref={inputRef} className="visually-hidden" type="file" onChange={(event) => handleFile(event.target.files?.[0])} />
      <button className="upload-file" disabled={upload.loading || Boolean(assignment.submission)} onClick={() => inputRef.current?.click()}><BodyAsset file="directbox-send.svg" /><span>{upload.loading ? "იტვირთება..." : assignment.submission ? "დავალება ჩაბარებულია" : "ატვირთე ფაილი"}</span><small>{assignment.allowedFileTypes.join(", ")}</small></button>
      {upload.error && <p className="dashboard-inline-error">ფაილი ვერ აიტვირთა. სცადეთ ხელახლა.</p>}
      <div className="status-line"><BodyAsset file="clock.svg" /><strong>STATUS:</strong><span>{assignment.submission?.status || <>მოლოდინში/<br />ჩაბარებული/<br />ვადაგასული</>}</span></div>
    </article> : <article><p>აქტიური დავალება არ არის.</p></article>}
    {recentGrade && <article className="lecture-task"><h3><BodyAsset file="book-saved-1.svg" /><span>წინა დავალების შეფასება</span></h3><p>დავალება{recentGrade.number ? ` #${recentGrade.number}` : ""}: “{recentGrade.title}” <b>{recentGrade.submission.score}/10</b></p><button type="button"><BodyAsset file="import.svg" />გახსენით ლექტორის კომენტარი</button></article>}
  </section>;
}

function TasksPanel({ tasks }) {
  return <section className="student-tasks">
    <FooterAsset file="more.svg" className="student-tasks__more" />
    <aside>
      <div className="student-tasks__aside-title"><FooterAsset file="receipt.svg" /><strong>TASKS</strong></div>
      <button type="button"><FooterAsset file="add-circle.svg" />CREATE</button>
      <button type="button"><FooterAsset file="tick-circle.svg" />ALL TASKS</button>
      <button type="button"><FooterAsset file="Star 1.svg" />STARRED</button>
    </aside>
    <div className="student-tasks__list">
      <h3>MY TASKS</h3>
      <button type="button" className="add-task"><span>ADD TASK</span><FooterAsset file="add-circle-1.svg" /></button><hr />
      <div className="student-tasks__rows">
        {tasks.length ? tasks.map((task) => <div className="student-task-row" key={task._id || task.id || task.title}><FooterAsset file={task.completed ? "tick-circle-1.svg" : "mirror.svg"} /><span>{task.title}</span></div>) : <p className="student-tasks__empty">დავალებები ჯერ არ არის</p>}
      </div>
      <small><FooterAsset file="flag.svg" />COMPLITED</small>
    </div>
  </section>;
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
    <header className="student-summary">
      <div className="student-summary__lecture"><HeaderAsset file="notification.svg" /><p><strong>შემდეგი ლექცია:</strong><b>{data.nextLecture ? `${formatLectureDay(data.nextLecture.date)} ${formatTime(data.nextLecture.date)}` : "დაგეგმილი არ არის"}</b></p></div>
      <div className="student-summary__topic"><HeaderAsset file="bezier.svg" /><TopicSummary topic={data.nextLecture?.topic} /></div>
      <div className="student-summary__assignments"><HeaderAsset file="book.svg" /><p><strong>დავალებების პანელი</strong></p></div>
    </header>
    <div className="student-dashboard__workspace"><div className="student-dashboard__top"><CalendarCard lectures={data.lectures} nextLecture={data.nextLecture} /><AssignmentCard assignment={data.latestAssignment} recentGrade={data.recentGrade} previousLectureDate={data.previousLectureDate} onUploaded={retry} /></div><TasksPanel tasks={data.tasks} /></div>
  </div></main>;
}
