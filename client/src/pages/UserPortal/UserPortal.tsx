import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AITextLoading from '../../components/AITextLoading';
import Form from './components/Form';
import RecommendationTable from './components/RecommendationTable';
import Chat from './components/Chat';

export function extractRecommendedPolicy(markdown: string): string {
    const match = markdown.match(/Recommended Policy:\s*\*{0,2}([^\n*]+)\*{0,2}/i);
    return match ? match[1].trim() : '';
}

const UserPortal = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        lifestyle: '',
        pre_existing_conditions: [] as string[],
        income: '',
        tier_location: '',
    });
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const steps = [
        { id: 'name', label: "First, what's your name?", type: 'text', placeholder: 'Enter your name' },
        { id: 'age', label: `Nice to meet you, ${formData.name}! How old are you?`, type: 'number', placeholder: 'e.g. 25' },
        { id: 'lifestyle', label: "What best describes your lifestyle?", type: 'select', options: ['Sedentary', 'Moderate', 'Active', 'Athlete'], hint: 'Active users are prioritised for OPD cover' },
        { id: 'pre_existing_conditions', label: "Any pre-existing conditions?", type: 'multiselect', options: ['Diabetes', 'Hypertension', 'Asthma', 'Cardiac', 'None', 'Other'] },
        { id: 'income', label: "What's your annual income bracket?", type: 'select', options: ['Under 3L', '3-8L', '8-15L', '15L+'] },
        { id: 'tier_location', label: "Where are you currently located?", type: 'select', options: ['Metro', 'Tier-2', 'Tier-3'] },
    ];

    const loadingMessages = [
        "Scanning uploaded policy documents...",
        "Analyzing your risk profile...",
        "Matching benefits with your concerns...",
        "Generating final recommendation..."
    ];

    const handleNext = () => {
        const step = steps[currentStep];
        const val = formData[step.id as keyof typeof formData];
        const isEmpty = step.type === 'multiselect' ? (val as string[]).length === 0 : !val;
        if (isEmpty) { setError(true); return; }
        setError(false);
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else submitData();
    };

    const submitData = async () => {
        setLoading(true);
        try {
            const profilePayload = {
                ...formData,
                pre_existing_conditions: formData.pre_existing_conditions.join(', ') || 'None',
            };
            const [res] = await Promise.all([
                fetch('http://localhost:8000/agent/recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: profilePayload })
                }),
                new Promise(resolve => setTimeout(resolve, 4000))
            ]);
            const data = await res.json();
            setRecommendation(data.recommendation);
        } catch (e) {
            alert('Error fetching recommendation');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            age: '',
            lifestyle: '',
            pre_existing_conditions: [],
            income: '',
            tier_location: '',
        });
        setCurrentStep(0);
        setRecommendation(null);
        setError(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-100">
            {/* Minimalist Header */}
            <header className="p-6 flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <span className="text-xl font-bold tracking-tight">Aarogya<span className="text-teal-600">Aid</span></span>
                </div>
                <Link to="/" className="text-xs font-medium bg-slate-100 px-4 py-2 rounded-full text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors uppercase tracking-widest">← Home</Link>
            </header>

            <main className="flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center py-20 flex flex-col items-center justify-center"
                            >
                                <AITextLoading texts={loadingMessages} interval={1200} />
                            </motion.div>

                        ) : recommendation ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-teal-900/5 border border-slate-100"
                            >
                                <RecommendationTable recommendation={recommendation} formData={formData} />
                                <Chat profile={formData} recommendedPolicy={extractRecommendedPolicy(recommendation)} />
                                <button
                                    onClick={resetForm}
                                    className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/20"
                                >
                                    New Assessment
                                </button>
                            </motion.div>

                        ) : (
                            <Form 
                                formData={formData} 
                                setFormData={setFormData} 
                                currentStep={currentStep} 
                                setCurrentStep={setCurrentStep}
                                steps={steps}
                                error={error}
                                setError={setError}
                                handleNext={handleNext}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default UserPortal;
