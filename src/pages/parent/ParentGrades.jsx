import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ParentGrades() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/parent/grades").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>იტვირთება...</p>;

  return (
    <div className="grades">
      <h1>შეფასებები</h1>
      <p>საშუალო ქულა: {data.average}</p>
      {data.submissions.map((s) => (
        <div key={s._id} className="grade-row">
          <span>{s.assignmentId?.title}</span>
          <span>{s.score}</span>
        </div>
      ))}
      {data.grades.map((g) => (
        <div key={g._id} className="grade-row">
          <span>{g.title}</span>
          <span>{g.score}</span>
        </div>
      ))}
    </div>
  );
}
