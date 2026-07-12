import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/teacher/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>იტვირთება...</p>;

  return (
    <div className="dashboard">
      <h1>ჯგუფები</h1>
      {data.groups.map((g) => (
        <div key={g._id} className="group-card">
          <h3>{g.name}</h3>
          <p>სტუდენტები: {g.studentIds.length}</p>
          <Link to={`/teacher/attendance/${g._id}`}>დასწრება</Link>
        </div>
      ))}

      <h1>შესაფასებელი დავალებები</h1>
      {data.assignments.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>ჩაბარების ვადა: {new Date(a.dueDate).toLocaleDateString("ka-GE")}</p>
        </div>
      ))}
    </div>
  );
}
