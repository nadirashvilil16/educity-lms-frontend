import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

const WEEKDAYS = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"];
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];

const formatDate = (value) => {
  if (!value) return "არ არის მითითებული";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "არ არის მითითებული";
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map((part, index) => (index < 2 ? String(part).padStart(2, "0") : part))
    .join(".");
};
const formatTime = (value) => value ? new Intl.DateTimeFormat("ka-GE", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "--:--";
const dateKey = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

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

function LegendDot({ fill }) {
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill={fill} /></svg>;
}

function TeacherCalendarCard({ lectures, nextLecture }) {
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
    <header className="student-card__header">
      <h2>ლექციების კალენდარი</h2>
      <div className="calendar-switcher">
        <button onClick={() => moveMonth(-1)} aria-label="წინა თვე">‹</button>
        <strong>{MONTHS[activeDate.getMonth()]} {activeDate.getFullYear()}</strong>
        <button onClick={() => moveMonth(1)} aria-label="შემდეგი თვე">›</button>
      </div>
    </header>
    <div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-grid" style={{ "--weeks": days.length / 7 }}>
      {days.map((item) => <button type="button" key={item.key} onClick={() => setActiveDate(item.date)} className={`${item.muted ? "is-muted" : ""} ${item.event ? "has-event" : ""} ${item.selected ? "is-selected" : ""}`}>{item.day}</button>)}
    </div>
    <div className="calendar-legend"><span><LegendDot fill="#143b65" />დღეს</span><span><LegendDot fill="#edf3fc" />ლექციის დღე</span></div>
    <div className="next-lecture"><span><small>{lectureBarLabel}</small><strong>{displayLecture ? `${displayLecture.groupId?.name || "ჯგუფი"} — ${displayLecture.title || "ლექცია"}` : "ლექცია დაგეგმილი არ არის"}</strong></span><b>{formatTime(displayLecture?.date)}</b></div>
  </section>;
}

function GroupsPanel({ groups }) {
  return <section className="student-card teacher-groups">
    <header className="student-card__header"><h2>ჩემი ჯგუფები</h2></header>
    <div className="teacher-groups__list">
      {groups.length ? groups.map((g) => (
        <div className="teacher-group-row" key={g._id}>
          <div className="teacher-group-row__name"><strong>{g.name}</strong><span>{g.courseName || "კურსი არ არის მითითებული"}</span></div>
          <span className="teacher-group-row__schedule">{g.schedule?.length ? g.schedule.map((s) => `${s.day} ${s.startTime}-${s.endTime}`).join(", ") : "განრიგი არ არის მითითებული"}</span>
          <span className="teacher-group-row__count">{g.studentCount} სტუდენტი</span>
          <Link to={`/teacher/groups/${g._id}`}>სტუდენტები</Link>
          <Link to={`/teacher/attendance/${g._id}`}>დასწრება</Link>
        </div>
      )) : <p className="student-tasks__empty">ჯგუფები ჯერ არ არის მიბმული</p>}
    </div>
  </section>;
}

function PendingAssignments({ assignments }) {
  return <section className="teacher-pending">
    <header><h2>შესაფასებელი დავალებები</h2><Link to="/teacher/assignments">ყველას ნახვა</Link></header>
    <div className="teacher-pending__list">
      {assignments.length ? assignments.map((a) => (
        <Link to={`/teacher/assignments/${a._id}`} className="teacher-pending-row" key={a._id}>
          <strong>{a.title}</strong>
          <span>{a.groupId?.name || "ჯგუფი"}</span>
          <span>ვადა: {formatDate(a.dueDate)}</span>
        </Link>
      )) : <p className="student-tasks__empty">ვადიანი დავალება არ არის</p>}
    </div>
  </section>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useTeacherDashboard(user);

  if (loading && !data) return <TeacherState message="Dashboard იტვირთება..." />;
  if (error || !data) return <TeacherState message="Dashboard-ის მონაცემები ვერ ჩაიტვირთა." onRetry={retry} />;

  return <main className="student-dashboard">
    <TeacherSidebar teacher={data.teacher} groupCount={data.groups.length} pendingGradingCount={data.pendingGradingCount} />
    <div className="student-dashboard__content">
      <header className="student-summary">
        <div className="student-summary__lecture"><p><strong>შემდეგი ლექცია:</strong><b>{data.nextLecture ? `${formatDate(data.nextLecture.date)} ${formatTime(data.nextLecture.date)}` : "დაგეგმილი არ არის"}</b></p></div>
        <div><p><strong>ჯგუფები:</strong> <span>{data.groups.length}</span></p></div>
        <Link to="/teacher/grading"><p><strong>შესამოწმებელი დავალებები:</strong> <span>{data.pendingGradingCount}</span></p></Link>
      </header>
      <div className="student-dashboard__workspace">
        <div className="student-dashboard__top">
          <TeacherCalendarCard lectures={data.lectures} nextLecture={data.nextLecture} />
          <GroupsPanel groups={data.groups} />
        </div>
        <PendingAssignments assignments={data.assignments.filter((a) => new Date(a.dueDate) >= new Date())} />
      </div>
    </div>
  </main>;
}
