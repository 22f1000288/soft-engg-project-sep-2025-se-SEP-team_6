import './App.css'
import AuthSystem from './components/LoginPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TalentFlowLanding from './components/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TalentFlowLanding />} />
        <Route path="/login-signup" element={<AuthSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
