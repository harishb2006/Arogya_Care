import React, { useState } from 'react';
import AdminLogin from './app/pages/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserPortal from './components/UserPortal';
import './index.css';

const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [view, setView] = useState<'portal' | 'admin'>('portal');

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  if (view === 'portal') {
    return <UserPortal onAdminClick={() => setView('admin')} />;
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-50">
        <button onClick={() => setView('portal')} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold text-slate-700 transition">
          ← Back to Portal
        </button>
      </div>
      {!token ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;
