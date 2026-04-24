import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { extractRecommendedPolicy } from '../UserPortal';

type RecommendationTableProps = {
    recommendation: string;
    formData: any;
};

const RecommendationTable = ({ recommendation, formData }: RecommendationTableProps) => {
    const recommendedPolicy = extractRecommendedPolicy(recommendation);

    return (
        <>
            <div className="inline-block px-4 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                Analysis Complete
            </div>
            <h2 className="text-3xl font-bold mb-6 text-slate-800">The best plan for {formData.name}</h2>
            
            {recommendedPolicy && (
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 mb-8 shadow-lg shadow-teal-500/20 text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">
                        🏆
                    </div>
                    <div>
                        <p className="text-teal-50 text-sm font-semibold uppercase tracking-wider mb-1">Top Recommendation</p>
                        <h3 className="text-2xl font-bold">{recommendedPolicy}</h3>
                    </div>
                </div>
            )}

            <div className="text-slate-600 bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 mb-8 shadow-inner overflow-hidden">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-teal-800 mt-8 mb-4 tracking-tight" {...props} />,
                        table: ({ node, ...props }) => <div className="overflow-x-auto my-6 shadow-sm rounded-xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 bg-white" {...props} /></div>,
                        th: ({ node, ...props }) => <th className="px-6 py-4 bg-slate-100/50 text-left text-xs font-bold text-slate-700 uppercase tracking-widest border-b-2 border-slate-200" {...props} />,
                        td: ({ node, ...props }) => <td className="px-6 py-4 text-sm text-slate-600 border-t border-slate-100 align-top" {...props} />,
                        tr: ({ node, ...props }) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-[15px]" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-[15px]" {...props} />,
                        li: ({ node, ...props }) => <li className="marker:text-teal-500" {...props} />,
                    }}
                >
                    {recommendation}
                </ReactMarkdown>
            </div>
        </>
    );
};

export default RecommendationTable;
