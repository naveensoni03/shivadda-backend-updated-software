import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";
import DashboardCard from "../components/DashboardCard";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => alert("Dashboard load failed"));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: "220px",
        background: "#0d6efd",
        color: "#fff",
        padding: "20px"
      }}>
        <h3>CRM Panel</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>Dashboard</li>
          <li>Agents</li>
          <li>Leads</li>
          <li>Logout</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "30px", background: "#f6f8fb" }}>
        <h2>{data.role} Dashboard</h2>

        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}>
          <DashboardCard title="Total Users" value={data.total_users} />
          <DashboardCard title="Total Agents" value={data.total_agents} />
          <DashboardCard title="Active Agents" value={data.active_agents} />
          <DashboardCard title="Today" value={data.today} />
        </div>
      </main>

    </div>
  );
};

export default Dashboard;
