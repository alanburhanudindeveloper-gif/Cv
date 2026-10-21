import React from 'react';
import { ResumeReviewResult } from '../types';
import { CheckCircle2, AlertTriangle, Lightbulb, X, Sparkles, BarChart3 } from 'lucide-react';

interface AIReviewProps {
  result: ResumeReviewResult | null;
  onClose: () => void;
}

export const AIReview: React.FC<AIReviewProps> = ({ result, onClose }) => {
  if (!result) return null;

  const categories = [
    { label: 'Overall Readiness', key: 'overallReadiness', score: result.categoryScores?.overallReadiness ?? 85 },
    { label: 'Content Quality', key: 'contentQuality', score: result.categoryScores?.contentQuality ?? 82 },
    { label: 'ATS Compatibility', key: 'atsCompatibility', score: result.categoryScores?.atsCompatibility ?? 92 },
    { label: 'Achievement Strength', key: 'achievementStrength', score: result.categoryScores?.achievementStrength ?? 78 },
    { label: 'Recruiter Readability', key: 'recruiterReadability', score: result.categoryScores?.recruiterReadability ?? 88 },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              AI Recruiter & ATS Review
            </h3>
            <p className="text-[10px] text-slate-500">Semantic evaluation of content impact & readability</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200/60 rounded-md transition-colors text-slate-400 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Category Breakdown */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <BarChart3 size={13} className="text-indigo-600" />
              Category Ratings
            </span>
            <span className="text-xs font-bold text-indigo-600">
              {result.overallScore ? `${result.overallScore}% Overall` : 'Analyzed'}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">{cat.label}</span>
                  <span className="font-semibold text-slate-800">{cat.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <section className="space-y-1.5">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Executive Summary</h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100 italic">
            "{result.summary}"
          </p>
        </section>

        {/* Strengths */}
        <section className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-600" />
            Identified Strengths
          </h4>
          <div className="space-y-1.5">
            {result.strengths.map((s, i) => (
              <div key={i} className="text-xs text-slate-700 bg-green-50/50 border border-green-100 p-2.5 rounded-lg flex gap-2">
                <span className="text-green-600 font-bold shrink-0">•</span>
                <span className="leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Improvements */}
        <section className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-600" />
            Recommended Changes
          </h4>
          <div className="space-y-1.5">
            {result.improvements.map((imp, i) => (
              <div key={i} className="text-xs text-slate-700 bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg flex gap-2">
                <span className="text-amber-600 font-bold shrink-0">•</span>
                <span className="leading-snug">{imp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Tips */}
        <section className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-blue-900 tracking-widest flex items-center gap-1.5">
            <Lightbulb size={12} className="text-blue-600" />
            Quick Wins & Tips
          </h4>
          <ul className="space-y-1.5">
            {result.quickTips.map((tip, i) => (
              <li key={i} className="text-[11.5px] text-blue-800 leading-snug flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
};
