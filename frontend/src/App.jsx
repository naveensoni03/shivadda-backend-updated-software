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
import GlobalSettings from "./pages/GlobalSettings";
import RecycleBin from "./pages/RecycleBin";

// 👑 SUPER ADMIN PORTAL IMPORT
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";

// 💳 PAYMENT MODULE IMPORTS
import ServiceCatalog from "./pages/ServiceCatalog";
import PaymentAccounts from "./pages/PaymentAccounts";
import TeacherSalaryAdmin from "./pages/TeacherSalaryAdmin";
import StudentAccount from "./pages/student/StudentAccount";
import TeacherAccount from "./pages/Teachers/TeacherAccount";

// 📰 PUBLIC PORTAL IMPORTS
import NewsPortal from "./pages/NewsPortal";

// 🎓 STUDENT PORTAL IMPORTS
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/Dashboard";
import MyCourses from "./pages/student/MyCourses";
import StudentExams from "./pages/student/Exams";
import StudentTimetable from "./pages/student/Timetable";
import StudentProfile from "./pages/student/Profile";
import StudentCourseSpace from "./pages/student/StudentCourseSpace";
import StudentAssignments from "./pages/student/StudentAssignments";
import TakeExam from "./pages/student/TakeExam";
// 🔥 NAYA IMPORT: Student Fees
import StudentFees from "./pages/student/Fees";

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

// 👨‍👩‍👧 PARENT PORTAL IMPORTS 
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentLogin from "./pages/parent/ParentLogin";
import ParentFees from "./pages/parent/ParentFees";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentExams from "./pages/parent/ParentExams";
import ParentCommunication from "./pages/parent/ParentCommunication";
import ParentSettings from "./pages/parent/ParentSettings";

// Components
import ChatWidget from "./components/ChatWidget";

// 🔐 ADVANCED ROLE-BASED SECURITY GUARD (STRICT & BULLETPROOF MODE)
const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. Fetch Token and Role dynamically
  const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token") || localStorage.getItem("access");
  const rawRole = sessionStorage.getItem("user_role") || localStorage.getItem("user_role") || localStorage.getItem("role") || "";

  // 🔥 SUPREME FIX: Quotes हटाओ और बीच के "Space" को "Underscore" (_) में बदल दो!
  // इससे "SUPER ADMIN" और "SUPER_ADMIN" दोनों एक ही बन जाएंगे।
  const userRole = rawRole.replace(/['"]/g, "").replace(/\s+/g, "_").trim().toUpperCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Format allowed roles to match UPPERCASE and Underscores
  const safeAllowedRoles = allowedRoles.map(role => role.replace(/\s+/g, "_").toUpperCase().trim());

  // 3. Strict Check
  if (!safeAllowedRoles.includes(userRole)) {
    console.warn(`🛡️ Access Denied! Role "${userRole}" tried to access a restricted route.`);

    // Strict Role Redirects (Koi kisi dusre ke portal me nahi jayega)
    if (userRole === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    if (userRole === "TEACHER" || userRole === "HOD") return <Navigate to="/teacher/dashboard" replace />;
    if (userRole === "PARENT") return <Navigate to="/parent/dashboard" replace />;

    // Default for Management / Staff / Security
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  // 🚀 NEW ARCHITECTURE ROLE GROUPS
  const ADMIN_ONLY = ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN"];
  const ACADEMIC_STAFF = ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN", "HOD", "TEACHER"];
  const FINANCE_ROLES = ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN"];
  const FRONT_OFFICE = ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN", "SECURITY", "STAFF"];
  const STAFF_ALL = ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN", "HOD", "TEACHER", "SECURITY", "STAFF", "AGENT"];

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Toaster position="top-right" />
        <Routes>

          {/* 🌐 Public Routes */}
          <Route path="/news" element={<NewsPortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/parent/login" element={<ParentLogin />} />

          {/* 🏠 Default Protected Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ==========================================
              🏢 MAIN ADMIN/STAFF PROTECTED ROUTES 
          ============================================= */}
          <Route path="/superadmin/master-data" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><SuperAdminDashboard /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Dashboard /></ProtectedRoute>} />
          <Route path="/institutions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Institutions /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Locations /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceMaster /></ProtectedRoute>} />
          <Route path="/access-logs" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AccessLogs /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><UserManager /></ProtectedRoute>} />
          <Route path="/system" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><SystemConfig /></ProtectedRoute>} />
          <Route path="/ai-brain" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AIBrain /></ProtectedRoute>} />

          {/* Security Guard can access Visitors */}
          <Route path="/visitors" element={<ProtectedRoute allowedRoles={FRONT_OFFICE}><Visitors /></ProtectedRoute>} />

          <Route path="/teachers" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Teachers /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Agents /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Students /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Enrollments /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Courses /></ProtectedRoute>} />
          <Route path="/virtual-space" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><VirtualSpace /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Attendance /></ProtectedRoute>} />
          <Route path="/homework" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Homework /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Exams /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Timetable /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FeesLedger /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><Payroll /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute allowedRoles={STAFF_ALL}><Hostel /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Inventory /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute allowedRoles={ACADEMIC_STAFF}><Communication /></ProtectedRoute>} />
          <Route path="/global-settings" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><GlobalSettings /></ProtectedRoute>} />
          <Route path="/recycle-bin" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><RecycleBin /></ProtectedRoute>} />

          {/* 💳 PAYMENT MODULE ROUTES */}
          <Route path="/service-catalog" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceCatalog /></ProtectedRoute>} />
          <Route path="/payment-accounts" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><PaymentAccounts /></ProtectedRoute>} />
          <Route path="/teacher-salary" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><TeacherSalaryAdmin /></ProtectedRoute>} />

          {/* ==========================================
              🎓 STUDENT PORTAL PROTECTED ROUTES 
          ============================================= */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/course-space/:courseId" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentCourseSpace /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["STUDENT"]}><MyCourses /></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentTimetable /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentExams /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/exam/:id" element={<ProtectedRoute allowedRoles={["STUDENT"]}><TakeExam /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentFees /></ProtectedRoute>} />
          <Route path="/student/account" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAccount /></ProtectedRoute>} />

          {/* ==========================================
              👩‍🏫 TEACHER PORTAL PROTECTED ROUTES 
          ============================================= */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["TEACHER", "HOD"]}>
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
            <Route path="account" element={<TeacherAccount />} />
            <Route path="settings" element={<TeacherSettings />} />
          </Route>

          {/* ==========================================
              👨‍👩‍👧 PARENT PORTAL PROTECTED ROUTES 
          ============================================= */}
          <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={["PARENT"]}><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/children" element={<ProtectedRoute allowedRoles={["PARENT"]}><ParentChildren /></ProtectedRoute>} />
          <Route path="/parent/fees" element={<ProtectedRoute allowedRoles={["PARENT"]}><ParentFees /></ProtectedRoute>} />
          <Route path="/parent/exams" element={<ProtectedRoute allowedRoles={["PARENT"]}><ParentExams /></ProtectedRoute>} />
          <Route path="/parent/messages" element={<ProtectedRoute allowedRoles={["PARENT"]}><ParentCommunication /></ProtectedRoute>} />
          <Route path="/parent/settings" element={<ProtectedRoute allowedRoles={["PARENT"]}><ParentSettings /></ProtectedRoute>} />

        </Routes>
        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}