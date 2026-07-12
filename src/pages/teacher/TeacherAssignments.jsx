import { useEffect, useState } from "react";
import api from "../../services/api";

export default function TeacherAssignments() {
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ groupId: "", title: "", description: "", dueDate: "" });
  const [openAssignmentId, setOpenAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  function load() {
    api.get("/teacher/groups").then((res) => setGroups(res.data));
    api.get("/teacher/assignments").then((res) => setAssignments(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/teacher/assignments", form);
    setForm({ groupId: "", title: "", description: "", dueDate: "" });
    load();
  }

  async function toggleSubmissions(assignmentId) {
    if (openAssignmentId === assignmentId) {
      setOpenAssignmentId(null);
      return;
    }
    const { data } = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
    setSubmissions(data);
    setOpenAssignmentId(assignmentId);
  }

  async function handleGrade(assignmentId, submissionId, status) {
    const score = status === "accepted" ? Number(window.prompt("ქულა:", "100")) : 0;
    await api.put(`/teacher/assignments/${assignmentId}/submissions/${submissionId}`, { status, score });
    const { data } = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
    setSubmissions(data);
  }

  return (
    <div className="teacher-assignments">
      <h1>ახალი დავალება</h1>
      <form onSubmit={handleCreate}>
        <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} required>
          <option value="">-- ჯგუფი --</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          placeholder="სათაური"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="აღწერა"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          required
        />
        <button type="submit">შექმნა</button>
      </form>

      <h1>დავალებები</h1>
      {assignments.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>ჩაბარების ვადა: {new Date(a.dueDate).toLocaleDateString("ka-GE")}</p>
          <button onClick={() => toggleSubmissions(a._id)}>
            {openAssignmentId === a._id ? "დახურვა" : "ნაშრომების ნახვა"}
          </button>

          {openAssignmentId === a._id && (
            <div className="submissions">
              {submissions.map((s) => (
                <div key={s._id} className="submissions__row">
                  <span>
                    {s.studentId.firstName} {s.studentId.lastName}
                  </span>
                  <span>{s.status === "pending" ? "შესამოწმებელია" : `${s.status} · ${s.score}`}</span>
                  {s.status === "pending" && (
                    <>
                      <button onClick={() => handleGrade(a._id, s._id, "accepted")}>მიღებულია</button>
                      <button onClick={() => handleGrade(a._id, s._id, "rejected")}>არ არის მიღებული</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
