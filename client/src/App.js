import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CaseDetail from './components/CaseDetail';
import NewCase from './components/NewCase';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Debt Collection Portal
            </Link>
            <div className="nav-menu">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/new-case" className="nav-link nav-link-primary">+ New Case</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/case/:id" element={<CaseDetail />} />
            <Route path="/new-case" element={<NewCase />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
