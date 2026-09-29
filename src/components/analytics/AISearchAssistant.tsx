import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { executeNLSearchQuery } from '../../services/analyticsService';
import { NLSearchQueryResult } from '../../types/analyticsTypes';
import { EnterpriseChartEngine } from './EnterpriseChartEngine';

interface AISearchAssistantProps {
  onSearchResult?: (result: NLSearchQueryResult) => void;
}

export const AISearchAssistant: React.FC<AISearchAssistantProps> = ({ onSearchResult }) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<NLSearchQueryResult | null>(null);

  const samplePrompts = [
    'Show high dropout risk students in Mechanical Engg',
    'Display fee collection trends & outstanding dues for Q3',
    'Faculty research Scopus citations & patent filings',
    'Hostel block occupancy vs mess fee collections',
  ];

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = executeNLSearchQuery(searchQuery);
      setResult(res);
      setIsAnalyzing(false);
      if (onSearchResult) onSearchResult(res);
    }, 450);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Natural Language BI Search & AI Assistant
          </h2>
          <p className="text-xs text-slate-400">
            Ask complex institutional questions in plain English to generate dynamic analytical charts & ML insights.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="e.g. Predict low attendance students next semester or show revenue vs expenses..."
          className="w-full bg-slate-950 text-slate-100 pl-12 pr-28 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm placeholder:text-slate-500 shadow-inner"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={isAnalyzing || !query.trim()}
          className="absolute right-2.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          {isAnalyzing ? 'Analyzing...' : 'Generate BI'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Sample Prompts */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Prompts:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(prompt);
              handleSearch(prompt);
            }}
            className="text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Search Result Output */}
      {result && (
        <div className="mt-6 border-t border-slate-800/80 pt-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30 uppercase tracking-wide">
                Intent: {result.intent}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Model Confidence 96.4%
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 text-sm text-slate-200 leading-relaxed flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">AI Generated Summary:</p>
              <p className="text-slate-300 text-xs leading-normal">{result.summary}</p>
              <p className="text-emerald-400 text-xs font-medium mt-2 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                Key Insight: {result.generatedInsight}
              </p>
            </div>
          </div>

          {/* Render Generated Chart */}
          <EnterpriseChartEngine
            type={result.suggestedChartType}
            title={`BI Search Result: ${result.query}`}
            subtitle="Real-time predictive query dataset"
            data={result.chartData}
            height={220}
          />
        </div>
      )}
    </div>
  );
};
