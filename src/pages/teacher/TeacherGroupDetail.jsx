import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { getGroupStudents } from "../../services/teacher.service";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

function useGroupStudents(groupId) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    getGroupStudents(groupId, { signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error?.name === "CanceledError" || error?.name === "AbortError") return;
        setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [groupId]);

  return state;
}

export default function TeacherGroupDetail() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const dashboard = useTeacherDashboard(user);
  const students = useGroupStudents(groupId);
  const group = dashboard.data?.groups.find((g) => g._id === groupId);

  if ((dashboard.loading && !dashboard.data) || (students.loading && !students.data)) {
    return <TeacherState message="იტვირთება..." />;
  }
  if (dashboard.error || !dashboard.data || students.error || !students.data) {
    return <TeacherState message="მონაცემები ვერ ჩაიტვირთა." />;
  }

  return (
    <main className="student-dashboard">
      <TeacherSidebar teacher={dashboard.data.teacher} groupCount={dashboard.data.groups.length} pendingGradingCount={dashboard.data.pendingGradingCount} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">{group?.name || "ჯგუფი"} — სტუდენტები</h1>
          <div className="teacher-student-list">
            {students.data.length ? students.data.map((s) => (
              <div className="teacher-student-row" key={s._id}>
                <strong>{s.firstName} {s.lastName}</strong>
                <span>დასწრება: {s.attendance.percentage}% ({s.attendance.attended}/{s.attendance.held})</span>
                <span>პროგრესი: {s.progress.percentage}% ({s.progress.completed}/{s.progress.total})</span>
              </div>
            )) : <p className="student-tasks__empty">სტუდენტები ჯერ არ არიან ჯგუფში</p>}
          </div>
          <Link className="teacher-attendance-link" to={`/teacher/attendance/${groupId}`}>დასწრების მონიშვნაზე გადასვლა</Link>
        </div>
      </div>
    </main>
  );
}
