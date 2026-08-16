import api from "./api";

const STORAGE_KEY = "educity_selected_group";

export async function listEnrollments({ signal } = {}) {
  const { data } = await api.get("/student/enrollments", { signal });
  return data;
}

export function getSelectedGroupId() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setSelectedGroupId(groupId) {
  if (groupId) localStorage.setItem(STORAGE_KEY, groupId);
  else localStorage.removeItem(STORAGE_KEY);
}
