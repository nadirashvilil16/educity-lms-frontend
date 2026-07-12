import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ date: "", courseId: "", groupId: "", teacherId: "" });

  function load() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get("/admin/attendance", { params }).then((res) => setRecords(res.data));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="admin-attendance">
      <h1>დასწრების კონტროლი</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <input
          placeholder="Course ID"
          value={filters.courseId}
          onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
        />
        <input
          placeholder="Group ID"
          value={filters.groupId}
          onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}
        />
        <input
          placeholder="Teacher ID"
          value={filters.teacherId}
          onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}
        />
        <button type="submit">ფილტრი</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>სტუდენტი</th>
            <th>ჯგუფი</th>
            <th>სტატუსი</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>
                {r.studentId?.firstName} {r.studentId?.lastName}
              </td>
              <td>{r.groupId?.name}</td>
              <td>{r.status === "present" ? "დაესწრო" : "გააცდინა"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
