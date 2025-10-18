import './App.css'
import AuthSystem from './components/LoginPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
