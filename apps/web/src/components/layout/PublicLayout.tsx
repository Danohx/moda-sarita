import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import Footer from "@shared/components/layout/Footer";

const PublicLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar />
      <main style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;