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
import Homework from "./pages/Homework";
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

// 🎓 STUDENT PORTAL IMPORTS
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/Dashboard";
import MyCourses from "./pages/student/MyCourses";
import StudentExams from "./pages/student/Exams";
import StudentTimetable from "./pages/student/Timetable";
import StudentProfile from "./pages/student/Profile";
import StudentCourseSpace from "./pages/student/StudentCourseSpace";

// Components
import ChatWidget from "./components/ChatWidget";

// 🔐 PHASE 8: ADVANCED ROLE-BASED SECURITY GUARD (BULLETPROOF FIX 2.0)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  let rawRole = localStorage.getItem("user_role") || "Super Admin";

  // 🚀 THE MASTER FIX: LocalStorage se aane wale extra quotes ("") ko remove karna
  rawRole = rawRole.replace(/['"]/g, "").trim();

  // 1. Token Check
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role Check (Sabko lower case mein match karna)
  const userRole = rawRole.toLowerCase();
  const safeAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());

  if (!safeAllowedRoles.includes(userRole)) {
    console.warn(`🛡️ Access Denied! Role "${rawRole}" tried to access a route restricted to:`, allowedRoles);

    // 🧠 SMART REDIRECT: Agar student hai toh uske dashboard bhejo, warna main dashboard
    if (userRole === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  // 🛡️ ROLE DEFINITIONS FIX: Student ko Staff roles se alag kar diya
  const STAFF_ALL = ["Super Admin", "Admin", "Teacher", "Accountant", "Receptionist"];
  const ADMIN_ONLY = ["Super Admin", "Admin"];
  const FINANCE_ROLES = ["Super Admin", "Admin", "Accountant"];
  const ACADEMIC_STAFF = ["Super Admin", "Admin", "Teacher"]; // Notice: Removed "Student" from here

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Toaster position="top-right" />
        <Routes>

          {/* 🌐 Public Route */}
          <Route path="/login" element={<Login />} />

          {/* 🎓 Student Portal Public Route */}
          <Route path="/student/login" element={<StudentLogin />} />

          {/* 🏠 Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard - Accessible by STAFF only */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Dashboard /></ProtectedRoute>} />

          {/* ⚙️ Super Admin Engine (Strictly Admin Only) */}
          <Route path="/institutions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Institutions /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Locations /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceMaster /></ProtectedRoute>} />
          <Route path="/access-logs" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AccessLogs /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><UserManager /></ProtectedRoute>} />
          <Route path="/system" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><SystemConfig /></ProtectedRoute>} />
          <Route path="/ai-brain" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AIBrain /></ProtectedRoute>} />

          {/* 🏢 School Ops */}
          <Route path="/visitors" element={<ProtectedRoute allowedRoles={["Super Admin", "Admin", "Receptionist"]}><Visitors /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Teachers /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Agents /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Students /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Enrollments /></ProtectedRoute>} />

          {/* ✅ THE COURSE ROUTE */}
          <Route path="/courses" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Courses /></ProtectedRoute>} />

          {/* 💻 Virtual Space & Academics (Staff Only) */}
          <Route path="/virtual-space" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><VirtualSpace /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Attendance /></ProtectedRoute>} />
          <Route path="/homework" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Homework /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Exams /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Timetable /></ProtectedRoute>} />

          {/* 💰 Finance Room */}
          <Route path="/fees" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FeesLedger /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><Payroll /></ProtectedRoute>} />

          {/* 📚 Resources (Staff Only) */}
          <Route path="/library" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Hostel /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Inventory /></ProtectedRoute>} />

          <Route path="/communication" element={<ProtectedRoute allowedRoles={["Super Admin", "Admin", "Teacher"]}><Communication /></ProtectedRoute>} />

          {/* 🎓 STUDENT PORTAL PROTECTED ROUTES (Strictly Student & Super Admin) */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Student", "Super Admin"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Note: StudentCourseSpace is accessible by Student/SuperAdmin */}
          <Route
            path="/student/course-space/:courseId"
            element={
              <ProtectedRoute allowedRoles={["Student", "Super Admin"]}>
                <StudentCourseSpace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={["Student", "Super Admin"]}>
                <MyCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={["Student", "Super Admin"]}>
                <StudentTimetable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/exams"
            element={
              <ProtectedRoute allowedRoles={["Student", "Super Admin"]}>
                <StudentExams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["Student", "Super Admin"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

        </Routes>

        {/* Components that should be visible on all pages stay outside Routes */}
        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}