import React, { useState } from 'react';
import { ResumeData, Experience, Education, Project } from '../types';
import { Plus, Trash2, Sparkles, Loader2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  highlightSection?: string;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange, highlightSection }) => {
  const [rewritingBullet, setRewritingBullet] = useState<{ expIdx: number; bIdx: number } | null>(null);
  const [rewriteSuggestions, setRewriteSuggestions] = useState<string[]>([]);
  const [isRewriting, setIsRewriting] = useState(false);

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const updateSummary = (value: string) => {
    onChange({ ...data, summary: value });
  };

  // Experience Handlers
  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        { title: '', company: '', location: '', startDate: '', endDate: '', description: [''] }
      ]
    });
  };

  const removeExperience = (index: number) => {
    onChange({
      ...data,
      experience: data.experience.filter((_, i) => i !== index)
    });
  };

  const updateExperienceField = (index: number, field: keyof Experience, value: any) => {
    const list = [...data.experience];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, experience: list });
  };

  const addExperienceBullet = (expIndex: number) => {
    const list = [...data.experience];
    list[expIndex].description = [...list[expIndex].description, ''];
    onChange({ ...data, experience: list });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const list = [...data.experience];
    const desc = [...list[expIndex].description];
    desc[bulletIndex] = text;
    list[expIndex].description = desc;
    onChange({ ...data, experience: list });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const list = [...data.experience];
    list[expIndex].description = list[expIndex].description.filter((_, i) => i !== bulletIndex);
    onChange({ ...data, experience: list });
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= data.experience.length) return;
    const list = [...data.experience];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;
    onChange({ ...data, experience: list });
  };

  // Rewrite bullet using server API
  const handleRewriteBullet = async (expIdx: number, bIdx: number) => {
    const originalText = data.experience[expIdx]?.description[bIdx];
    if (!originalText || !originalText.trim()) return;

    setRewritingBullet({ expIdx, bIdx });
    setIsRewriting(true);
    setRewriteSuggestions([]);

    try {
      const response = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet: originalText,
          context: `${data.experience[expIdx].title} at ${data.experience[expIdx].company}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to rewrite bullet point');
      const res = await response.json();
      setRewriteSuggestions(res.suggestions || []);
    } catch (err) {
      console.error(err);
      setRewriteSuggestions(['Could not rewrite bullet. Please try again.']);
    } finally {
      setIsRewriting(false);
    }
  };

  const applyBulletSuggestion = (expIdx: number, bIdx: number, suggestion: string) => {
    updateExperienceBullet(expIdx, bIdx, suggestion);
    setRewritingBullet(null);
    setRewriteSuggestions([]);
  };

  // Education Handlers
  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        { degree: '', school: '', location: '', graduationDate: '', gpa: '' }
      ]
    });
  };

  const removeEducation = (index: number) => {
    onChange({
      ...data,
      education: data.education.filter((_, i) => i !== index)
    });
  };

  const updateEducationField = (index: number, field: keyof Education, value: string) => {
    const list = [...data.education];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, education: list });
  };

  // Projects Handlers
  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...(data.projects || []),
        { name: '', description: '', link: '' }
      ]
    });
  };

  const removeProject = (index: number) => {
    onChange({
      ...data,
      projects: (data.projects || []).filter((_, i) => i !== index)
    });
  };

  const updateProjectField = (index: number, field: keyof Project, value: string) => {
    const list = [...(data.projects || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, projects: list });
  };

  // Skills Handlers
  const updateSkillList = (type: 'technical' | 'soft', value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onChange({
      ...data,
      skills: { ...data.skills, [type]: list }
    });
  };

  // Certifications Handlers
  const updateCertifications = (value: string) => {
    const list = value.split('\n').map(s => s.trim()).filter(s => s !== '');
    onChange({ ...data, certifications: list });
  };

  // Languages Handlers
  const updateLanguages = (value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onChange({ ...data, languages: list });
  };

  return (
    <div className="space-y-8 pb-16 text-slate-900">
      
      {/* Personal Info */}
      <section className={`p-4 rounded-xl border bg-white transition-all ${
        highlightSection === 'Personal Information' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      }`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Full Name *</label>
            <input 
              type="text" 
              value={data.personalInfo.name} 
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:border-slate-900 outline-none"
              placeholder="e.g. Alex Morgan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Email Address *</label>
            <input 
              type="email" 
              value={data.personalInfo.email} 
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:border-slate-900 outline-none"
              placeholder="e.g. alex.morgan@email.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Phone Number *</label>
            <input 
              type="text" 
              value={data.personalInfo.phone} 
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:border-slate-900 outline-none"
              placeholder="e.g. +1 (555) 019-2834"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Location (City, Country) *</label>
            <input 
              type="text" 
              value={data.personalInfo.location} 
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:border-slate-900 outline-none"
              placeholder="e.g. San Francisco, CA or Jakarta, Indonesia"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">LinkedIn Profile URL</label>
            <input 
              type="text" 
              value={data.personalInfo.linkedin} 
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:border-slate-900 outline-none"
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Portfolio / Website</label>
            <input 
              type="text" 
              value={data.personalInfo.website} 
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:border-slate-900 outline-none"
              placeholder="alexmorgan.dev"
            />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className={`p-4 rounded-xl border bg-white transition-all ${
        highlightSection === 'Professional Summary' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Summary</h3>
          <span className="text-[11px] text-slate-400">Standard ATS Heading</span>
        </div>
        <textarea 
          value={data.summary} 
          onChange={(e) => updateSummary(e.target.value)}
          rows={3}
          placeholder="Concise 2-4 sentence executive summary highlighting key domain expertise, years of experience, and primary accomplishments..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:border-slate-900 outline-none resize-none leading-relaxed"
        />
      </section>

      {/* Work Experience */}
      <section className={`p-4 rounded-xl border bg-white transition-all ${
        highlightSection === 'Work Experience' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Work Experience</h3>
            <p className="text-[11px] text-slate-400">Order from most recent to oldest. Use action-oriented bullets.</p>
          </div>
          <button 
            onClick={addExperience}
            className="text-[11px] bg-slate-900 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black font-semibold transition-colors"
          >
            <Plus size={13} /> Add Role
          </button>
        </div>

        <div className="space-y-5">
          {data.experience.map((exp, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl relative group/item">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Role #{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveExperience(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => moveExperience(idx, 'down')}
                    disabled={idx === data.experience.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button 
                    onClick={() => removeExperience(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
                    title="Delete role"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Job Title *</label>
                  <input 
                    type="text" 
                    value={exp.title} 
                    onChange={(e) => updateExperienceField(idx, 'title', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Company Name *</label>
                  <input 
                    type="text" 
                    value={exp.company} 
                    onChange={(e) => updateExperienceField(idx, 'company', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Start Date *</label>
                  <input 
                    type="text" 
                    value={exp.startDate} 
                    onChange={(e) => updateExperienceField(idx, 'startDate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Jan 2022"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">End Date *</label>
                  <input 
                    type="text" 
                    value={exp.endDate} 
                    onChange={(e) => updateExperienceField(idx, 'endDate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Present"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Location</label>
                  <input 
                    type="text" 
                    value={exp.location} 
                    onChange={(e) => updateExperienceField(idx, 'location', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. San Francisco, CA (or Remote)"
                  />
                </div>
              </div>

              {/* Individual Bullet Points with In-line AI Rewriter */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Bullet Points (Action verbs, quantifiable where authentic)
                  </label>
                  <button
                    onClick={() => addExperienceBullet(idx)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus size={11} /> Add Bullet
                  </button>
                </div>

                {exp.description.map((bullet, bIdx) => {
                  const isCurrentRewriting = rewritingBullet?.expIdx === idx && rewritingBullet?.bIdx === bIdx;

                  return (
                    <div key={bIdx} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold text-xs">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                          placeholder="e.g. Engineered real-time data sync pipeline reducing latency..."
                          className="flex-1 bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                        />
                        <button
                          onClick={() => handleRewriteBullet(idx, bIdx)}
                          title="Strengthen with AI (Uses action verbs, no fake stats)"
                          className="px-2 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Sparkles size={11} />
                          Strengthen
                        </button>
                        <button
                          onClick={() => removeExperienceBullet(idx, bIdx)}
                          className="p-1 text-slate-300 hover:text-red-500 shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Rewrite suggestions drawer */}
                      {isCurrentRewriting && (
                        <div className="ml-4 p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs space-y-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-900">
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={12} className="text-indigo-600" />
                              AI Action-Oriented Improvements (No fake metrics)
                            </span>
                            <button
                              onClick={() => {
                                setRewritingBullet(null);
                                setRewriteSuggestions([]);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          {isRewriting ? (
                            <div className="flex items-center gap-2 text-indigo-600 py-1 text-xs">
                              <Loader2 size={13} className="animate-spin" />
                              Generating strong variations...
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {rewriteSuggestions.map((sug, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-start justify-between gap-2 p-2 rounded bg-white border border-indigo-100 hover:border-indigo-300 transition-colors"
                                >
                                  <span className="text-[11.5px] text-slate-800 leading-snug">{sug}</span>
                                  <button
                                    onClick={() => applyBulletSuggestion(idx, bIdx, sug)}
                                    className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shrink-0"
                                  >
                                    Apply
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className={`p-4 rounded-xl border bg-white transition-all ${
        highlightSection === 'Education' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</h3>
          <button 
            onClick={addEducation}
            className="text-[11px] bg-slate-900 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black font-semibold transition-colors"
          >
            <Plus size={13} /> Add Education
          </button>
        </div>

        <div className="space-y-4">
          {data.education.map((edu, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl relative group/item">
              <button 
                onClick={() => removeEducation(idx)}
                className="absolute top-3.5 right-3.5 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">School / University *</label>
                  <input 
                    type="text" 
                    value={edu.school} 
                    onChange={(e) => updateEducationField(idx, 'school', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Stanford University or Universitas Indonesia"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Degree & Major *</label>
                  <input 
                    type="text" 
                    value={edu.degree} 
                    onChange={(e) => updateEducationField(idx, 'degree', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Bachelor of Science in Computer Science"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Graduation Year / Date *</label>
                  <input 
                    type="text" 
                    value={edu.graduationDate} 
                    onChange={(e) => updateEducationField(idx, 'graduationDate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. 2022 or May 2022"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">GPA / IPK (Optional)</label>
                  <input 
                    type="text" 
                    value={edu.gpa || ''} 
                    onChange={(e) => updateEducationField(idx, 'gpa', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. 3.85 / 4.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Location</label>
                  <input 
                    type="text" 
                    value={edu.location || ''} 
                    onChange={(e) => updateEducationField(idx, 'location', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-slate-900"
                    placeholder="e.g. Stanford, CA"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className={`p-4 rounded-xl border bg-white transition-all ${
        highlightSection === 'Skills' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      }`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5 mb-3">
          Skills (Normalized into Technical & Soft)
        </h3>
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Technical Skills (Comma separated)</label>
            <input 
              type="text" 
              value={data.skills.technical.join(', ')} 
              onChange={(e) => updateSkillList('technical', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-slate-900"
              placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Soft Skills / Core Competencies (Comma separated)</label>
            <input 
              type="text" 
              value={data.skills.soft.join(', ')} 
              onChange={(e) => updateSkillList('soft', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-slate-900"
              placeholder="e.g. Agile Leadership, Technical Mentorship, Cross-functional Collaboration"
            />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Projects</h3>
          <button 
            onClick={addProject}
            className="text-[11px] bg-slate-900 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black font-semibold transition-colors"
          >
            <Plus size={13} /> Add Project
          </button>
        </div>

        <div className="space-y-3.5">
          {(data.projects || []).map((project, idx) => (
            <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200 rounded-lg relative">
              <button 
                onClick={() => removeProject(idx)}
                className="absolute top-3 right-3 text-slate-300 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Project Name</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProjectField(idx, 'name', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Link (Optional)</label>
                  <input
                    type="text"
                    value={project.link || ''}
                    onChange={(e) => updateProjectField(idx, 'link', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-slate-900"
                    placeholder="github.com/project"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Description</label>
                  <textarea
                    rows={2}
                    value={project.description}
                    onChange={(e) => updateProjectField(idx, 'description', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-slate-900 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications & Languages */}
      <section className="p-4 rounded-xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Certifications (One per line)
          </label>
          <textarea
            rows={3}
            value={(data.certifications || []).join('\n')}
            onChange={(e) => updateCertifications(e.target.value)}
            placeholder="AWS Certified Solutions Architect&#10;Google Professional Cloud Architect"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:bg-white focus:border-slate-900 resize-none leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Languages (Comma separated)
          </label>
          <textarea
            rows={3}
            value={(data.languages || []).join(', ')}
            onChange={(e) => updateLanguages(e.target.value)}
            placeholder="English (Fluent), Indonesian (Native), Mandarin (Conversational)"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:bg-white focus:border-slate-900 resize-none leading-relaxed"
          />
        </div>
      </section>

    </div>
  );
};
