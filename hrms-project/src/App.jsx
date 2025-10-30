import './App.css'
import AuthSystem from './pages/LoginPage'
import JobCreater from './pages/JobCreater'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TalentFlowLanding from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

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
      </Routes>
    </Router>
  );
}

export default App;
