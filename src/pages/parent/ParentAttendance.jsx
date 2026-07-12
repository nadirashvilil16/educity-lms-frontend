import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ParentAttendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/parent/attendance").then((res) => setRecords(res.data));
  }, []);

  return (
    <div className="attendance">
      <h1>დასწრება</h1>
      {records.map((r) => (
        <div key={r._id} className="attendance__row">
          <span>{new Date(r.lectureId?.date).toLocaleDateString("ka-GE")}</span>
          <span>{r.status === "present" ? "დაესწრო" : "გააცდინა"}</span>
        </div>
      ))}
    </div>
  );
}
