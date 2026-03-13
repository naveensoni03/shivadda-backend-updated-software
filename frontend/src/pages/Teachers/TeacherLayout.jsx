import React from "react";
import { Outlet } from "react-router-dom";
import SidebarTeacher from "./SidebarTeacher";

export default function TeacherLayout() {
    return (
        <div style={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            {/* Sidebar Component */}
            <SidebarTeacher />

            {/* Main Content Area */}
            <div
                style={{ flex: 1, marginLeft: "260px", padding: "30px", overflowY: "auto" }}
                className="teacher-main-content"
            >
                {/* Yahan par Dashboard ya doosre pages load honge */}
                <Outlet />
            </div>

            {/* Mobile Responsiveness */}
            <style>{`
                @media (max-width: 900px) {
                    .teacher-main-content {
                        margin-left: 0 !important;
                        padding-top: 60px !important;
                    }
                }
            `}</style>
        </div>
    );
}