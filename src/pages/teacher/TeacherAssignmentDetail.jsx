import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { getAssignmentRoster, gradeSubmission, resolveFileUrl } from "../../services/teacher.service";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

const formatDate = (value) => new Date(value).toLocaleDateString("ka-GE");
const STATUS_LABELS = { pending: "შესამოწმებელია", accepted: "მიღებულია", rejected: "არ არის მიღებული" };

function RosterRow({ entry, assignmentId, onGraded }) {
  const { student, submission } = entry;
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");

  async function handleAccept() {
    await gradeSubmission(assignmentId, submission._id, { status: "accepted", score: Number(score) || 0, comment });
    onGraded();
  }
  async function handleReject() {
    await gradeSubmission(assignmentId, submission._id, { status: "rejected", comment });
    onGraded();
  }

  return (
    <div className="teacher-attendance-row">
      <strong>{student.firstName} {student.lastName}</strong>
      {!submission && <span>ჯერ არ არის ატვირთული</span>}
      {submission?.missed && <span className="assignment-status is-rejected">ვადა გადაცილდა — 0</span>}
      {submission && !submission.missed && submission.status === "pending" && (
        <div className="submissions__row">
          {submission.fileUrl && <a href={resolveFileUrl(submission.fileUrl)} target="_blank" rel="noreferrer">ნაშრომის ნახვა</a>}
          <input type="number" min="0" max="100" placeholder="ქულა" value={score} onChange={(e) => setScore(e.target.value)} />
          <input type="text" placeholder="კომენტარი" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="button" onClick={handleAccept}>მიღებულია</button>
          <button type="button" onClick={handleReject}>არ არის მიღებული</button>
        </div>
      )}
      {submission && !submission.missed && submission.status !== "pending" && (
        <span className={`assignment-status is-${submission.status}`}>{STATUS_LABELS[submission.status]}{submission.score != null ? ` · ${submission.score}` : ""}</span>
      )}
    </div>
  );
}

export default function TeacherAssignmentDetail() {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const dashboard = useTeacherDashboard(user);
  const [roster, setRoster] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAssignmentRoster(assignmentId).then(setRoster).catch(setError);
  }

  useEffect(load, [assignmentId]);

  if (dashboard.loading && !dashboard.data) return <TeacherState message="იტვირთება..." />;
  if (dashboard.error || !dashboard.data) return <TeacherState message="მონაცემები ვერ ჩაიტვირთა." />;
  if (error) return <TeacherState message="დავალება ვერ მოიძებნა." />;

  return (
    <main className="student-dashboard">
      <TeacherSidebar teacher={dashboard.data.teacher} groupCount={dashboard.data.groups.length} pendingGradingCount={dashboard.data.pendingGradingCount} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          {roster ? (
            <>
              <h1 className="student-page-title">{roster.assignment.title}</h1>
              <p className="assignment-row-card__description">{roster.assignment.description}</p>
              <p className="assignment-row-card__deadline">ჩაბარების ვადა: {formatDate(roster.assignment.dueDate)} · {roster.assignment.groupId?.name}</p>
              <div className="teacher-attendance-list" style={{ marginTop: 20 }}>
                {roster.roster.map((entry) => (
                  <RosterRow key={entry.student._id} entry={entry} assignmentId={assignmentId} onGraded={load} />
                ))}
              </div>
            </>
          ) : <p className="student-tasks__empty">იტვირთება...</p>}
        </div>
      </div>
    </main>
  );
}
