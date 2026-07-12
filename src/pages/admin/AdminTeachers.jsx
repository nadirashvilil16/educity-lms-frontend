import { useEffect, useState } from "react";
import api from "../../services/api";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "" };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    api.get("/admin/teachers").then((res) => setTeachers(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/admin/teachers", form);
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/admin/teachers/${id}`);
    load();
  }

  return (
    <div className="admin-teachers">
      <h1>ლექტორის დამატება</h1>
      <form onSubmit={handleCreate}>
        <input
          placeholder="სახელი"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
        <input
          placeholder="გვარი"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="ელფოსტა"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="დროებითი პაროლი"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">დამატება</button>
      </form>

      <h1>ლექტორები</h1>
      <table>
        <thead>
          <tr>
            <th>სახელი</th>
            <th>ელფოსტა</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t._id}>
              <td>
                {t.firstName} {t.lastName}
              </td>
              <td>{t.email}</td>
              <td>
                <button onClick={() => handleDelete(t._id)}>წაშლა</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
