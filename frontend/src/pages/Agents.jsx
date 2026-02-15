import { useEffect, useState } from "react";
import api from "../api/axios";
import "./agents.css";
import Sidebar from "../components/Sidebar";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAgents = async () => {
    try {
      const res = await api.get("/agents/");
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const addAgent = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    await api.post("/agents/", { name, email });
    setName("");
    setEmail("");
    loadAgents();
  };

  const toggleStatus = async (id) => {
    await api.patch(`/agents/${id}/status/`);
    loadAgents();
  };

  return (
    <div style={{ display: "flex" }}>
      {/* ✅ COMMON SIDEBAR */}
      <Sidebar />

      {/* ✅ MAIN CONTENT */}
      <div className="agents-page" style={{ flex: 1 }}>
        <h1 className="page-title">Agents Management</h1>
        <p className="page-subtitle">
          Create, manage & control agent access
        </p>

        {/* Add Agent */}
        <div className="card agent-form-card">
          <form className="agent-form" onSubmit={addAgent}>
            <input
              placeholder="Agent Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              placeholder="Agent Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Add Agent</button>
          </form>
        </div>

        {/* Agents Table */}
        <div className="card">
          {loading ? (
            <p className="loading-text">Loading agents...</p>
          ) : agents.length === 0 ? (
            <p className="empty-text">
              No agents found. Add your first agent.
            </p>
          ) : (
            <table className="agents-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a, i) => (
                  <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>
                      <span
                        className={
                          a.is_active ? "status active" : "status inactive"
                        }
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="toggle-btn"
                        onClick={() => toggleStatus(a.id)}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
