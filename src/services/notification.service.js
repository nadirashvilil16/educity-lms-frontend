import api from "./api";

export async function listNotifications({ signal } = {}) {
  const { data } = await api.get("/notifications", { signal });
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
}
