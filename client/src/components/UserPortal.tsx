import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AITextLoading from './AITextLoading';

const UserPortal = ({ onAdminClick }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        income: '',
        pre_existing_conditions: 'None',
        tier_location: '',
        cover_amount: '',
        fears_concerns: ''
    });
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState(null);
    const [error, setError] = useState(false);

    // Personalized questions array
    const steps = [
        { id: 'name', label: "First, what's your name?", type: 'text', placeholder: 'Enter your name' },
        { id: 'age', label: `Nice to meet you, ${formData.name}! How old are you?`, type: 'number', placeholder: 'e.g. 25' },
        { id: 'income', label: "What's your annual income bracket?", type: 'select', options: ['Under 3L', '3-8L', 'Above 8L'] },
        { id: 'pre_existing_conditions', label: "Any health conditions we should know about?", type: 'text', placeholder: 'e.g. None or Diabetes' },
        { id: 'tier_location', label: "Where are you currently located?", type: 'select', options: ['Tier-1 (Metro)', 'Tier-2/3', 'Rural'] },
        { id: 'cover_amount', label: "How much coverage are you looking for?", type: 'text', placeholder: 'e.g. 10 Lakhs' },
        { id: 'fears_concerns', label: "What's your biggest concern with insurance?", type: 'text', placeholder: 'e.g. Claim rejection' },
    ];

    const loadingMessages = [
        "Scanning uploaded policy documents...",
        "Analyzing your risk profile...",
        "Matching benefits with your concerns...",
        "Generating final recommendation..."
    ];



    const handleNext = () => {
        const currentFieldId = steps[currentStep].id;
        if (currentFieldId !== 'pre_existing_conditions' && !formData[currentFieldId]) {
            setError(true);
            return; // Prevent user from proceeding if the field is empty
        }

        setError(false);
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitData();
        }
    };

    const submitData = async () => {
        setLoading(true);
        try {
            const [res] = await Promise.all([
                fetch('http://localhost:8000/agent/recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: formData })
                }),
                new Promise(resolve => setTimeout(resolve, 4000)) // Force delay to let animation finish before showing recommendation
            ]);
            const data = await res.json();
            setRecommendation(data.recommendation);
        } catch (e) {
            alert('Error fetching recommendation');
        } finally {
            setLoading(false);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-100">
            {/* Minimalist Header */}
            <header className="p-6 flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <span className="text-xl font-bold tracking-tight">Aarogya<span className="text-teal-600">Aid</span></span>
                </div>
                <button onClick={onAdminClick} className="text-xs font-medium text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Admin Access</button>
            </header>

            <main className="flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">

                    <AnimatePresence mode="wait">
                        {loading ? (
                            /* --- STAGE 2: LOADING ANIMATION --- */
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center py-20 flex flex-col items-center justify-center"
                            >
                                <AITextLoading texts={loadingMessages} interval={1200} />
                            </motion.div>

                        ) : recommendation ? (
                            /* --- STAGE 3: RESULT --- */
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-teal-900/5 border border-slate-100"
                            >
                                <div className="inline-block px-4 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                                    Analysis Complete
                                </div>
                                <h2 className="text-3xl font-bold mb-6 text-slate-800">The best plan for {formData.name}</h2>
                                <div className="prose prose-slate text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 whitespace-pre-wrap">
                                    {recommendation}
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({
                                            name: '',
                                            age: '',
                                            income: '',
                                            pre_existing_conditions: 'None',
                                            tier_location: '',
                                            cover_amount: '',
                                            fears_concerns: ''
                                        });
                                        setCurrentStep(0);
                                        setRecommendation(null);
                                        setError(false);
                                    }}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/20"
                                >
                                    New Assessment
                                </button>
                            </motion.div>

                        ) : (
                            /* --- STAGE 1: STEP-BY-STEP FORM --- */
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-teal-600 font-bold text-sm">Step 0{currentStep + 1}</span>
                                        <span className="text-slate-400 text-xs font-medium">{Math.round(progress)}% Complete</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-teal-600" animate={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
                                    {steps[currentStep].label}
                                    {steps[currentStep].id !== 'pre_existing_conditions' && (
                                        <motion.span
                                            animate={error ? { x: [-10, 10, -10, 10, 0], color: "#ef4444" } : { color: "#ef4444" }}
                                            transition={{ duration: 0.4 }}
                                            className="inline-block ml-2 text-red-500"
                                        >
                                            *
                                        </motion.span>
                                    )}
                                    {error && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-red-500 text-lg md:text-xl font-medium ml-4 tracking-normal"
                                        >
                                            (This field is required)
                                        </motion.span>
                                    )}
                                </h2>

                                <div className="relative group">
                                    {steps[currentStep].type === 'select' ? (
                                        <select
                                            value={formData[steps[currentStep].id]}
                                            onChange={(e) => {
                                                setFormData({ ...formData, [steps[currentStep].id]: e.target.value });
                                                setError(false);
                                            }}
                                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl focus:border-teal-600 outline-none transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select an option</option>
                                            {steps[currentStep].options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            autoFocus
                                            type={steps[currentStep].type}
                                            placeholder={steps[currentStep].placeholder}
                                            value={formData[steps[currentStep].id]}
                                            onChange={(e) => {
                                                setFormData({ ...formData, [steps[currentStep].id]: e.target.value });
                                                setError(false);
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl focus:border-teal-600 outline-none transition-colors placeholder:text-slate-300"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={handleNext}
                                        className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {currentStep === steps.length - 1 ? "Get My Plan" : "Continue →"}
                                    </button>
                                    {currentStep > 0 && (
                                        <button
                                            onClick={() => setCurrentStep(currentStep - 1)}
                                            className="text-slate-400 font-semibold px-6 hover:text-slate-600"
                                        >
                                            Previous
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-400 text-xs">Press <span className="font-bold">Enter ↵</span> to proceed</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default UserPortal;