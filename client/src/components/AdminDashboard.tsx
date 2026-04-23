import React from 'react';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div>
                    <h1 className="login-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Commander Dashboard</h1>
                    <p className="login-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>System Overview & Controls</p>
                </div>
                <button onClick={onLogout} className="btn-logout">
                    Secure Logout
                </button>
            </div>

            <div className="grid-dashboard">
                <div className="glass-panel stat-card">
                    <div className="input-label">Active Users</div>
                    <div className="stat-value">1,204</div>
                    <p className="input-label" style={{ color: '#10b981', margin: 0 }}>+12% this week</p>
                </div>

                <div className="glass-panel stat-card">
                    <div className="input-label">Appointments Today</div>
                    <div className="stat-value">84</div>
                    <p className="input-label" style={{ margin: 0 }}>12 pending approval</p>
                </div>

                <div className="glass-panel stat-card">
                    <div className="input-label">System Status</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>Healthy</div>
                    <p className="input-label" style={{ margin: 0 }}>All services operational</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px', marginTop: '30px' }}>
                <h2 style={{ marginBottom: '20px', fontWeight: 600 }}>Recent Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[
                        { id: 1, action: "User sign up", user: "johndoe", time: "2 mins ago" },
                        { id: 2, action: "Appointment booked", user: "sarah_m", time: "15 mins ago" },
                        { id: 3, action: "System Backup", user: "System", time: "1 hour ago" },
                    ].map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div>
                                <strong style={{ color: 'var(--text-main)' }}>{item.action}</strong>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>by {item.user}</div>
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>{item.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
