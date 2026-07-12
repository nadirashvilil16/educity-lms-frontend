import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>იტვირთება...</p>;

  return (
    <div className="dashboard">
      <h1>ადმინისტრაციის პანელი</h1>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-card__label">აქტიური სტუდენტები</span>
          <span className="stat-card__value">{data.activeStudents}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">აქტიური კურსები</span>
          <span className="stat-card__value">{data.activeCourses}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">აქტიური ჯგუფები</span>
          <span className="stat-card__value">{data.activeGroups}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">დღევანდელი დასწრება</span>
          <span className="stat-card__value">{data.todayAttendancePct}%</span>
        </div>
      </div>
    </div>
  );
}
