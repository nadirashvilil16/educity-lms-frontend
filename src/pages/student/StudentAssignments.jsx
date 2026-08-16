import { useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { submitAssignment } from "../../services/student.service";
import { StudentSidebar, StudentState } from "../../components/student/StudentSidebar";

const formatDate = (value) => {
  if (!value) return "არ არის მითითებული";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "არ არის მითითებული";
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map((part, index) => (index < 2 ? String(part).padStart(2, "0") : part))
    .join(".");
};

const STATUS_LABELS = { pending: "მოლოდინში", accepted: "ჩაბარებული", rejected: "ვადაგასული" };

function AssignmentRow({ assignment, onUploaded }) {
  const inputRef = useRef(null);
  const [upload, setUpload] = useState({ loading: false, error: null });

  async function handleFile(file) {
    if (!file) return;
    setUpload({ loading: true, error: null });
    try {
      await submitAssignment(assignment.id, file);
      setUpload({ loading: false, error: null });
      onUploaded();
    } catch (error) {
      setUpload({ loading: false, error });
    }
  }

  const status = assignment.submission?.status;

  return (
    <article className="assignment-row-card">
      <header>
        <h3>{assignment.number ? `დავალება #${assignment.number}: ` : ""}{assignment.title}</h3>
        <span className={`assignment-status is-${status || "none"}`}>
          {status ? STATUS_LABELS[status] || status : "არ არის ატვირთული"}
        </span>
      </header>
      <p className="assignment-row-card__description">{assignment.description}</p>
      <p className="assignment-row-card__deadline">ჩაბარების ვადა: {formatDate(assignment.dueDate)}</p>
      {assignment.submission?.score != null && (
        <p className="assignment-row-card__score">ქულა: <b>{assignment.submission.score}</b></p>
      )}
      {!assignment.submission && (
        <>
          <input ref={inputRef} className="visually-hidden" type="file" onChange={(e) => handleFile(e.target.files?.[0])} />
          <button type="button" className="upload-file" disabled={upload.loading} onClick={() => inputRef.current?.click()}>
            <span>{upload.loading ? "იტვირთება..." : "ატვირთე ფაილი"}</span>
            <small>{(assignment.allowedFileTypes || []).join(", ")}</small>
          </button>
          {upload.error && <p className="dashboard-inline-error">ფაილი ვერ აიტვირთა. სცადეთ ხელახლა.</p>}
        </>
      )}
    </article>
  );
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useStudentDashboard(user);

  if (loading && !data) return <StudentState message="დავალებები იტვირთება..." />;
  if (error || !data) return <StudentState message="დავალებების მონაცემები ვერ ჩაიტვირთა." onRetry={retry} />;

  return (
    <main className="student-dashboard">
      <StudentSidebar student={data.student} attendance={data.attendance} progress={data.progress} onProfileUpdated={retry} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">დავალებები</h1>
          {data.assignments.length ? (
            <div className="assignment-row-list">
              {data.assignments.map((assignment) => (
                <AssignmentRow key={assignment.id} assignment={assignment} onUploaded={retry} />
              ))}
            </div>
          ) : (
            <p className="student-tasks__empty">დავალებები ჯერ არ არის</p>
          )}
        </div>
      </div>
    </main>
  );
}
