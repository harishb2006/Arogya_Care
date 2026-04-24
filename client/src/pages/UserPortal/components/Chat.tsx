import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type ChatProps = {
    profile: Record<string, unknown>;
    recommendedPolicy: string;
};

const Chat: React.FC<ChatProps> = ({ profile, recommendedPolicy }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: `Hi ${profile.name as string || 'there'}! I'm your policy guide for **${recommendedPolicy}**. Ask me anything — I can explain terms, walk through your coverage, or generate a real-life scenario based on your situation.` }
    ]);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || thinking) return;
        const userMsg: ChatMessage = { role: 'user', content: text };
        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInput('');
        setThinking(true);
        try {
            const res = await fetch('http://localhost:8000/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile,
                    recommended_policy: recommendedPolicy,
                    message: text,
                    chat_history: messages.map(m => ({ role: m.role, content: m.content })),
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not get a response.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error reaching the server. Please try again.' }]);
        } finally {
            setThinking(false);
        }
    };

    const quickPrompts = [
        'What does co-pay mean for me?',
        'How does the waiting period affect my conditions?',
        'Give me a real claim scenario',
        'What is excluded from this policy?',
    ];

    return (
        <div className="mt-10 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-teal-500/30">✦</div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-none">Policy Explainer</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ask anything about your plan — scoped to your profile</p>
                </div>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
                {quickPrompts.map(q => (
                    <button key={q} onClick={() => { setInput(q); }}
                        className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1.5 rounded-full font-medium hover:bg-teal-100 transition-colors">
                        {q}
                    </button>
                ))}
            </div>

            {/* Message area */}
            <div className="h-80 overflow-y-auto rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-4 scroll-smooth">
                {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-teal-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'
                            }`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                p: ({ ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
                            }}>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                ))}
                {thinking && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                            <div className="flex gap-1.5 items-center h-4">
                                {[0, 1, 2].map(i => <motion.div key={i} className="w-1.5 h-1.5 bg-teal-400 rounded-full"
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />)}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 mt-3">
                <input
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about your plan, terms, or your scenario..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 transition-colors"
                />
                <button onClick={sendMessage} disabled={thinking || !input.trim()}
                    className="bg-teal-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-teal-600/20">
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;