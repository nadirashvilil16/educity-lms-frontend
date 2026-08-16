import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { getGroupStudents, listGroupLectures, createLecture, markAttendance } from "../../services/teacher.service";
import { TeacherSidebar, TeacherState } from "../../components/teacher/TeacherSidebar";

const formatDate = (value) => new Date(value).toLocaleDateString("ka-GE");

export default function TeacherAttendance() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const dashboard = useTeacherDashboard(user);
  const [students, setStudents] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGroupStudents(groupId), listGroupLectures(groupId)]).then(([studentsData, lecturesData]) => {
      setStudents(studentsData);
      setLectures(lecturesData);
      setLoading(false);
    });
  }, [groupId]);

  async function handleCreateTodayLecture() {
    const lecture = await createLecture(groupId, { date: new Date().toISOString(), title: "ლექცია" });
    setLectures((prev) => [...prev, lecture]);
    setSelectedLectureId(lecture._id);
  }

  async function handleMark(studentId, status) {
    await markAttendance({ lectureId: selectedLectureId, studentId, status });
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  if (dashboard.loading && !dashboard.data) return <TeacherState message="იტვირთება..." />;
  if (dashboard.error || !dashboard.data) return <TeacherState message="მონაცემები ვერ ჩაიტვირთა." />;

  const group = dashboard.data.groups.find((g) => g._id === groupId);

  return (
    <main className="student-dashboard">
      <TeacherSidebar teacher={dashboard.data.teacher} groupCount={dashboard.data.groups.length} pendingGradingCount={dashboard.data.pendingGradingCount} />
      <div className="student-dashboard__content">
        <div className="student-dashboard__workspace">
          <h1 className="student-page-title">{group?.name || "ჯგუფი"} — დასწრება</h1>

          <div className="attendance-picker">
            <select value={selectedLectureId} onChange={(e) => setSelectedLectureId(e.target.value)}>
              <option value="">-- აირჩიე ლექცია --</option>
              {lectures.map((l) => (
                <option key={l._id} value={l._id}>{formatDate(l.date)} {l.title}</option>
              ))}
            </select>
            <button type="button" onClick={handleCreateTodayLecture}>+ დღევანდელი ლექცია</button>
          </div>

          {!loading && selectedLectureId && (
            <div className="teacher-attendance-list">
              {students.map((s) => (
                <div className="teacher-attendance-row" key={s._id}>
                  <strong>{s.firstName} {s.lastName}</strong>
                  <div className="teacher-attendance-row__buttons">
                    <button type="button" className={marks[s._id] === "present" ? "is-active is-present" : ""} onClick={() => handleMark(s._id, "present")}>დაესწრო</button>
                    <button type="button" className={marks[s._id] === "absent" ? "is-active is-absent" : ""} onClick={() => handleMark(s._id, "absent")}>გააცდინა</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !selectedLectureId && <p className="student-tasks__empty">აირჩიეთ ან შექმენით ლექცია დასწრების მოსანიშნად</p>}
        </div>
      </div>
    </main>
  );
}
