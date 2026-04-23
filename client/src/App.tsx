import React, { useState } from 'react';
import AdminLogin from './app/pages/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
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
    <>
      {!token ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;
