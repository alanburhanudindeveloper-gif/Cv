import React, { useState } from 'react';
import { ImportReviewData, NormalizationMode, ResumeData } from '../types';
import { CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck, Sparkles, Edit3, X } from 'lucide-react';

interface ResumeImportModalProps {
  importData: ImportReviewData;
  onConfirm: (finalData: ResumeData) => void;
  onEditInForm: (finalData: ResumeData) => void;
  onCancel: () => void;
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  importData,
  onConfirm,
  onEditInForm,
  onCancel,
}) => {
  const [data, setData] = useState<ResumeData>(importData.parsedData);
  const [mode, setMode] = useState<NormalizationMode>('preserve');
  const [activeTab, setActiveTab] = useState<'review' | 'rawText'>('review');

  const p = data.personalInfo;
  const expCount = data.experience?.length || 0;
  const eduCount = data.education?.length || 0;
  const techSkills = data.skills?.technical || [];
  const softSkills = data.skills?.soft || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Resume Import Review</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {importData.fileName}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Please verify the extracted information before converting into an ATS-friendly single column format.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning banner for Scanned PDF */}
        {importData.isScanned && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice: Scanned Document Detected. </span>
              This PDF appears to be scanned or image-based. OCR was used to extract the content and some information may require manual verification.
            </div>
          </div>
        )}

        {/* Normalization Strategy Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <ShieldCheck size={15} className="text-blue-600" />
            <span>Content Strategy:</span>
          </div>
          <div className="flex rounded-lg bg-slate-200/80 p-0.5">
            <button
              onClick={() => setMode('preserve')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                mode === 'preserve'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preserve My Content (Verbatim)
            </button>
            <button
              onClick={() => setMode('improve')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                mode === 'improve'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Improve Wording (Active Verbs)
            </button>
            <button
              onClick={() => setMode('optimize')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                mode === 'optimize'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Optimize for ATS
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            We found the following information
          </button>
          <button
            onClick={() => setActiveTab('rawText')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'rawText'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Extracted Source Preview
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'review' ? (
            <>
              {/* Personal Information */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-600" />
                    Personal Information
                  </h3>
                  <span className="text-[11px] text-slate-400">Deterministic check</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Name</span>
                    <span className="font-semibold text-slate-800">{p.name || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Email</span>
                    <span className="text-slate-800">{p.email || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Phone</span>
                    <span className="text-slate-800">{p.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Location</span>
                    <span className="text-slate-800">{p.location || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">LinkedIn</span>
                    <span className="text-slate-800 truncate block">{p.linkedin || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Portfolio / Web</span>
                    <span className="text-slate-800 truncate block">{p.website || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-600" />
                    Professional Summary
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{data.summary}"
                  </p>
                </div>
              )}

              {/* Experience */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-600" />
                    Work Experience ({expCount} detected)
                  </h3>
                </div>
                <div className="space-y-3">
                  {data.experience?.map((exp, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs">
                      <div className="flex justify-between items-start font-semibold text-slate-900">
                        <span>{exp.title} — {exp.company}</span>
                        <span className="text-slate-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      {exp.location && <div className="text-[11px] text-slate-500 mt-0.5">{exp.location}</div>}
                      {exp.description && exp.description.length > 0 && (
                        <ul className="list-disc ml-4 mt-2 space-y-1 text-slate-600 text-[11.5px]">
                          {exp.description.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {expCount === 0 && (
                    <p className="text-xs text-slate-400 italic">No explicit experience entries detected.</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" />
                  Education ({eduCount} detected)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.education?.map((edu, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-700">{edu.school}</div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>Graduated: {edu.graduationDate || '—'}</span>
                        {edu.gpa && <span className="font-medium text-slate-800">GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                  {eduCount === 0 && (
                    <p className="text-xs text-slate-400 italic">No education entries detected.</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" />
                  Skills ({techSkills.length + softSkills.length} identified)
                </h3>
                <div className="space-y-2 text-xs">
                  {techSkills.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Technical: </span>
                      <span className="text-slate-600">{techSkills.join(', ')}</span>
                    </div>
                  )}
                  {softSkills.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Soft Skills: </span>
                      <span className="text-slate-600">{softSkills.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
              {importData.extractedTextSample || "No raw text available."}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditInForm(data)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Edit3 size={14} />
              Edit Extracted Data
            </button>

            <button
              onClick={() => onConfirm(data)}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              <Sparkles size={14} />
              Confirm & Convert to ATS Resume
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
