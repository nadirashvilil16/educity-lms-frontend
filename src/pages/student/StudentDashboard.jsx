import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { submitAssignment, createTask, updateTask } from "../../services/student.service";
import { StudentSidebar, StudentState } from "../../components/student/StudentSidebar";

const WEEKDAYS = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"];
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];

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

function HeaderAsset({ file }) {
  return <img className="student-summary__icon" src={`/assets/icons/header/${file}`} alt="" aria-hidden="true" />;
}

function BodyAsset({ file, className = "" }) {
  return <img className={className} src={`/assets/icons/body/${file}`} alt="" aria-hidden="true" />;
}

function LegendDot({ fill }) {
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <circle cx="6" cy="6" r="6" fill={fill} />
  </svg>;
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
    return { key, date, day: date.getDate(), muted: date.getMonth() !== month, event: eventDates.has(key), selected: key === selectedKey };
  });
}

function CalendarCard({ lectures, nextLecture }) {
  const initialDate = nextLecture?.date ? new Date(nextLecture.date) : new Date();
  const [activeDate, setActiveDate] = useState(initialDate);
  const days = useMemo(() => buildMonthDays(activeDate, lectures), [activeDate, lectures]);
  const moveMonth = (offset) => setActiveDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));

  const selectedKey = dateKey(activeDate);
  const selectedLecture = lectures.find((lecture) => dateKey(lecture.date) === selectedKey);
  const isNextLectureSelected = nextLecture && selectedKey === dateKey(nextLecture.date);
  const displayLecture = isNextLectureSelected ? nextLecture : selectedLecture;
  const lectureBarLabel = isNextLectureSelected ? "უახლოესი ლექცია" : "არჩეული დღის ლექცია";

  return <section className="student-card student-calendar">
    <header className="student-card__header"><h2>ლექციების კალენდარი <BodyAsset file="calendar.svg" className="student-calendar__title-icon" /></h2><div className="calendar-switcher"><button onClick={() => moveMonth(-1)} aria-label="წინა თვე">‹</button><strong>{MONTHS[activeDate.getMonth()]} {activeDate.getFullYear()}</strong><button onClick={() => moveMonth(1)} aria-label="შემდეგი თვე">›</button></div></header>
    <div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-grid" style={{ "--weeks": days.length / 7 }}>{days.map((item) => <button type="button" key={item.key} onClick={() => setActiveDate(item.date)} className={`${item.muted ? "is-muted" : ""} ${item.event ? "has-event" : ""} ${item.selected ? "is-selected" : ""}`}>{item.day}</button>)}</div>
    <div className="calendar-legend"><span><LegendDot fill="#143b65" />დღეს</span><span><LegendDot fill="#edf3fc" />ლექციის დღე</span></div>
    <div className="next-lecture"><span><small>{lectureBarLabel}</small><strong>{displayLecture ? `${displayLecture.title} — ${displayLecture.topic}` : "ლექცია დაგეგმილი არ არის"}</strong></span><b>{formatTime(displayLecture?.date)}</b></div>
  </section>;
}

function AssignmentCard({ assignment, recentGrade, previousLectureDate, onUploaded }) {
  const inputRef = useRef(null);
  const [upload, setUpload] = useState({ loading: false, error: null });
  const [showComment, setShowComment] = useState(false);

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
    {recentGrade && <article className="lecture-task"><h3><BodyAsset file="book-saved-1.svg" /><span>წინა დავალების შეფასება</span></h3><p>დავალება{recentGrade.number ? ` #${recentGrade.number}` : ""}: “{recentGrade.title}” <b>{recentGrade.submission.score}/10</b></p><button type="button" onClick={() => setShowComment((v) => !v)}><BodyAsset file="import.svg" />{showComment ? "დამალვა" : "გახსენით ლექტორის კომენტარი"}</button>{showComment && <p className="lecture-task__comment">{recentGrade.submission.teacherComment || "ლექტორმა კომენტარი არ დატოვა"}</p>}</article>}
  </section>;
}

