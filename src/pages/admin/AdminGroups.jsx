import { useEffect, useState } from "react";
import api from "../../services/api";

const EMPTY_FORM = { name: "", courseId: "", teacherId: "" };

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    api.get("/admin/groups").then((res) => setGroups(res.data));
    api.get("/admin/courses").then((res) => setCourses(res.data));
    api.get("/admin/teachers").then((res) => setTeachers(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/admin/groups", form);
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/admin/groups/${id}`);
    load();
  }

  return (
    <div className="admin-groups">
      <h1>ჯგუფის დამატება</h1>
      <form onSubmit={handleCreate}>
        <input
          placeholder="ჯგუფის სახელი"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
          <option value="">-- კურსი --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} required>
          <option value="">-- ლექტორი --</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <button type="submit">დამატება</button>
      </form>

      <h1>ჯგუფები</h1>
      <table>
        <thead>
          <tr>
            <th>სახელი</th>
            <th>სტუდენტები</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g._id}>
              <td>{g.name}</td>
              <td>{g.studentIds.length}</td>
              <td>
                <button onClick={() => handleDelete(g._id)}>წაშლა</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
