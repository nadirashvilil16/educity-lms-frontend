import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { createAssignment, listAssignments, listSubmissions, gradeSubmission, resolveFileUrl } from "../../services/teacher.service";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

const formatDate = (value) => new Date(value).toLocaleDateString("ka-GE");
const STATUS_LABELS = { pending: "შესამოწმებელია", accepted: "მიღებულია", rejected: "არ არის მიღებული" };

function SubmissionRow({ assignmentId, submission, onGraded }) {
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
    <div className="submissions__row">
      <span>{submission.studentId?.firstName} {submission.studentId?.lastName}</span>
      {submission.fileUrl && <a href={resolveFileUrl(submission.fileUrl)} target="_blank" rel="noreferrer">ნაშრომის ნახვა</a>}
      {submission.status === "pending" ? (
        <>
          <input type="number" min="0" max="100" placeholder="ქულა" value={score} onChange={(e) => setScore(e.target.value)} />
          <input type="text" placeholder="კომენტარი (არასავალდებულო)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="button" onClick={handleAccept}>მიღებულია</button>
          <button type="button" onClick={handleReject}>არ არის მიღებული</button>
        </>
      ) : (
        <span>{STATUS_LABELS[submission.status]}{submission.score != null ? ` · ${submission.score}` : ""}</span>
      )}
    </div>
  );
}

export default function TeacherAssignments() {
  const { user } = useAuth();
  const dashboard = useTeacherDashboard(user);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ groupId: "", title: "", description: "", dueDate: "" });
  const [openAssignmentId, setOpenAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [saving, setSaving] = useState(false);

  function loadAssignments() {
    listAssignments().then(setAssignments);
  }

  useEffect(loadAssignments, []);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createAssignment(form);
      setForm({ groupId: "", title: "", description: "", dueDate: "" });
      loadAssignments();
    } finally {
      setSaving(false);
    }
  }

  async function toggleSubmissions(assignmentId) {
    if (openAssignmentId === assignmentId) {
      setOpenAssignmentId(null);
      return;
    }
    const data = await listSubmissions(assignmentId);
    setSubmissions(data);
    setOpenAssignmentId(assignmentId);
  }

  async function reloadSubmissions(assignmentId) {
    const data = await listSubmissions(assignmentId);
    setSubmissions(data);
  }

  if (dashboard.loading && !dashboard.data) return <TeacherState message="იტვირთება..." />;
  if (dashboard.error || !dashboard.data) return <TeacherState message="მონაცემები ვერ ჩაიტვირთა." />;

  const selectedGroup = dashboard.data.groups.find((g) => g._id === form.groupId);

  return (
    <main className="student-dashboard">
      <TeacherSidebar teacher={dashboard.data.teacher} groupCount={dashboard.data.groups.length} pendingGradingCount={dashboard.data.pendingGradingCount} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">ახალი დავალება</h1>
          <form className="teacher-assignment-form" onSubmit={handleCreate}>
            <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} required>
              <option value="">-- ჯგუფი --</option>
              {dashboard.data.groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            <select value={selectedGroup?.courseName || ""} disabled>
              <option>{selectedGroup ? (selectedGroup.courseName || "კურსი არ არის მითითებული") : "-- ჯერ აირჩიეთ ჯგუფი --"}</option>
            </select>
            <input placeholder="სათაური" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="აღწერა" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            <button type="submit" disabled={saving}>{saving ? "იქმნება..." : "შექმნა"}</button>
          </form>

          <h1 className="student-page-title">დავალებები</h1>
          <div className="assignment-row-list">
            {assignments.map((a) => (
              <article className="assignment-row-card" key={a._id}>
                <header>
                  <h3>{a.title}</h3>
                  <span className="assignment-status is-none">{a.groupId?.name}</span>
                </header>
                <p className="assignment-row-card__deadline">ჩაბარების ვადა: {formatDate(a.dueDate)}</p>
                <button type="button" className="upload-file" onClick={() => toggleSubmissions(a._id)}>
                  <span>{openAssignmentId === a._id ? "დახურვა" : "ნაშრომების ნახვა"}</span>
                </button>
                {openAssignmentId === a._id && (
                  <div className="submissions">
                    {submissions.length ? submissions.map((s) => (
                      <SubmissionRow key={s._id} assignmentId={a._id} submission={s} onGraded={() => reloadSubmissions(a._id)} />
                    )) : <p className="student-tasks__empty">ნაშრომები ჯერ არ არის ატვირთული</p>}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
