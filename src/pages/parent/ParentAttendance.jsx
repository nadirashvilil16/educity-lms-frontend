import { useEffect, useState } from "react";
import { getDashboard, getAttendance } from "../../services/parent.service";
import { ParentSidebar, ParentState } from "../../components/parent/ParentSidebar";

const formatDate = (value) => new Date(value).toLocaleDateString("ka-GE");

export default function ParentAttendance() {
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getDashboard(), getAttendance()])
      .then(([d, r]) => { setDashboard(d); setRecords(r); })
      .catch(setError);
  }, []);

  if (error) return <ParentState message="მონაცემები ვერ ჩაიტვირთა." />;
  if (!dashboard || !records) return <ParentState message="იტვირთება..." />;

  return (
    <main className="student-dashboard">
      <ParentSidebar childName={dashboard.childName} courseName={dashboard.courseName} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">დასწრება</h1>
          <div className="teacher-attendance-list">
            {records.length ? records.map((r) => (
              <div className="teacher-attendance-row" key={r._id}>
                <strong>{r.lectureId?.date ? formatDate(r.lectureId.date) : "—"} — {r.lectureId?.title || "ლექცია"}</strong>
                <span className={`assignment-status ${r.status === "present" ? "is-accepted" : "is-rejected"}`}>{r.status === "present" ? "დაესწრო" : "გააცდინა"}</span>
              </div>
            )) : <p className="student-tasks__empty">დასწრების ჩანაწერები ჯერ არ არის</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
