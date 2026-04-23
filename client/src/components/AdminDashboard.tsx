import React, { useState } from 'react';
import PolicyUpload from './UploadDocs';

// --- Types ---
interface PolicyDocument {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  status: 'indexed' | 'processing' | 'error';
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'analytics' | 'settings'>('policies');
  const [isUploading, setIsUploading] = useState(false);

  const [policies, setPolicies] = useState<PolicyDocument[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/admin/documents')
      .then(res => res.json())
      .then(data => setPolicies(data))
      .catch(err => console.error("Failed to fetch policies:", err));
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will immediately remove the document from the Vector Store index.")) {
      try {
        const res = await fetch(`http://localhost:8000/admin/documents/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setPolicies(policies.filter(p => p.id !== id));
        } else {
          alert("Failed to delete from vector store");
        }
      } catch (e) {
        console.error("Delete error", e);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* --- Sidebar --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold">A</div>
            <span className="font-bold tracking-tight text-xl">AarogyaID</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'policies' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Policies
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Analytics
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Policy Management</h2>
            <p className="text-slate-500 mt-1">Manage documents for RAG grounding.</p>
          </div>

          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Upload New Policy
          </button>
        </header>

        {/* --- Policy List Table --- */}
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Document Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{policy.name}</p>
                        <p className="text-xs text-slate-400">{policy.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">{policy.uploadDate}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${policy.status === 'indexed' ? 'bg-teal-50 text-teal-700' :
                        policy.status === 'processing' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                      {policy.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {policies.length === 0 && (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              <p>No documents found. Start by uploading an insurance policy.</p>
            </div>
          )}
        </section>
      </main>

      {/* Upload Modal */}
      {isUploading && (
        <PolicyUpload
          onClose={() => setIsUploading(false)}
          onUploadComplete={(metadata) => {
            const newPolicy = {
              id: Date.now().toString(),
              name: metadata.name,
              uploadDate: metadata.timestamp,
              size: 'Pending',
              status: 'processing' as const
            };
            setPolicies([newPolicy, ...policies]);
            setIsUploading(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;