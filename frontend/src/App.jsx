import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

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
import SystemConfig from './pages/SystemConfig';
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
import AccessLogs from './pages/AccessLogs';
import UserManager from './pages/UserManager'; 
import VirtualSpace from './pages/VirtualSpace'; 
import Timetable from "./pages/Timetable"; 
import Communication from "./pages/Communication";
import AIBrain from "./pages/AIBrain"; // ✅ 1. IMPORT ADDED

// Components
import ChatWidget from './components/ChatWidget';

// Security Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Admin Engine */}
          <Route path="/institutions" element={<ProtectedRoute><Institutions /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><ServiceMaster /></ProtectedRoute>} />
          
          {/* Access & Logs Section */}
          <Route path="/access-logs" element={<ProtectedRoute><AccessLogs /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManager /></ProtectedRoute>} />

          {/* School Ops */}
          <Route path="/visitors" element={<ProtectedRoute><Visitors /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          
          <Route path="/admissions" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
          
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />

          {/* Virtual Space */}
          <Route path="/virtual-space" element={<ProtectedRoute><VirtualSpace /></ProtectedRoute>} />

          {/* Academic Hub */}
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/homework" element={<ProtectedRoute><Homework /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />

          {/* Finance Room */}
          <Route path="/fees" element={<ProtectedRoute><FeesLedger /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />

          {/* Resources */}
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute><Hostel /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          
          <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />

          {/* Control Room */}
          <Route path="/system" element={<ProtectedRoute><SystemConfig /></ProtectedRoute>} />
          
          {/* ✅ 2. ROUTE ADDED HERE */}
          <Route path="/ai-brain" element={<ProtectedRoute><AIBrain /></ProtectedRoute>} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}