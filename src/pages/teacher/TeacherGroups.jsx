import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

export default function TeacherGroups() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useTeacherDashboard(user);

  if (loading && !data) return <TeacherState message="იტვირთება..." />;
  if (error || !data) return <TeacherState message="მონაცემები ვერ ჩაიტვირთა." onRetry={retry} />;

  return (
    <main className="student-dashboard">
      <TeacherSidebar teacher={data.teacher} groupCount={data.groups.length} pendingGradingCount={data.pendingGradingCount} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">ჩემი ჯგუფები</h1>
          <div className="teacher-groups-page-list">
            {data.groups.length ? data.groups.map((g) => (
              <div className="teacher-group-row" key={g._id}>
                <div className="teacher-group-row__name"><strong>{g.name}</strong><span>{g.courseName || "კურსი არ არის მითითებული"}</span></div>
                <span className="teacher-group-row__schedule">{g.schedule?.length ? g.schedule.map((s) => `${s.day} ${s.startTime}-${s.endTime}`).join(", ") : "განრიგი არ არის მითითებული"}</span>
                <span className="teacher-group-row__count">{g.studentCount} სტუდენტი</span>
                <Link to={`/teacher/groups/${g._id}`}>სტუდენტები</Link>
                <Link to={`/teacher/attendance/${g._id}`}>დასწრება</Link>
              </div>
            )) : <p className="student-tasks__empty">ჯგუფები ჯერ არ არის მიბმული</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
