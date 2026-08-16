import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { getGrades } from "../../services/student.service";
import { StudentSidebar, StudentState } from "../../components/student/StudentSidebar";

function useGrades() {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    getGrades({ signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error?.name === "CanceledError" || error?.name === "AbortError") return;
        setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export default function StudentGrades() {
  const { user } = useAuth();
  const dashboard = useStudentDashboard(user);
  const grades = useGrades();

  if ((dashboard.loading && !dashboard.data) || (grades.loading && !grades.data)) {
    return <StudentState message="შეფასებები იტვირთება..." />;
  }
  if (dashboard.error || !dashboard.data || grades.error || !grades.data) {
    return <StudentState message="შეფასებების მონაცემები ვერ ჩაიტვირთა." />;
  }

  const { submissions, grades: adhocGrades, average } = grades.data;

  return (
    <main className="student-dashboard">
      <StudentSidebar student={dashboard.data.student} attendance={dashboard.data.attendance} progress={dashboard.data.progress} onProfileUpdated={dashboard.retry} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">ჩემი შეფასებები</h1>
          <p className="student-average">საშუალო ქულა: <b>{average}</b></p>
          <div className="grade-row-list">
            {submissions.map((s) => (
              <div className="grade-row-card" key={s._id}>
                <span>{s.assignmentId?.title || "დავალება"}</span>
                <b>{s.score != null ? s.score : "—"}</b>
              </div>
            ))}
            {adhocGrades.map((g) => (
              <div className="grade-row-card" key={g._id}>
                <span>{g.title}</span>
                <b>{g.score}</b>
              </div>
            ))}
            {!submissions.length && !adhocGrades.length && <p className="student-tasks__empty">შეფასებები ჯერ არ არის</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
