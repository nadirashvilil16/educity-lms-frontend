import { useEffect, useState } from "react";
import { getDashboard, getAssignments } from "../../services/parent.service";
import { ParentSidebar, ParentState } from "../../components/parent/ParentSidebar";

const formatDate = (value) => new Date(value).toLocaleDateString("ka-GE");
const STATUS_LABELS = { pending: "შესამოწმებელია", accepted: "შესრულებულია", rejected: "არ არის მიღებული" };

export default function ParentAssignments() {
  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getDashboard(), getAssignments()])
      .then(([d, a]) => { setDashboard(d); setAssignments(a); })
      .catch(setError);
  }, []);

  if (error) return <ParentState message="მონაცემები ვერ ჩაიტვირთა." />;
  if (!dashboard || !assignments) return <ParentState message="იტვირთება..." />;

  return (
    <main className="student-dashboard">
      <ParentSidebar childName={dashboard.childName} courseName={dashboard.courseName} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">დავალებები</h1>
          <div className="assignment-row-list">
            {assignments.length ? assignments.map((a) => (
              <article className="assignment-row-card" key={a._id}>
                <header>
                  <h3>{a.title}</h3>
                  <span className={`assignment-status is-${a.submission ? a.submission.status : "none"}`}>
                    {a.submission ? STATUS_LABELS[a.submission.status] : "შესრულებული არ არის"}
                  </span>
                </header>
                <p className="assignment-row-card__deadline">ჩაბარების ვადა: {formatDate(a.dueDate)}</p>
              </article>
            )) : <p className="student-tasks__empty">დავალებები ჯერ არ არის</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
