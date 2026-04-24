import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const UserFeature = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            
            {/* Header: Clean & White */}
            <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xl">A</div>
                    <span className="text-2xl font-black text-slate-800">Aarogya<span className="text-emerald-500">Aid</span></span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
                    <Link to="/user" className="hover:text-emerald-600 transition-colors">Find Policy</Link>
                    <Link to="/admin" className="hover:text-emerald-600 transition-colors">Support</Link>
                </div>
                <Link to="/admin">
                    <button className=" text-slate-600 hover:text-slate-400 cursor-pointer  ">
                        Admin Login
                    </button>
                </Link>
            </nav>

            {/* Hero Section: The "Why" for the User */}
            <header className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Trusted by 10,000+ Users</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1]">
                        Stop guessing your <br /> 
                        <span className="text-emerald-500 italic">Health Insurance.</span>
                    </h1>

                    <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                        Our AI reads the fine print so you don't have to. Compare policies with 100% clarity on waiting periods and claim rejections.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/user">
                            <button className="w-full sm:w-auto bg-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/40 hover:scale-105 transition-all">
                                View Best Plans →
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Sliding Visual: Like PolicyBazaar Ad Sliders */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-emerald-50 rounded-[3rem] p-12 aspect-square flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="z-10 bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Optimized Policy</p>
                                <p className="text-lg font-bold">Aarogya Shield Plus</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div animate={{ width: '95%' }} transition={{ duration: 1.5 }} className="h-full bg-emerald-500" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Suitability Score: 95%</p>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Feature Section: The "User Point of View" */}
            <section className="bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Why choose AarogyaAid?</h2>
                    <p className="text-slate-500 font-medium">We simplify insurance so you can focus on recovery.</p>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <UserFeature 
                        title="Zero Hidden Terms"
                        description="Our AI scans the 'fine print' to reveal hidden sub-limits and co-pays instantly."
                        icon={<svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    />
                    <UserFeature 
                        title="Wait-Period Clarity"
                        description="Know exactly how long you have to wait for pre-existing diseases before buying."
                        icon={<svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                    />
                    <UserFeature 
                        title="Cashless Support"
                        description="Access 10,000+ network hospitals for worry-free, cashless medical treatments."
                        icon={<svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>}
                    />
                    <UserFeature 
                        title="Personalized Quotes"
                        description="Quotes generated based on your age and income—no generic 'starting from' prices."
                        icon={<svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                    />
                </div>
            </section>
        </div>
    );
};

export default LandingPage;