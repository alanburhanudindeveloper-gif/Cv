import React, { useState } from 'react';
import { ResumeData, JobMatchResult } from '../types';
import { Target, CheckCircle2, AlertCircle, Sparkles, Loader2, X, Info } from 'lucide-react';

interface JobMatchModalProps {
  resumeData: ResumeData;
  onClose: () => void;
  onApplyKeywords?: (newSkills: string[]) => void;
}

export const JobMatchModal: React.FC<JobMatchModalProps> = ({
  resumeData,
  onClose,
  onApplyKeywords,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste the target job description to analyze keyword alignment.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          jobTitle,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description match.');
      }

      const result = await response.json();
      setMatchResult(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during job matching.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Job Description Keyword Matcher</h2>
              <p className="text-xs text-slate-500">
                Compare your ATS resume with specific job requirements and discover keyword gaps.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!matchResult ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer / Product Manager"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Paste Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste the job opening requirements, responsibilities, and required qualifications here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-indigo-600 focus:bg-white resize-none transition-all leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  {error}
                </div>
              )}

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-start gap-2.5 text-indigo-900 text-xs">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Ethical ATS Keyword Principle: </span>
                  Never keyword-stuff or copy-paste terms you don't possess. Recruiters verify claims in technical interviews.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-bold ${getScoreColor(matchResult.matchScore)}`}>
                    <span className="text-2xl leading-none">{matchResult.matchScore}%</span>
                    <span className="text-[9px] uppercase mt-0.5">Match</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Match Overview {jobTitle ? `for ${jobTitle}` : ''}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluates semantic alignment with job responsibilities and technical keywords.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMatchResult(null)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline shrink-0"
                >
                  Analyze Another Job
                </button>
              </div>

              {/* Strong Matches */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" />
                  Strong Keyword Matches ({matchResult.strongMatches.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.strongMatches.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-green-50 text-green-800 border border-green-200 rounded-md text-xs font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                  {matchResult.strongMatches.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No direct keyword overlap identified.</span>
                  )}
                </div>
              </div>

              {/* Potential Gaps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600" />
                    Potential Gaps ({matchResult.potentialGaps.length})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.potentialGaps.map((gap, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-medium"
                    >
                      {gap}
                    </span>
                  ))}
                  {matchResult.potentialGaps.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No significant missing skill gaps identified.</span>
                  )}
                </div>

                {/* Warning note */}
                <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold italic">«Consider adding this only if you genuinely have this experience.» </span>
                    If you have worked with these technologies, mention them in your skills or experience bullets. Do not fabricate experience.
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  Tailoring Recommendations
                </h4>
                <ul className="space-y-2">
                  {matchResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Close
          </button>

          {!matchResult && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze Job Match
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
