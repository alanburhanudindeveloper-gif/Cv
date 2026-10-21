import React from 'react';
import { ATSValidationResult } from '../types';
import { AlertTriangle, Download, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface PreExportCheckModalProps {
  validation: ATSValidationResult;
  onProceedExport: () => void;
  onReviewInEditor: () => void;
  onCancel: () => void;
}

export const PreExportCheckModal: React.FC<PreExportCheckModalProps> = ({
  validation,
  onProceedExport,
  onReviewInEditor,
  onCancel,
}) => {
  const { issues, overallScore } = validation;
  const criticalOrWarningIssues = issues.filter(
    (i) => i.type === 'critical' || i.type === 'warning'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              criticalOrWarningIssues.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {criticalOrWarningIssues.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pre-Export ATS Verification</h2>
              <p className="text-[11px] text-slate-500">Checking document against ATS readability standards</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {criticalOrWarningIssues.length > 0 ? (
            <div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium">
                «Your resume is ready, but {criticalOrWarningIssues.length} issue{criticalOrWarningIssues.length > 1 ? 's' : ''} should be reviewed before export.»
              </div>

              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                {criticalOrWarningIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-start gap-2"
                  >
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <span className="font-semibold text-slate-800">[{issue.section}] </span>
                      <span className="text-slate-700">{issue.message}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{issue.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block">100% ATS Technical Check Passed</span>
                Your resume meets all deterministic ATS formatting rules: standard headings, single-column reading order, and clean fonts.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>ATS Compatibility Score:</span>
            <span className="font-bold text-slate-900">{overallScore}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {criticalOrWarningIssues.length > 0 ? (
            <>
              <button
                onClick={onReviewInEditor}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
              >
                Review in Editor
              </button>

              <button
                onClick={onProceedExport}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download size={14} />
                Export Anyway
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={onProceedExport}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ml-auto"
              >
                <Download size={14} />
                Download ATS Resume (PDF)
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
