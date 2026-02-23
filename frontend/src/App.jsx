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

// Components
import ChatWidget from "./components/ChatWidget";

// 🔐 PHASE 8: ADVANCED ROLE-BASED SECURITY GUARD (RBAC)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  
  // By default, assuming 'Super Admin' if no role is found so your testing doesn't break
  const userRole = localStorage.getItem("user_role") || "Super Admin"; 

  // 1. Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user has the permission to view this page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`Access Denied! ${userRole} tried to access a restricted route.`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  // Roles Dictionary for easy reading
  const ALL_ROLES = ["Super Admin", "Admin", "Teacher", "Student", "Accountant", "Receptionist"];
  const ADMIN_ONLY = ["Super Admin", "Admin"];
  const FINANCE_ROLES = ["Super Admin", "Admin", "Accountant"];
  const ACADEMIC_ROLES = ["Super Admin", "Admin", "Teacher", "Student"];

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Toaster position="top-right" />
        <Routes>
          
          {/* 🌐 Public Route */}
          <Route path="/login" element={<Login />} />

          {/* 🏠 Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard - Accessible by everyone */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Dashboard /></ProtectedRoute>} />
          
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
          <Route path="/students" element={<ProtectedRoute allowedRoles={ACADEMIC_ROLES}><Students /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Enrollments /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Courses /></ProtectedRoute>} />

          {/* 💻 Virtual Space & Academics (Teachers & Students can access) */}
          <Route path="/virtual-space" element={<ProtectedRoute allowedRoles={ACADEMIC_ROLES}><VirtualSpace /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={ACADEMIC_ROLES}><Attendance /></ProtectedRoute>} />
          <Route path="/homework" element={<ProtectedRoute allowedRoles={ACADEMIC_ROLES}><Homework /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={ACADEMIC_ROLES}><Exams /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={ACADEMIC_ROLES}><Timetable /></ProtectedRoute>} />

          {/* 💰 Finance Room (Strictly Admin & Accountant) */}
          <Route path="/fees" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FeesLedger /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><Payroll /></ProtectedRoute>} />

          {/* 📚 Resources */}
          <Route path="/library" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Hostel /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Inventory /></ProtectedRoute>} />
          
          <Route path="/communication" element={<ProtectedRoute allowedRoles={["Super Admin", "Admin", "Teacher"]}><Communication /></ProtectedRoute>} />

        </Routes>

        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}