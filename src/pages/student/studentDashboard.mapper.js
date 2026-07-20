const numberOr = (value, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;
const asArray = (value) => (Array.isArray(value) ? value : []);

function normalizeLecture(lecture) {
  if (!lecture) return null;
  return {
    id: lecture._id || lecture.id || "next-lecture",
    title:
      lecture.title || lecture.courseName || lecture.course?.title || "ლექცია",
    topic: lecture.topic || lecture.description || "თემა არ არის მითითებული",
    date: lecture.date || lecture.startsAt || null,
  };
}

function normalizeAssignment(assignment) {
  return {
    id: assignment._id || assignment.id,
    number: assignment.number || assignment.order || assignment.sequence || null,
    title: assignment.title || "დავალება",
    description: assignment.description || "აღწერა არ არის მითითებული",
    dueDate: assignment.dueDate || assignment.deadline || null,
    submission: assignment.submission || null,
    allowedFileTypes: assignment.allowedFileTypes || ["PDF", "PNG", "DRIVE"],
  };
}

export function mapStudentDashboard(payload = {}, sessionUser = null) {
  const lectures = asArray(payload.lectures)
    .map(normalizeLecture)
    .filter(Boolean);
  const nextLecture =
    normalizeLecture(payload.nextLecture) || lectures[0] || null;
  const assignments = asArray(payload.assignments).map(normalizeAssignment);
  const attendance = payload.attendance || {};
  const progress = payload.progress || {};

  return {
    student: {
      firstName:
        payload.firstName ||
        payload.student?.firstName ||
        sessionUser?.firstName ||
        "სტუდენტი",
      lastName:
        payload.lastName ||
        payload.student?.lastName ||
        sessionUser?.lastName ||
        "",
    },
    attendance: {
      percentage: numberOr(attendance.percentage),
      attended: numberOr(attendance.attended),
      held: numberOr(attendance.held),
    },
    progress: {
      percentage: numberOr(progress.percentage),
      completed: numberOr(progress.completed),
      total: numberOr(progress.total),
    },
    nextLecture,
    previousLectureDate: payload.previousLecture?.date || payload.previousLectureDate || null,
    lectures,
    assignments,
    latestAssignment: assignments[0] || null,
    recentGrade:
      assignments.find((item) => item.submission?.score != null) || null,
    tasks: asArray(payload.tasks),
  };
}

export const studentDashboardPreview = {
  firstName: "ანა",
  lastName: "ახმეტელი",
  attendance: { percentage: 87.5, attended: 16, held: 18 },
  progress: { percentage: 66, completed: 16, total: 24 },
  nextLecture: {
    _id: "lecture-1",
    title: "UI/UX დიზაინი",
    topic: "აპლიკაციის ინტერფეისი დიზაინი",
    date: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
  },
  lectures: [
    {
      _id: "lecture-1",
      title: "UI/UX დიზაინი",
      topic: "აპლიკაციის ინტერფეისი დიზაინი",
      date: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    },
    { _id: "lecture-2", title: "UI/UX დიზაინი", date: "2026-07-21T17:00:00" },
    { _id: "lecture-3", title: "UI/UX დიზაინი", date: "2026-07-23T17:00:00" },
  ],
  previousLectureDate: "2026-07-14T17:00:00",
  assignments: [
    {
      _id: "assignment-5",
      number: 5,
      title: "dashboard UX wireframe",
      description: "შექმენით სტუდენტის დემო-გვერდის სტრუქტურა",
      dueDate: "2026-07-21",
      allowedFileTypes: ["PDF", "PNG", "DRIVE"],
    },
    {
      _id: "assignment-4",
      number: 6,
      title: "Color Palette & Typography",
      submission: { status: "graded", score: 8 },
    },
  ],
  tasks: [
    { _id: "task-1", title: "RAGHAC TASKI", completed: false },
    { _id: "task-2", title: "RAGHAC TASKI", completed: true },
  ],
};
