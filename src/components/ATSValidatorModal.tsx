import React from 'react';
import { ATSValidationResult, ATSIssue } from '../types';
import { CheckCircle2, AlertTriangle, Info, X, ShieldCheck, HelpCircle } from 'lucide-react';

interface ATSValidatorModalProps {
  validation: ATSValidationResult;
  onClose: () => void;
  onFixSection?: (section: string) => void;
}

export const ATSValidatorModal: React.FC<ATSValidatorModalProps> = ({
  validation,
  onClose,
  onFixSection,
}) => {
  const { overallScore, ruleScore, contentScore, issues, passedChecks } = validation;

  const criticalIssues = issues.filter((i) => i.type === 'critical');
  const warningIssues = issues.filter((i) => i.type === 'warning');
  const infoIssues = issues.filter((i) => i.type === 'info');

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ATS Technical Compatibility Check</h2>
              <p className="text-xs text-slate-500">
                Deterministic rule auditor based on top ATS parser constraints (Workday, Taleo, Greenhouse, Lever).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Banner */}
        <div className="p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-bold ${getScoreColor(overallScore)}`}>
              <span className="text-2xl leading-none">{overallScore}%</span>
              <span className="text-[10px] tracking-wide uppercase mt-1">Score</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">ATS Compatibility Score</div>
              <p className="text-xs text-slate-500 max-w-xs mt-0.5">
                Calculated deterministically. No parser guarantees 100% acceptance due to company-specific ATS customizations.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 text-xs w-full sm:w-auto justify-around sm:justify-start">
            <div className="bg-slate-50 p-2 px-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Structural Rules</span>
              <span className="font-bold text-slate-800">{ruleScore}% compliant</span>
            </div>
            <div className="bg-slate-50 p-2 px-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Content Quality</span>
              <span className="font-bold text-slate-800">{contentScore}% verified</span>
            </div>
          </div>
        </div>

        {/* Issues & Checks Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Passed Deterministic Checks */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Passed ATS Technical Criteria ({passedChecks.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items / Issues */}
          {issues.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                Areas to Review ({issues.length})
              </h3>
              <div className="space-y-2.5">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                      issue.type === 'critical'
                        ? 'bg-red-50/70 border-red-200 text-red-900'
                        : issue.type === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-blue-50/60 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="uppercase text-[10px] tracking-wide px-1.5 py-0.5 rounded font-bold bg-white/80">
                          {issue.section}
                        </span>
                        <span>{issue.message}</span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 pl-0.5">
                        <span className="font-medium text-slate-800">Recommendation: </span>
                        {issue.recommendation}
                      </p>
                    </div>

                    {onFixSection && (
                      <button
                        onClick={() => {
                          onFixSection(issue.section);
                          onClose();
                        }}
                        className="text-[11px] font-semibold underline text-slate-800 hover:text-black shrink-0 mt-0.5"
                      >
                        Fix
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ATS Advice Footer Note */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11.5px] leading-relaxed flex items-start gap-2">
            <HelpCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Why deterministic compliance matters: </span>
              Most enterprise ATS platforms parse text linearly without executing JavaScript or rendering styled visual elements. Tables, columns, and skill percentage bars often cause candidate data to be miscategorized or discarded.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors"
          >
            Close Check
          </button>
        </div>

      </div>
    </div>
  );
};
