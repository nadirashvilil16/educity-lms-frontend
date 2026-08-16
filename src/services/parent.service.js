import api from "./api";

const STORAGE_KEY = "educity_parent_selected_group";

export function getSelectedGroupId() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setSelectedGroupId(groupId) {
  if (groupId) localStorage.setItem(STORAGE_KEY, groupId);
  else localStorage.removeItem(STORAGE_KEY);
}

function withGroupParams() {
  const groupId = getSelectedGroupId();
  return groupId ? { groupId } : {};
}

export async function listEnrollments({ signal } = {}) {
  const { data } = await api.get("/parent/enrollments", { signal });
  return data;
}

export async function getDashboard({ signal } = {}) {
  const { data } = await api.get("/parent/dashboard", { signal, params: withGroupParams() });
  return data;
}

export async function getAttendance({ signal } = {}) {
  const { data } = await api.get("/parent/attendance", { signal, params: withGroupParams() });
  return data;
}

export async function getAssignments({ signal } = {}) {
  const { data } = await api.get("/parent/assignments", { signal, params: withGroupParams() });
  return data;
}

export async function getGrades({ signal } = {}) {
  const { data } = await api.get("/parent/grades", { signal, params: withGroupParams() });
  return data;
}
