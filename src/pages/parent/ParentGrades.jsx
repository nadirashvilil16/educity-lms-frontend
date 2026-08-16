import { useEffect, useState } from "react";
import { getDashboard, getGrades } from "../../services/parent.service";
import { ParentSidebar, ParentState } from "../../components/parent/ParentSidebar";

export default function ParentGrades() {
  const [dashboard, setDashboard] = useState(null);
  const [grades, setGrades] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getDashboard(), getGrades()])
      .then(([d, g]) => { setDashboard(d); setGrades(g); })
      .catch(setError);
  }, []);

  if (error) return <ParentState message="მონაცემები ვერ ჩაიტვირთა." />;
  if (!dashboard || !grades) return <ParentState message="იტვირთება..." />;

  return (
    <main className="student-dashboard">
      <ParentSidebar childName={dashboard.childName} courseName={dashboard.courseName} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">შეფასებები</h1>
          <p className="student-average">საშუალო ქულა: <b>{grades.average}</b></p>
          <div className="grade-row-list">
            {grades.submissions.map((s) => (
              <div className="grade-row-card" key={s._id}><span>{s.assignmentId?.title || "დავალება"}</span><b>{s.score != null ? s.score : "—"}</b></div>
            ))}
            {grades.grades.map((g) => (
              <div className="grade-row-card" key={g._id}><span>{g.title}</span><b>{g.score}</b></div>
            ))}
            {!grades.submissions.length && !grades.grades.length && <p className="student-tasks__empty">შეფასებები ჯერ არ არის</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
