import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  // 1. टोकन और रोल निकालो
  const token = localStorage.getItem("access") || localStorage.getItem("access_token");
  const rawRole = localStorage.getItem("role") || "";
  const userRole = rawRole.replace(/['"]/g, "").trim().toUpperCase();

  // 2. अगर यूज़र लॉगिन ही नहीं है, तो सीधा Login पेज पर भेजो
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. अगर इस पेज पर जाने के लिए कुछ खास Roles की ही परमिशन है
  if (allowedRoles && allowedRoles.length > 0) {
    // अगर यूज़र का रोल Allowed लिस्ट में नहीं है (Access Denied)
    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access Denied! ${userRole} cannot access this page.`);
      // उसे वापस उसके डैशबोर्ड पर फेंक दो
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 4. अगर सब सही है, तो पेज दिखा दो
  return children;
}