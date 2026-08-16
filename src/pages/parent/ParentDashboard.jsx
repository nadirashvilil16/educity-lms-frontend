import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "../../services/parent.service";
import { ParentSidebar, ParentState } from "../../components/parent/ParentSidebar";

const WEEKDAYS = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"];
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];

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
  const eventDates = new Set(lectures.map((l) => dateKey(l.date)).filter(Boolean));
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

function ChildCalendar({ lectures, nextLecture }) {
  const [activeDate, setActiveDate] = useState(nextLecture?.date ? new Date(nextLecture.date) : new Date());
  const days = useMemo(() => buildMonthDays(activeDate, lectures), [activeDate, lectures]);
  const moveMonth = (offset) => setActiveDate((d) => new Date(d.getFullYear(), d.getMonth() + offset, 1));

  const selectedKey = dateKey(activeDate);
  const selectedLecture = lectures.find((l) => dateKey(l.date) === selectedKey);
  const isNextLectureSelected = nextLecture && selectedKey === dateKey(nextLecture.date);
  const displayLecture = isNextLectureSelected ? nextLecture : selectedLecture;
  const lectureBarLabel = isNextLectureSelected ? "შემდეგი ლექცია" : "არჩეული დღის ლექცია";

  return <section className="student-card student-calendar">
    <header className="student-card__header">
      <h2>ლექციების კალენდარი</h2>
      <div className="calendar-switcher">
        <button onClick={() => moveMonth(-1)} aria-label="წინა თვე">‹</button>
        <strong>{MONTHS[activeDate.getMonth()]} {activeDate.getFullYear()}</strong>
        <button onClick={() => moveMonth(1)} aria-label="შემდეგი თვე">›</button>
      </div>
    </header>
    <div className="calendar-weekdays">{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div>
    <div className="calendar-grid" style={{ "--weeks": days.length / 7 }}>
      {days.map((item) => <button type="button" key={item.key} onClick={() => setActiveDate(item.date)} className={`${item.muted ? "is-muted" : ""} ${item.event ? "has-event" : ""} ${item.selected ? "is-selected" : ""}`}>{item.day}</button>)}
    </div>
    <div className="calendar-legend"><span><LegendDot fill="#143b65" />დღეს</span><span><LegendDot fill="#edf3fc" />ლექციის დღე</span></div>
    <div className="next-lecture"><span><small>{lectureBarLabel}</small><strong>{displayLecture ? `${displayLecture.title || "ლექცია"}${displayLecture.topic ? ` — ${displayLecture.topic}` : ""}` : "ლექცია დაგეგმილი არ არის"}</strong></span><b>{formatTime(displayLecture?.date)}</b></div>
  </section>;
}

export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getDashboard().then(setData).catch(setError);
  }

  useEffect(load, []);

  if (error) return <ParentState message="მონაცემები ვერ ჩაიტვირთა." onRetry={load} />;
  if (!data) return <ParentState message="იტვირთება..." />;

  return (
    <main className="student-dashboard">
      <ParentSidebar childName={data.childName} courseName={data.courseName} />
      <div className="student-dashboard__content">
        <header className="student-summary">
          <div><p><strong>დასწრება:</strong> <span>{data.attendance.percentage}%</span></p></div>
          <div><p><strong>პროგრესი:</strong> <span>{data.progress.percentage}%</span></p></div>
          <div><p><strong>ჯგუფი:</strong> <span>{data.groupName || "—"}</span></p></div>
        </header>
        <div className="student-dashboard__workspace">
          <ChildCalendar lectures={data.lectures || []} nextLecture={data.nextLecture} />
        </div>
      </div>
    </main>
  );
}
