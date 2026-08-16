import api from "./api";

export async function getDashboard({ signal } = {}) {
  const [dashboardResult, assignmentsResult] = await Promise.allSettled([
    api.get("/student/dashboard", { signal }),
    api.get("/student/assignments", { signal }),
  ]);

  if (dashboardResult.status === "rejected") throw dashboardResult.reason;

  return {
    ...dashboardResult.value.data,
    assignments: assignmentsResult.status === "fulfilled" ? assignmentsResult.value.data : [],
  };
}

export async function getGrades({ signal } = {}) {
  const { data } = await api.get("/student/grades", { signal });
  return data;
}

export async function updateProfile({ firstName, lastName, avatar } = {}) {
  const formData = new FormData();
  if (firstName) formData.append("firstName", firstName);
  if (lastName) formData.append("lastName", lastName);
  if (avatar) formData.append("avatar", avatar);

  const { data } = await api.patch("/student/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function submitAssignment(assignmentId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(`/student/assignments/${assignmentId}/submit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
