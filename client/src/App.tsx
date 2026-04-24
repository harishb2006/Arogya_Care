import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserPortal from './pages/UserPortal/UserPortal';
import LandingPage from './pages/LandingPage';
import './index.css';

const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserPortal />} />
        <Route path="/admin" element={
          !token ? (
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          ) : (
            <AdminDashboard onLogout={handleLogout} />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
