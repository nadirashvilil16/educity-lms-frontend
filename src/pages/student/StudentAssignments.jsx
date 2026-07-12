import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);

  function load() {
    api.get("/student/assignments").then((res) => setAssignments(res.data));
  }

  useEffect(load, []);

  async function handleSubmit(assignmentId, file) {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/student/assignments/${assignmentId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    load();
  }

  return (
    <div className="assignments">
      <h1>დავალებები</h1>
      {assignments.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>{a.description}</p>
          <p>ჩაბარების ვადა: {new Date(a.dueDate).toLocaleDateString("ka-GE")}</p>
          {a.submission ? (
            <p>
              სტატუსი: {a.submission.status}
              {a.submission.score != null && ` · ქულა: ${a.submission.score}`}
            </p>
          ) : (
            <input type="file" onChange={(e) => handleSubmit(a._id, e.target.files[0])} />
          )}
        </div>
      ))}
    </div>
  );
}
