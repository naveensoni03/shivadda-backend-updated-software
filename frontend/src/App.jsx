import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages Import
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Enrollments from "./pages/Enrollments";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Attendance from "./pages/Attendance";
import Institutions from "./pages/Institutions";
import Teachers from "./pages/Teachers";
import FeesLedger from "./pages/FeesLedger";
import SystemConfig from "./pages/SystemConfig";
import Exams from "./pages/Exams";
import Homework from "./pages/Homework"; // ✅ Ek hi baar import rakha hai
import Library from "./pages/Library";
import Transport from "./pages/Transport";
import Hostel from "./pages/Hostel";
import Inventory from "./pages/Inventory";
import Payroll from "./pages/Payroll";
import Visitors from "./pages/Visitors";
import Agents from "./pages/Agents";
import Locations from "./pages/Locations";
import ServiceMaster from "./pages/ServiceMaster";
import AccessLogs from "./pages/AccessLogs";
import UserManager from "./pages/UserManager";
import VirtualSpace from "./pages/VirtualSpace";
import Timetable from "./pages/Timetable";
import Communication from "./pages/Communication";
import AIBrain from "./pages/AIBrain";
import GlobalSettings from "./pages/GlobalSettings";
import RecycleBin from "./pages/RecycleBin";

// 🎓 STUDENT PORTAL IMPORTS
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/Dashboard";
import MyCourses from "./pages/student/MyCourses";
import StudentExams from "./pages/student/Exams";
import StudentTimetable from "./pages/student/Timetable";
import StudentProfile from "./pages/student/Profile";
import StudentCourseSpace from "./pages/student/StudentCourseSpace";

// 👩‍🏫 TEACHER PORTAL IMPORTS
import TeacherLogin from "./pages/Teachers/TeacherLogin";
import TeacherDashboard from "./pages/Teachers/Dashboard";
import TeacherLayout from "./pages/Teachers/TeacherLayout";
import TeacherMaterial from "./pages/Teachers/TeacherMaterial";
import TeacherClasses from "./pages/Teachers/TeacherClasses";
import TeacherExams from "./pages/Teachers/Exams";
import TeacherAssignments from "./pages/Teachers/TeacherAssignments";
import TeacherStudents from "./pages/Teachers/TeacherStudents";
import TeacherMailbox from "./pages/Teachers/TeacherMailbox";
import TeacherFees from "./pages/Teachers/Fees";
import TeacherSettings from "./pages/Teachers/TeacherSettings";

// Components
import ChatWidget from "./components/ChatWidget";

// 🔐 ADVANCED ROLE-BASED SECURITY GUARD
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  let rawRole = localStorage.getItem("user_role") || "Super Admin";

  rawRole = rawRole.replace(/['"]/g, "").trim();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = rawRole.toLowerCase();
  const safeAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());

  if (!safeAllowedRoles.includes(userRole)) {
    console.warn(`🛡️ Access Denied! Role "${rawRole}" tried to access a restricted route.`);

    if (userRole === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    if (userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  const STAFF_ALL = ["Super Admin", "Admin", "Teacher", "Accountant", "Receptionist"];
  const ADMIN_ONLY = ["Super Admin", "Admin"];
  const FINANCE_ROLES = ["Super Admin", "Admin", "Accountant"];
  const ACADEMIC_STAFF = ["Super Admin", "Admin", "Teacher"];

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Toaster position="top-right" />
        <Routes>

          {/* 🌐 Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* 🏠 Default Protected Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ==========================================
              🏢 MAIN ADMIN/STAFF PROTECTED ROUTES 
          ============================================= */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Dashboard /></ProtectedRoute>} />

          <Route path="/institutions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Institutions /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Locations /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceMaster /></ProtectedRoute>} />
          <Route path="/access-logs" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AccessLogs /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><UserManager /></ProtectedRoute>} />
          <Route path="/system" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><SystemConfig /></ProtectedRoute>} />
          <Route path="/ai-brain" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AIBrain /></ProtectedRoute>} />

          <Route path="/visitors" element={<ProtectedRoute allowedRoles={["Super Admin", "Admin", "Receptionist"]}><Visitors /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Teachers /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Agents /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Students /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Enrollments /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Courses /></ProtectedRoute>} />

          <Route path="/virtual-space" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><VirtualSpace /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Attendance /></ProtectedRoute>} />

          {/* ✅ Homework Route strictly added once here */}
          <Route path="/homework" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Homework /></ProtectedRoute>} />

          <Route path="/exams" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Exams /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Timetable /></ProtectedRoute>} />

          <Route path="/fees" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FeesLedger /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><Payroll /></ProtectedRoute>} />

          <Route path="/library" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Hostel /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Inventory /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute allowedRoles={["Super Admin", "Admin", "Teacher"]}><Communication /></ProtectedRoute>} />
          <Route path="/global-settings" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><GlobalSettings /></ProtectedRoute>} />
          <Route path="/recycle-bin" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><RecycleBin /></ProtectedRoute>} />

          {/* ==========================================
              🎓 STUDENT PORTAL PROTECTED ROUTES 
          ============================================= */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["Student", "Super Admin"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/course-space/:courseId" element={<ProtectedRoute allowedRoles={["Student", "Super Admin"]}><StudentCourseSpace /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["Student", "Super Admin"]}><MyCourses /></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={["Student", "Super Admin"]}><StudentTimetable /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute allowedRoles={["Student", "Super Admin"]}><StudentExams /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["Student", "Super Admin"]}><StudentProfile /></ProtectedRoute>} />

          {/* ==========================================
              👩‍🏫 TEACHER PORTAL PROTECTED ROUTES 
          ============================================= */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["Teacher", "Super Admin"]}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="material" element={<TeacherMaterial />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="mailbox" element={<TeacherMailbox />} />
            <Route path="messages" element={<TeacherMailbox />} />
            <Route path="fees" element={<TeacherFees />} />
            <Route path="wallet" element={<TeacherFees />} />
            <Route path="settings" element={<TeacherSettings />} />
          </Route>

        </Routes>

        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}