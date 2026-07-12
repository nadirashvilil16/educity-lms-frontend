import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/student/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>იტვირთება...</p>;

  return (
    <div className="dashboard">
      <h1>
        გამარჯობა, {data.firstName} {data.lastName}
      </h1>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-card__label">დასწრება</span>
          <span className="stat-card__value">{data.attendance.percentage}%</span>
          <span className="stat-card__meta">
            {data.attendance.attended}/{data.attendance.held}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">პროგრესი</span>
          <span className="stat-card__value">{data.progress.percentage}%</span>
          <span className="stat-card__meta">
            {data.progress.completed}/{data.progress.total}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">შემდეგი ლექცია</span>
          <span className="stat-card__value">
            {data.nextLecture ? new Date(data.nextLecture.date).toLocaleDateString("ka-GE") : "დაუგეგმავია"}
          </span>
        </div>
      </div>
    </div>
  );
}
