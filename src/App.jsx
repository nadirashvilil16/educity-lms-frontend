import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";

import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentGrades from "./pages/student/StudentGrades";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherGroups from "./pages/teacher/TeacherGroups";
import TeacherGroupDetail from "./pages/teacher/TeacherGroupDetail";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherAssignmentDetail from "./pages/teacher/TeacherAssignmentDetail";
import TeacherPendingSubmissions from "./pages/teacher/TeacherPendingSubmissions";

import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentAssignments from "./pages/parent/ParentAssignments";
import ParentGrades from "./pages/parent/ParentGrades";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/groups"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/groups/:groupId"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherGroupDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance/:groupId"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/:assignmentId"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAssignmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/grading"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherPendingSubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/attendance"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/assignments"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/grades"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentGrades />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
