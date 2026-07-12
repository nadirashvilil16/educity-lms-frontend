import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ParentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/parent/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>იტვირთება...</p>;

  return (
    <div className="dashboard">
      <h1>{data.childName}</h1>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-card__label">დასწრება</span>
          <span className="stat-card__value">{data.attendance.percentage}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">პროგრესი</span>
          <span className="stat-card__value">{data.progress.percentage}%</span>
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
