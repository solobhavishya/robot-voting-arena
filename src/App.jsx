import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentView from "./pages/StudentView";
import ProjectorView from "./pages/ProjectorView";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  
  // Notice we removed seedDatabase() from here!
  // It will no longer reset your database every time you refresh.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentView />} />
        <Route path="/projector" element={<ProjectorView />} />
        <Route path="/admin-secret-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}