function TasksPanel({ tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const addInputRef = useRef(null);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const visibleTasks = filter === "starred" ? tasks.filter((t) => t.starred) : tasks;
  const completedCount = tasks.filter((t) => t.completed).length;

  function startAdding() {
    setFilter("all");
    setAdding(true);
    setTimeout(() => addInputRef.current?.focus(), 0);
  }

  async function handleAddSubmit(event) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) { setAdding(false); return; }
    const created = await createTask(title);
    setTasks((prev) => [created, ...prev]);
    setNewTitle("");
    setAdding(false);
  }

  async function toggleCompleted(task) {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, completed: !t.completed } : t)));
    await updateTask(task._id, { completed: !task.completed });
  }

  async function toggleStarred(task) {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, starred: !t.starred } : t)));
    await updateTask(task._id, { starred: !task.starred });
  }

  return <section className="student-tasks">
    <FooterAsset file="more.svg" className="student-tasks__more" />
    <aside>
      <div className="student-tasks__aside-title"><FooterAsset file="receipt.svg" /><strong>TASKS</strong></div>
      <button type="button" onClick={startAdding}><FooterAsset file="add-circle.svg" />CREATE</button>
      <button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}><FooterAsset file="tick-circle.svg" />ALL TASKS</button>
      <button type="button" className={filter === "starred" ? "is-active" : ""} onClick={() => setFilter("starred")}><FooterAsset file="Star 1.svg" />STARRED</button>
    </aside>
    <div className="student-tasks__list">
      <h3>MY TASKS</h3>
      {adding
        ? <form className="add-task" onSubmit={handleAddSubmit}><input ref={addInputRef} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={() => !newTitle.trim() && setAdding(false)} placeholder="ახალი დავალება..." /><button type="submit"><FooterAsset file="add-circle-1.svg" /></button></form>
        : <button type="button" className="add-task" onClick={startAdding}><span>ADD TASK</span><FooterAsset file="add-circle-1.svg" /></button>}
      <hr />
      <div className="student-tasks__rows">
        {visibleTasks.length ? visibleTasks.map((task) => (
          <div className="student-task-row" key={task._id}>
            <button type="button" className="student-task-row__toggle" onClick={() => toggleCompleted(task)}><FooterAsset file={task.completed ? "tick-circle-1.svg" : "mirror.svg"} /></button>
            <span className={task.completed ? "is-done" : ""}>{task.title}</span>
            <button type="button" className={`student-task-row__star${task.starred ? " is-starred" : ""}`} onClick={() => toggleStarred(task)}><FooterAsset file="Star 1.svg" /></button>
          </div>
        )) : <p className="student-tasks__empty">{filter === "starred" ? "ვარსკვლავიანი დავალება არ არის" : "დავალებები ჯერ არ არის"}</p>}
      </div>
      <small><FooterAsset file="flag.svg" />COMPLETED: {completedCount}/{tasks.length}</small>
    </div>
  </section>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useStudentDashboard(user);
  if (loading && !data) return <StudentState message="Dashboard იტვირთება..." />;
  if (error || !data) return <StudentState message="Dashboard-ის მონაცემები ვერ ჩაიტვირთა." onRetry={retry} />;

  return <main className="student-dashboard"><StudentSidebar student={data.student} attendance={data.attendance} progress={data.progress} onProfileUpdated={retry} /><div className="student-dashboard__content">
    <header className="student-summary">
      <div className="student-summary__lecture"><HeaderAsset file="notification.svg" /><p><strong>შემდეგი ლექცია:</strong><b>{data.nextLecture ? `${formatLectureDay(data.nextLecture.date)} ${formatTime(data.nextLecture.date)}` : "დაგეგმილი არ არის"}</b></p></div>
      <div className="student-summary__topic"><HeaderAsset file="bezier.svg" /><TopicSummary topic={data.nextLecture?.topic} /></div>
      <Link to="/student/assignments" className="student-summary__assignments"><HeaderAsset file="book.svg" /><p><strong>დავალებების პანელი</strong></p></Link>
    </header>
    <div className="student-dashboard__workspace"><div className="student-dashboard__top"><CalendarCard lectures={data.lectures} nextLecture={data.nextLecture} /><AssignmentCard assignment={data.latestAssignment} recentGrade={data.recentGrade} previousLectureDate={data.previousLectureDate} onUploaded={retry} /></div><TasksPanel tasks={data.tasks} /></div>
  </div></main>;
}
