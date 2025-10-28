import './App.css'
import AuthSystem from './components/LoginPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TalentFlowLanding from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import HRDashboard from './components/HRDashboard';
import CandidateDashboard from './components/CandidateDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TalentFlowLanding />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

        <Route path="/login-signup" element={<AuthSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
