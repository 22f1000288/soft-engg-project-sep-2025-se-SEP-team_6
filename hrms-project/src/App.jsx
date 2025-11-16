import "./App.css";
import AuthSystem from "./pages/LoginPage";
import { AuthProvider } from "./contexts/AuthContext";
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
import Applicants from "./pages/Applicants";
import CandidateJobs from "./pages/CandidateJobs";
import CandidateApplications from "./pages/CandidateApplications";
import InterviewPrep from "./pages/InterviewPrep";
import KanbanBoard from "./pages/KanbanBoard";
import CandidateProfilePage from "./components/CandidateProfile";
import HRProfilePage from "./components/HRProfile";
import PrivateRoute from "./components/PrivateRoute";
import { ROLE_ADMIN, ROLE_CANDIDATE, ROLE_HR } from "./constants/roles";
import InterviewBot from './pages/InterviewBot';

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<TalentFlowLanding />} />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute roles={[ROLE_ADMIN]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr-dashboard"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <HRDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate-dashboard"
          element={
            <PrivateRoute roles={[ROLE_CANDIDATE]}>
              <CandidateDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/login-signup" element={<AuthSystem />} />
        <Route
          path="/job-creator"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <JobCreater />
            </PrivateRoute>
          }
        />
        <Route
          path="/job-creator/:id"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <JobCreater />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <Candidates />
            </PrivateRoute>
          }
        />
        <Route
          path="/communications"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <Communications />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr-jobs"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <Jobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/job-applicants/:id"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <Applicants />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <Schedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/kanban-board"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <KanbanBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr-profile"
          element={
            <PrivateRoute roles={[ROLE_HR]}>
              <HRProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate-jobs"
          element={
            <PrivateRoute roles={[ROLE_CANDIDATE]}>
              <CandidateJobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate-applications"
          element={
            <PrivateRoute roles={[ROLE_CANDIDATE]}>
              <CandidateApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview-prep"
          element={
            <PrivateRoute roles={[ROLE_CANDIDATE]}>
              <InterviewPrep />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview-bot"
          element={
            <PrivateRoute roles={[ROLE_CANDIDATE]}>
              <InterviewBot />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate-profile"
          element={
            <PrivateRoute roles={[ROLE_CANDIDATE]}>
              <CandidateProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
