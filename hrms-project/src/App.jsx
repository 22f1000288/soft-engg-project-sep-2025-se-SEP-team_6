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
import CandidateJobs from "./pages/CandidateJobs";
import CandidateApplications from "./pages/CandidateApplications";
import InterviewPrep from "./pages/InterviewPrep";
import KanbanBoard from "./pages/KanbanBoard";
import CandidateProfilePage from "./components/CandidateProfile";
import HRProfilePage from "./components/HRProfile";

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
        <Route path="/hr-jobs" element={<Jobs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/candidate-jobs" element={<CandidateJobs />} />
        <Route path="/candidate-applications" element={<CandidateApplications />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/kanban-board" element={<KanbanBoard />} />
        <Route path="/candidate-profile" element={<CandidateProfilePage />} />
        <Route path="/hr-profile" element={<HRProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
