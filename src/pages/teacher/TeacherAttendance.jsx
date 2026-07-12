import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function TeacherAttendance() {
  const { groupId } = useParams();
  const [students, setStudents] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [marks, setMarks] = useState({}); // studentId -> status

  useEffect(() => {
    api.get(`/teacher/groups/${groupId}/students`).then((res) => setStudents(res.data));
    api.get(`/teacher/groups/${groupId}/lectures`).then((res) => setLectures(res.data));
  }, [groupId]);

  async function createTodayLecture() {
    const { data } = await api.post(`/teacher/groups/${groupId}/lectures`, {
      date: new Date().toISOString(),
      title: "ლექცია",
    });
    setLectures((prev) => [...prev, data]);
    setSelectedLectureId(data._id);
  }

  async function mark(studentId, status) {
    await api.post("/teacher/attendance", { lectureId: selectedLectureId, studentId, status });
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  return (
    <div className="attendance">
      <h1>დასწრება</h1>

      <div className="attendance__lecture-picker">
        <select value={selectedLectureId} onChange={(e) => setSelectedLectureId(e.target.value)}>
          <option value="">-- აირჩიე ლექცია --</option>
          {lectures.map((l) => (
            <option key={l._id} value={l._id}>
              {new Date(l.date).toLocaleDateString("ka-GE")} {l.title}
            </option>
          ))}
        </select>
        <button onClick={createTodayLecture}>+ დღევანდელი ლექცია</button>
      </div>

      {selectedLectureId &&
        students.map((s) => (
          <div key={s._id} className="attendance__row">
            <span>
              {s.firstName} {s.lastName}
            </span>
            <button
              className={marks[s._id] === "present" ? "is-active" : ""}
              onClick={() => mark(s._id, "present")}
            >
              დაესწრო
            </button>
            <button className={marks[s._id] === "absent" ? "is-active" : ""} onClick={() => mark(s._id, "absent")}>
              აცდა
            </button>
          </div>
        ))}
    </div>
  );
}
