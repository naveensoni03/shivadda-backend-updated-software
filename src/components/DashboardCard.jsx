const DashboardCard = ({ title, value }) => {
  return (
    <div style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      minWidth: "200px"
    }}>
      <h4 style={{ margin: 0, color: "#555" }}>{title}</h4>
      <h2 style={{ marginTop: "10px" }}>{value}</h2>
    </div>
  );
};

export default DashboardCard;
