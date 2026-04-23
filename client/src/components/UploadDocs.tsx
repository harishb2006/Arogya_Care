import React, { useState, ChangeEvent } from 'react';

interface PolicyUploadProps {
  onUploadComplete: (metadata: any) => void;
  onClose: () => void;
}

const PolicyUpload: React.FC<PolicyUploadProps> = ({ onUploadComplete, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Validation logic for the brief requirements
      if (['pdf', 'json', 'txt'].includes(ext || '')) {
        setFile(selectedFile);
        setDocType(ext || 'pdf');
      } else {
        alert("Invalid format. Please upload PDF, JSON, or TXT.");
      }
    }
  };

  const simulateUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    // Simulating the Indexing process for the UI
    for (let i = 0; i <= 100; i += 20) {
      setUploadProgress(i);
      await new Promise(r => setTimeout(r, 300));
    }

    onUploadComplete({
      name: file.name,
      type: docType,
      timestamp: new Date().toLocaleDateString()
    });
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in-95">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Ingest Knowledge</h3>
            <p className="text-slate-500 text-sm">Upload policy data for AI grounding</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">✕</button>
        </div>

        <div className="space-y-6">
          {/* File Format Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Expected Format</label>
            <div className="flex gap-2">
              {['pdf', 'json', 'txt'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDocType(type)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                    docType === type 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <label className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
            file ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          }`}>
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.json,.txt" />
            
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${file ? 'bg-teal-600 text-white scale-110' : 'bg-white text-slate-400 shadow-sm'}`}>
              {file ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              )}
            </div>
            
            <span className="text-sm font-bold text-slate-900">
              {file ? file.name : "Select Document"}
            </span>
            <span className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</span>
          </label>

          {/* Progress Bar (Only visible during "upload") */}
          {isUploading && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Indexing to Vector Store</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={simulateUpload}
            disabled={!file || isUploading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 disabled:bg-slate-200 transition-all"
          >
            {isUploading ? 'Processing Pipeline...' : 'Confirm and Index'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyUpload;