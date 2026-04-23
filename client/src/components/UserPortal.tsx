import React, { useState } from 'react';

const UserPortal: React.FC<{ onAdminClick: () => void }> = ({ onAdminClick }) => {
    const [formData, setFormData] = useState({
        age: 30,
        income: '3-8L',
        pre_existing_conditions: 'None',
        tier_location: 'Tier-1 (Metro)',
        cover_amount: '5 Lakhs',
        fears_concerns: 'High premiums, Claim rejection'
    });

    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);

    const handleRecommend = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/agent/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: formData })
            });
            const data = await res.json();
            setRecommendation(data.recommendation);
        } catch (e) {
            console.error(e);
            alert('Failed to get recommendation');
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async () => {
        if (!chatMessage.trim()) return;
        const newChatHistory = [...chatHistory, { role: "USER", message: chatMessage }];
        setChatHistory(newChatHistory);
        setChatMessage("");
        setChatLoading(true);
        try {
            const res = await fetch('http://localhost:8000/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: formData,
                    message: chatMessage,
                    chat_history: newChatHistory.slice(0, -1)
                })
            });
            const data = await res.json();
            setChatHistory([...newChatHistory, { role: "CHATBOT", message: data.reply }]);
        } catch (e) {
            console.error(e);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-teal-600">AarogyaAid <span className="text-slate-900">Patient Portal</span></h1>
                <button onClick={onAdminClick} className="text-slate-500 hover:text-slate-900 font-semibold underline">Admin Login</button>
            </header>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* PROFILE FORM */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold mb-6">Your Health Profile</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Age</label>
                            <input type="number"
                                value={formData.age} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Annual Income</label>
                            <select value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none">
                                <option>Under 3L</option>
                                <option>3-8L</option>
                                <option>Above 8L</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Pre-existing Conditions</label>
                            <input type="text" placeholder="e.g. Diabetes, None"
                                value={formData.pre_existing_conditions} onChange={e => setFormData({ ...formData, pre_existing_conditions: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">City / Location Type</label>
                            <select value={formData.tier_location} onChange={e => setFormData({ ...formData, tier_location: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none">
                                <option>Tier-1 (Metro)</option>
                                <option>Tier-2/3</option>
                                <option>Rural</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Desired Cover Amount</label>
                            <input type="text" placeholder="e.g. 5 Lakhs"
                                value={formData.cover_amount} onChange={e => setFormData({ ...formData, cover_amount: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Biggest Insurance Fear/Concern</label>
                            <input type="text" placeholder="e.g. Hidden copays"
                                value={formData.fears_concerns} onChange={e => setFormData({ ...formData, fears_concerns: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none" />
                        </div>

                        <button
                            onClick={handleRecommend}
                            disabled={loading}
                            className="w-full mt-6 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/30 hover:bg-teal-700 disabled:opacity-50"
                        >
                            {loading ? "Analyzing Policies..." : "Find My Best Fit"}
                        </button>
                    </div>
                </div>

                {/* RESULTS & CHAT EXPLAINER */}
                <div className="flex flex-col gap-6">

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[300px] max-h-[600px] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Recommendation</h2>
                        {!recommendation && !loading && (
                            <p className="text-slate-400 italic">Fill out your profile and click 'Find My Best Fit' to see grounded AI recommendations based on uploaded policies.</p>
                        )}
                        {loading && <p className="text-teal-600 font-bold animate-pulse">Running RAG Pipeline...</p>}
                        {recommendation && (
                            <div className="prose prose-slate prose-sm text-sm whitespace-pre-wrap">
                                {recommendation}
                            </div>
                        )}
                    </div>

                    {recommendation && (
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col">
                            <h3 className="text-lg font-bold mb-4">Chat Explainer</h3>

                            <div className="flex-1 max-h-48 overflow-y-auto mb-4 space-y-3">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`p-3 rounded-xl text-sm ${msg.role === 'USER' ? 'bg-slate-800 ml-auto max-w-[80%]' : 'bg-teal-900/40 text-teal-50 mr-auto max-w-[90%]'}`}>
                                        {msg.message}
                                    </div>
                                ))}
                                {chatLoading && <div className="text-teal-400 text-xs italic">AarogyaAid is typing...</div>}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatMessage}
                                    onChange={e => setChatMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                                    placeholder="Ask about terms (e.g. What is a co-pay?)"
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none focus:border-teal-500 text-sm"
                                />
                                <button onClick={handleChat} className="bg-teal-600 px-4 rounded-xl font-bold hover:bg-teal-500">→</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserPortal;
