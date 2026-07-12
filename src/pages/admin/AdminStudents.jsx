import { useEffect, useState } from "react";
import api from "../../services/api";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "", phone: "", age: "" };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    api.get("/admin/students").then((res) => setStudents(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/admin/students", form);
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/admin/students/${id}`);
    load();
  }

  return (
    <div className="admin-students">
      <h1>სტუდენტის დამატება</h1>
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
        <input placeholder="ტელეფონი" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input
          type="number"
          placeholder="ასაკი"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <button type="submit">დამატება</button>
      </form>

      <h1>სტუდენტები</h1>
      <table>
        <thead>
          <tr>
            <th>სახელი</th>
            <th>ელფოსტა</th>
            <th>სტატუსი</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>
                {s.firstName} {s.lastName}
              </td>
              <td>{s.email}</td>
              <td>{s.status}</td>
              <td>
                <button onClick={() => handleDelete(s._id)}>წაშლა</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
