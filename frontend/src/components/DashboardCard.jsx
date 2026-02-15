const DashboardCard = ({ title, value }) => {
  return (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 8,
      width: 200,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
};

export default DashboardCard;
