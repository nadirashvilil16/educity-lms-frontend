import { useEffect, useState } from "react";
import api from "../../services/api";

const EMPTY_FORM = { name: "", description: "", durationWeeks: "", totalLectures: "" };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    api.get("/admin/courses").then((res) => setCourses(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/admin/courses", form);
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/admin/courses/${id}`);
    load();
  }

  return (
    <div className="admin-courses">
      <h1>კურსის დამატება</h1>
      <form onSubmit={handleCreate}>
        <input
          placeholder="კურსის სახელი"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="აღწერა"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="ხანგრძლივობა (კვირა)"
          value={form.durationWeeks}
          onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
        />
        <input
          type="number"
          placeholder="ლექციების რაოდენობა"
          value={form.totalLectures}
          onChange={(e) => setForm({ ...form, totalLectures: e.target.value })}
          required
        />
        <button type="submit">დამატება</button>
      </form>

      <h1>კურსები</h1>
      <table>
        <thead>
          <tr>
            <th>სახელი</th>
            <th>ლექციები</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.totalLectures}</td>
              <td>
                <button onClick={() => handleDelete(c._id)}>წაშლა</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
