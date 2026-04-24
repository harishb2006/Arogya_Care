import { motion } from 'framer-motion';

type FormProps = {
    formData: any;
    setFormData: (data: any) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    steps: any[];
    error: boolean;
    setError: (error: boolean) => void;
    handleNext: () => void;
};

const Form = ({ formData, setFormData, currentStep, setCurrentStep, steps, error, setError, handleNext }: FormProps) => {
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
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
                    <>
                        <select
                            value={formData[steps[currentStep].id] as string}
                            onChange={(e) => {
                                setFormData({ ...formData, [steps[currentStep].id]: e.target.value });
                                setError(false);
                            }}
                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl focus:border-teal-600 outline-none transition-colors appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Select an option</option>
                            {steps[currentStep].options!.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {steps[currentStep].hint && (
                            <p className="mt-3 text-sm text-teal-600 font-medium flex items-center gap-1.5">
                                <span>💡</span> {steps[currentStep].hint}
                            </p>
                        )}
                    </>
                ) : steps[currentStep].type === 'multiselect' ? (
                    <div className="flex flex-wrap gap-3 pt-2">
                        {steps[currentStep].options!.map((opt: string) => {
                            const selected = (formData.pre_existing_conditions as string[]).includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        const current = formData.pre_existing_conditions as string[];
                                        let next: string[];
                                        if (opt === 'None') {
                                            next = selected ? [] : ['None'];
                                        } else {
                                            const withoutNone = current.filter((v: string) => v !== 'None');
                                            next = selected ? withoutNone.filter((v: string) => v !== opt) : [...withoutNone, opt];
                                        }
                                        setFormData({ ...formData, pre_existing_conditions: next });
                                        setError(false);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-base transition-all ${selected
                                        ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20'
                                        : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <input
                        autoFocus
                        type={steps[currentStep].type}
                        placeholder={steps[currentStep].placeholder}
                        value={formData[steps[currentStep].id] as string}
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
    );
};

export default Form;
