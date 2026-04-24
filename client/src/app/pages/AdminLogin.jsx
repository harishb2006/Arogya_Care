import React, { useState, FormEvent, ChangeEvent } from 'react';

// Define the Props interface for clear component contracts
interface AdminLoginProps {
    onLoginSuccess: (token: string) => void;
}

// Strictly typed SVG components
const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    // Explicit state typing
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // FormEvent for the submit handler
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Invalid credentials');
            }

            const data: { token: string } = await response.json();
            onLoginSuccess(data.token);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Secure connection failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-50 text-slate-900 font-sans selection:bg-teal-100">
            {/* Subtle Engineering Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-10 w-full max-w-md p-10 bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                
                {/* Branding Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="h-12 w-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-teal-600/20">
                        A
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Admin Portal
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm text-center font-medium">
                        Secure Authentication Required
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Admin ID</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                <UserIcon />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                <LockIcon />
                            </div>
                            <input
                                type="password"
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl font-semibold shadow-xl shadow-slate-900/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
                    >
                        {loading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
                    </button>

                    {/* Professional Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center rounded-2xl animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}
                </form>
                
                {/* Footer Security Disclaimer */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                        AarogyaID Enterprise Security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;