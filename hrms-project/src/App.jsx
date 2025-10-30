import "./App.css";
import AuthSystem from "./pages/LoginPage";
import JobCreater from "./pages/JobCreater";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TalentFlowLanding from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import Candidates from "./pages/Candidates";
import Communications from "./pages/Communications";
import Jobs from "./pages/Jobs";
import Analytics from "./pages/Analytics";
import Schedule from "./pages/Schedule";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TalentFlowLanding />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

        <Route path="/login-signup" element={<AuthSystem />} />
        <Route path="/job-creator" element={<JobCreater />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/schedule" element={<Schedule />} />
      </Routes>
    </Router>
  );
}

export default App;
