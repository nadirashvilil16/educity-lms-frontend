import api from "./api";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
export function resolveFileUrl(fileUrl) {
  if (!fileUrl) return null;
  return fileUrl.startsWith("http") ? fileUrl : `${API_ORIGIN}${fileUrl}`;
}

export async function getDashboard({ signal } = {}) {
  const { data } = await api.get("/teacher/dashboard", { signal });
  return data;
}

export async function listGroups({ signal } = {}) {
  const { data } = await api.get("/teacher/groups", { signal });
  return data;
}

export async function getGroupStudents(groupId, { signal } = {}) {
  const { data } = await api.get(`/teacher/groups/${groupId}/students`, { signal });
  return data;
}

export async function listGroupLectures(groupId, { signal } = {}) {
  const { data } = await api.get(`/teacher/groups/${groupId}/lectures`, { signal });
  return data;
}

export async function createLecture(groupId, { date, title }) {
  const { data } = await api.post(`/teacher/groups/${groupId}/lectures`, { date, title });
  return data;
}

export async function markAttendance({ lectureId, studentId, status }) {
  const { data } = await api.post("/teacher/attendance", { lectureId, studentId, status });
  return data;
}

export async function listAssignments({ signal } = {}) {
  const { data } = await api.get("/teacher/assignments", { signal });
  return data;
}

export async function createAssignment({ groupId, title, description, dueDate }) {
  const { data } = await api.post("/teacher/assignments", { groupId, title, description, dueDate });
  return data;
}

export async function listSubmissions(assignmentId, { signal } = {}) {
  const { data } = await api.get(`/teacher/assignments/${assignmentId}/submissions`, { signal });
  return data;
}

export async function listPendingSubmissions({ signal } = {}) {
  const { data } = await api.get("/teacher/submissions/pending", { signal });
  return data;
}

export async function gradeSubmission(assignmentId, submissionId, { status, score, comment }) {
  const { data } = await api.put(`/teacher/assignments/${assignmentId}/submissions/${submissionId}`, { status, score, comment });
  return data;
}
