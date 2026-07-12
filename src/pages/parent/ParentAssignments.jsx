import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ParentAssignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get("/parent/assignments").then((res) => setAssignments(res.data));
  }, []);

  return (
    <div className="assignments">
      <h1>დავალებები</h1>
      {assignments.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>ჩაბარების ვადა: {new Date(a.dueDate).toLocaleDateString("ka-GE")}</p>
          <p>სტატუსი: {a.submission ? a.submission.status : "ჩაბარებული არ არის"}</p>
        </div>
      ))}
    </div>
  );
}
