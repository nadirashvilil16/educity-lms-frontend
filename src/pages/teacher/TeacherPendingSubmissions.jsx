import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { listPendingSubmissions, gradeSubmission, resolveFileUrl } from "../../services/teacher.service";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

const formatDate = (value) => new Date(value).toLocaleDateString("ka-GE");

function PendingRow({ submission, onGraded }) {
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const assignment = submission.assignmentId;

  async function handleAccept() {
    await gradeSubmission(assignment._id, submission._id, { status: "accepted", score: Number(score) || 0, comment });
    onGraded();
  }
  async function handleReject() {
    await gradeSubmission(assignment._id, submission._id, { status: "rejected", comment });
    onGraded();
  }

  return (
    <article className="assignment-row-card">
      <header>
        <h3>{submission.studentId?.firstName} {submission.studentId?.lastName}</h3>
        <span className="assignment-status is-none">{assignment?.groupId?.name}</span>
      </header>
      <p className="assignment-row-card__description">{assignment?.title}</p>
      <p className="assignment-row-card__deadline">ჩაბარების ვადა: {assignment?.dueDate ? formatDate(assignment.dueDate) : "—"}</p>
      {submission.fileUrl && <p><a href={resolveFileUrl(submission.fileUrl)} target="_blank" rel="noreferrer">ნაშრომის ნახვა</a></p>}
      <div className="submissions__row">
        <input type="number" min="0" max="100" placeholder="ქულა" value={score} onChange={(e) => setScore(e.target.value)} />
        <input type="text" placeholder="კომენტარი (არასავალდებულო)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button type="button" onClick={handleAccept}>მიღებულია</button>
        <button type="button" onClick={handleReject}>არ არის მიღებული</button>
      </div>
    </article>
  );
}

export default function TeacherPendingSubmissions() {
  const { user } = useAuth();
  const dashboard = useTeacherDashboard(user);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    listPendingSubmissions().then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  if (dashboard.loading && !dashboard.data) return <TeacherState message="იტვირთება..." />;
  if (dashboard.error || !dashboard.data) return <TeacherState message="მონაცემები ვერ ჩაიტვირთა." />;

  return (
    <main className="student-dashboard">
      <TeacherSidebar teacher={dashboard.data.teacher} groupCount={dashboard.data.groups.length} pendingGradingCount={submissions.length} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">შესამოწმებელი დავალებები</h1>
          {!loading && (
            <div className="assignment-row-list">
              {submissions.length
                ? submissions.map((s) => <PendingRow key={s._id} submission={s} onGraded={load} />)
                : <p className="student-tasks__empty">შესამოწმებელი დავალება არ არის</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
