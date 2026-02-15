import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 20, background: "#f4f6f9" }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
