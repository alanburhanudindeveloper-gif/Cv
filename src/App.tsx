import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore - html2pdf.js does not have official standard typescript declarations
import html2pdf from 'html2pdf.js';
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Info,
  ChevronLeft,
  CheckCircle2,
  UploadCloud,
  FileCheck2,
  Target,
  Download,
  Printer,
  Copy,
  Plus,
  Trash2,
  Edit2,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Layers,
  HelpCircle,
  FileUp,
  RotateCcw
} from 'lucide-react';
import { ResumePreview, getATSFontFamily } from './components/ResumePreview';
import { ResumeForm } from './components/ResumeForm';
import { AIReview } from './components/AIReview';
import { ResumeImportModal } from './components/ResumeImportModal';
import { ATSValidatorModal } from './components/ATSValidatorModal';
import { JobMatchModal } from './components/JobMatchModal';
import { PreExportCheckModal } from './components/PreExportCheckModal';
import { 
  ResumeData, 
  ResumeReviewResult, 
  ATSFont, 
  ResumeVersion, 
  ImportReviewData, 
  NormalizationMode 
} from './types';
import { validateResumeATS } from './lib/atsValidator';
import { cn } from './lib/utils';

const ATS_FONTS: { id: ATSFont; label: string; type: string }[] = [
  { id: 'Arial', label: 'Arial', type: 'Sans-Serif (Universal)' },
  { id: 'Calibri', label: 'Calibri', type: 'Sans-Serif (Standard)' },
  { id: 'Times New Roman', label: 'Times New Roman', type: 'Serif (Traditional)' },
  { id: 'Georgia', label: 'Georgia', type: 'Serif (Modern)' },
  { id: 'Garamond', label: 'Garamond', type: 'Serif (Compact)' },
];

const DEFAULT_RESUME: ResumeData = {
  personalInfo: {
    name: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.dev",
  },
  summary: "Results-driven Senior Software Engineer with 6+ years of experience designing scalable cloud architectures, high-throughput microservices, and modern web applications. Proven track record of optimizing database performance and spearheading CI/CD automation in fast-paced product environments.",
  experience: [
    {
      title: "Senior Full Stack Engineer",
      company: "CloudScale Technologies",
      location: "San Francisco, CA",
      startDate: "March 2021",
      endDate: "Present",
      description: [
        "Architected and deployed distributed backend microservices handling 25M+ daily requests using Go, TypeScript, and PostgreSQL.",
        "Streamlined database query execution and implemented Redis caching, reducing API latency by 42%.",
        "Orchestrated Docker containerization and Kubernetes cluster management on AWS, decreasing deployment downtime by 85%.",
        "Mentored 5 junior and mid-level engineers through structured code reviews and system architecture design sessions."
      ]
    },
    {
      title: "Software Engineer",
      company: "DataFlow Systems",
      location: "San Jose, CA",
      startDate: "July 2018",
      endDate: "February 2021",
      description: [
        "Engineered real-time customer analytics dashboards utilizing React, TypeScript, and Node.js with sub-second data refresh.",
        "Integrated automated end-to-end testing and GitLab CI pipelines, accelerating feature delivery turnaround from 14 days to 4 days.",
        "Optimized Elasticsearch multi-tenant search indexing for 10M+ documents, improving query responsiveness by 60%."
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "May 2018",
      gpa: "3.85 / 4.00"
    }
  ],
  skills: {
    technical: ["Go", "TypeScript", "Python", "React", "Node.js", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Git", "REST APIs", "GraphQL"],
    soft: ["Cross-functional Leadership", "Agile / Scrum Methodologies", "Technical Mentorship", "System Architecture Design", "Problem Solving"]
  },
  projects: [
    {
      name: "PulseQueue - Open Source Job Scheduler",
      description: "Distributed background task queue in Go with at-least-once delivery guarantees and web dashboard.",
      link: "github.com/alexmorgan/pulsequeue"
    }
  ],
  certifications: [
    "AWS Certified Solutions Architect - Associate",
    "Certified Kubernetes Administrator (CKA)"
  ],
  languages: ["English (Fluent)", "Spanish (Conversational)"]
};

const SAMPLE_TEXT_PRESETS = {
  softwareEngineer: `John Doe
johndoe@email.com | +1 (555) 234-5678 | San Francisco, CA | linkedin.com/in/johndoe | github.com/johndoe

Professional Summary:
Accomplished Full-Stack Software Engineer with 6+ years of experience designing scalable microservices, cloud applications, and responsive web platforms. Proven track record of reducing latency by 40% and mentoring high-velocity engineering teams.

Work Experience:
Senior Software Engineer - CloudScale Inc (San Francisco, CA)
March 2021 - Present
- Architected and deployed microservices backend using Go, .NET Core, and PostgreSQL handling 25M+ daily requests.
- Reduced database query latency by 45% through Redis caching and query indexing optimization.
- Led migration of monolithic backend to Kubernetes and AWS ECS, decreasing deployment downtime by 90%.
- Mentored 6 junior engineers through code reviews and bi-weekly architecture design syncs.

Software Engineer - TechWave Systems (San Jose, CA)
July 2018 - February 2021
- Developed RESTful APIs and UI components with React, TypeScript, and Node.js for client analytics dashboard.
- Integrated automated CI/CD pipelines in GitLab, speeding up release turnaround by 3x.
- Implemented Elasticsearch indexing for multi-tenant customer search, improving search speed by 60%.

Education:
B.S. in Computer Science - University of California, Berkeley (Berkeley, CA)
Graduated: May 2018
GPA: 3.85 / 4.0

Technical Skills:
Go, Python, TypeScript, C#, .NET Core, React, Node.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, REST APIs, GraphQL

Soft Skills:
Cross-functional Leadership, Agile / Scrum, Problem Solving, Code Review, Mentorship

Certifications:
- AWS Certified Solutions Architect - Associate
- Certified Kubernetes Administrator (CKA)`,

  productManager: `Sarah Jenkins
sarah.jenkins@email.com | +1 (312) 555-0199 | Chicago, IL | linkedin.com/in/sarahjenkins

Professional Summary:
Results-driven Senior Product Manager with 7+ years of experience launching B2B SaaS products and driving user growth. Experienced in data-driven prioritization, cross-functional agile roadmapping, and maximizing retention.

Work Experience:
Lead Product Manager - EnterpriseSync (Chicago, IL)
January 2022 - Present
- Spearheaded the launch of an AI-assisted automation module, driving $3.2M ARR in its first 12 months.
- Increased user monthly active retention by 22% through cohort-driven UX refinements and onboarding redesign.
- Managed a cross-functional squad of 14 engineers, designers, and data scientists across 2-week agile sprint cycles.

Product Manager - Apex Digital (Chicago, IL)
June 2018 - December 2021
- Defined product roadmap and user stories for enterprise billing platform processing $80M in annual transactions.
- Reduced customer onboarding drop-off rate from 38% to 14% via self-service activation workflows.

Education:
B.A. in Economics & Business - Northwestern University (Evanston, IL)
Graduated: June 2018
GPA: 3.9 / 4.0

Technical Skills:
Product Analytics, Mixpanel, Amplitude, SQL, Jira, Agile Roadmapping, A/B Testing, User Research, Wireframing

Soft Skills:
Executive Communication, Stakeholder Management, Team Leadership, Strategic Planning

Certifications:
- Pragmatic Institute Certified (PMC-III)
- Certified Scrum Product Owner (CSPO)`
};

export default function App() {
  // Versions State
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    try {
      const saved = localStorage.getItem('ats_resume_versions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load versions from localStorage');
    }
    return [
      {
        id: 'v1-general',
        name: 'General Resume',
        targetRole: 'Full Stack Engineer',
        lastModified: Date.now(),
        data: DEFAULT_RESUME,
        font: 'Arial'
      }
    ];
  });

  const [activeVersionId, setActiveVersionId] = useState<string>('v1-general');

  // Active version data
  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];
  const data = activeVersion.data;
  const selectedFont = activeVersion.font || 'Arial';

  // Navigation & View Modes
  const [leftTab, setLeftTab] = useState<'form' | 'upload' | 'text' | 'review'>('form');
  const [showEntryHub, setShowEntryHub] = useState(false);
  const [inputText, setInputText] = useState('');
  const [textMode, setTextMode] = useState<NormalizationMode>('preserve');

  // Modals & Panels
  const [importReviewData, setImportReviewData] = useState<ImportReviewData | null>(null);
  const [showAtsValidatorModal, setShowAtsValidatorModal] = useState(false);
  const [showJobMatchModal, setShowJobMatchModal] = useState(false);
  const [showPreExportModal, setShowPreExportModal] = useState(false);
  const [highlightSection, setHighlightSection] = useState<string | undefined>(undefined);

  // Async States
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfUploadStep, setPdfUploadStep] = useState<string>('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ResumeReviewResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ats_resume_versions', JSON.stringify(versions));
    } catch (e) {
      console.warn('Failed to persist versions');
    }
  }, [versions]);

  // Update current resume data
  const handleUpdateResume = (newData: ResumeData) => {
    setVersions(prev => prev.map(v => {
      if (v.id === activeVersionId) {
        return { ...v, data: newData, lastModified: Date.now() };
      }
      return v;
    }));
  };

  // Update current font
  const handleUpdateFont = (newFont: ATSFont) => {
    setVersions(prev => prev.map(v => {
      if (v.id === activeVersionId) {
        return { ...v, font: newFont, lastModified: Date.now() };
      }
      return v;
    }));
  };

  // Manage Versions
  const handleCreateNewVersion = () => {
    const role = prompt("Enter target role or version name (e.g., 'Backend Engineer', 'Product Lead'):");
    if (!role) return;
    const newVersion: ResumeVersion = {
      id: 'v-' + Date.now(),
      name: role,
      targetRole: role,
      lastModified: Date.now(),
      data: JSON.parse(JSON.stringify(data)),
      font: selectedFont
    };
    setVersions(prev => [...prev, newVersion]);
    setActiveVersionId(newVersion.id);
  };

  const handleDuplicateVersion = () => {
    const newVersion: ResumeVersion = {
      id: 'v-' + Date.now(),
      name: `${activeVersion.name} (Copy)`,
      targetRole: activeVersion.targetRole,
      lastModified: Date.now(),
      data: JSON.parse(JSON.stringify(data)),
      font: selectedFont
    };
    setVersions(prev => [...prev, newVersion]);
    setActiveVersionId(newVersion.id);
  };

  const handleDeleteVersion = (id: string) => {
    if (versions.length <= 1) {
      alert("You must keep at least one resume version.");
      return;
    }
    if (!confirm("Are you sure you want to delete this resume version?")) return;
    setVersions(prev => prev.filter(v => v.id !== id));
    if (activeVersionId === id) {
      setActiveVersionId(versions.find(v => v.id !== id)!.id);
    }
  };

  // Deterministic ATS Validation
  const validationResult = validateResumeATS(data, selectedFont);

  // File Upload Handler (PDF)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert("Please upload a valid PDF document.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds 15MB limit. Please upload a smaller PDF.");
      return;
    }

    setIsProcessingPdf(true);
    setPdfUploadStep('Extracting PDF text layer deterministically...');
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setPdfUploadStep('Analyzing layout structure & scanned document check...');

          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              fileName: file.name,
              mode: 'preserve'
            })
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to parse resume PDF');
          }

          const parsed = await response.json();
          setIsProcessingPdf(false);

          // Open Verification Modal (Requirement 4: Do not blindly overwrite!)
          setImportReviewData({
            isScanned: parsed.isScanned,
            warning: parsed.warning,
            fileName: file.name,
            extractedTextSample: parsed.extractedTextSample,
            detectedSections: parsed.detectedSections,
            parsedData: parsed.resume
          });
        } catch (innerErr: any) {
          console.error(innerErr);
          setErrorMessage(innerErr.message || 'Error processing PDF document');
          setIsProcessingPdf(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read the file.');
        setIsProcessingPdf(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
      setIsProcessingPdf(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Convert raw text to resume
  const handleConvertRawText = async () => {
    if (!inputText.trim()) {
      alert("Please enter or paste resume text first.");
      return;
    }

    setIsGeneratingText(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode: textMode
        })
      });

      if (!response.ok) throw new Error("Failed to convert text into ATS format.");
      const generated = await response.json();

      setImportReviewData({
        isScanned: false,
        fileName: 'Pasted Text CV',
        extractedTextSample: inputText.slice(0, 500),
        detectedSections: ['Personal Information', 'Summary', 'Experience', 'Education', 'Skills'],
        parsedData: generated
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process text.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  // Run AI Review
  const handleRunReview = async () => {
    setIsReviewing(true);
    setLeftTab('review');
    try {
      const res = await fetch('/api/review-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data })
      });
      if (!res.ok) throw new Error('Failed to review resume');
      const result = await res.json();
      setReviewResult(result);
    } catch (e: any) {
      alert(e.message || 'Error running review');
    } finally {
      setIsReviewing(false);
    }
  };

  // PDF Export Execution
  const executePdfDownload = async () => {
    setIsExporting(true);
    setShowPreExportModal(false);

    try {
      // 1. Wait for fonts to be ready
      if ('fonts' in document) {
        await (document as any).fonts.ready;
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const element = document.getElementById('resume-export-content');
      if (!element) {
        throw new Error("Export container not found.");
      }

      const appliedFontFamily = getATSFontFamily(selectedFont);
      const cleanCandidateName = (data.personalInfo.name || "Candidate").replace(/[^a-zA-Z0-9]/g, '_');

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${cleanCandidateName}_ATS_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 1000,
          onclone: (clonedDoc: Document) => {
            const exportContent = clonedDoc.getElementById('resume-export-content');
            if (exportContent) {
              exportContent.style.display = 'block';
              exportContent.style.position = 'static';
              exportContent.style.fontFamily = appliedFontFamily;
              exportContent.style.background = '#ffffff';
              exportContent.style.color = '#000000';
            }

            // Remove problematic CSS variables/oklch colors that break html2canvas
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                const style = el.getAttribute('style') || '';
                if (style.includes('oklch')) {
                  el.setAttribute('style', style.replace(/oklch\([^)]+\)/g, '#000000'));
                }
              }
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err: any) {
      console.error("Export Error:", err);
      alert("Failed to export PDF: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger Pre-Export Check
  const handleStartExport = () => {
    setShowPreExportModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      
      {/* Top Navigation Bar */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Value Proposition */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <FileCheck2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">AI ATS RESUME</span>
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Deterministic + AI-Assisted
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Turn any resume into an ATS-compliant, single-column document.
              </p>
            </div>
          </div>

          {/* Versions Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
            <Layers size={14} className="text-slate-500 ml-1.5" />
            <select
              value={activeVersionId}
              onChange={(e) => setActiveVersionId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer pr-2 text-xs"
            >
              {versions.map((ver) => (
                <option key={ver.id} value={ver.id}>
                  {ver.name} {ver.targetRole ? `(${ver.targetRole})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateNewVersion}
              title="Create New Targeted Version"
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Plus size={13} />
            </button>
            <button
              onClick={handleDuplicateVersion}
              title="Duplicate Current Version"
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Copy size={13} />
            </button>
            {versions.length > 1 && (
              <button
                onClick={() => handleDeleteVersion(activeVersionId)}
                title="Delete Version"
                className="p-1 hover:bg-white rounded text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Action Tools: ATS Score, Job Match, Font, Export */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Deterministic ATS Compatibility Score Pill */}
            <button
              onClick={() => setShowAtsValidatorModal(true)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                validationResult.overallScore >= 80 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck size={14} className={validationResult.overallScore >= 80 ? 'text-emerald-600' : 'text-amber-600'} />
              <span>ATS Score: {validationResult.overallScore}%</span>
            </button>

            {/* Job Matcher */}
            <button
              onClick={() => setShowJobMatchModal(true)}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Target size={14} className="text-indigo-600" />
              <span>Job Match</span>
            </button>

            {/* Font Picker */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Font</span>
              <select
                value={selectedFont}
                onChange={(e) => handleUpdateFont(e.target.value as ATSFont)}
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer pr-1 text-xs"
              >
                {ATS_FONTS.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.label} ({f.type.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            <button
              onClick={handlePrint}
              title="Print document directly"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-colors shadow-xs"
            >
              <Printer size={15} />
            </button>

            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isExporting ? 'Generating PDF...' : 'Download ATS PDF'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input, Upload, Editor, and AI Review (5 cols) */}
        <section className="no-print lg:col-span-5 flex flex-col gap-4">
          
          {/* Mode Switcher Tabs */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs font-semibold">
            <button
              onClick={() => setLeftTab('form')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                leftTab === 'form'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Edit2 size={13} />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setLeftTab('upload')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                leftTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileUp size={13} />
              <span>Upload PDF</span>
            </button>

            <button
              onClick={() => setLeftTab('text')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                leftTab === 'text'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText size={13} />
              <span>Paste Text</span>
            </button>

            <button
              onClick={handleRunReview}
              disabled={isReviewing}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                leftTab === 'review'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
              }`}
            >
              <Sparkles size={13} />
              <span>{isReviewing ? 'Analyzing...' : 'AI Review'}</span>
            </button>
          </div>

          {/* Mode 1: Upload Existing PDF Resume (Core Feature) */}
          {leftTab === 'upload' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Upload Existing Resume → Convert to ATS Format
                </h3>
                <p className="text-xs text-slate-500">
                  Upload PDF from Canva, multi-column templates, or old CVs. We deterministically extract text, detect sections, and structure into an ATS single column format.
                </p>
              </div>

              {/* Drag & Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click to browse or drag & drop your PDF resume
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Supports selectable PDF and Scanned Documents (up to 15MB)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Progress State */}
              {isProcessingPdf && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <RefreshCw size={14} className="animate-spin text-blue-600" />
                    <span>Processing PDF Document...</span>
                  </div>
                  <p className="text-[11.5px] text-blue-700 pl-5">
                    {pdfUploadStep}
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Process Guarantees */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11.5px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Deterministic text extraction with pdf.js layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Scanned PDF & OCR fallback detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Mandatory verification review before replacing data</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Paste Raw Text */}
          {leftTab === 'text' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Paste Resume Raw Text
                  </h3>
                  <p className="text-[11px] text-slate-400">Old CV, LinkedIn bio, career notes, or draft</p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] text-slate-400">Sample:</span>
                  <button
                    onClick={() => setInputText(SAMPLE_TEXT_PRESETS.softwareEngineer)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    SWE
                  </button>
                  <button
                    onClick={() => setInputText(SAMPLE_TEXT_PRESETS.productManager)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    PM
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                placeholder="Paste your career history, LinkedIn summary, or draft text here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:bg-white focus:border-slate-900 resize-none font-mono leading-relaxed"
              />

              {/* Normalization Strategy */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700">Conversion Strategy:</span>
                <div className="flex rounded-lg bg-slate-100 p-0.5">
                  <button
                    onClick={() => setTextMode('preserve')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      textMode === 'preserve' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Preserve Content
                  </button>
                  <button
                    onClick={() => setTextMode('improve')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      textMode === 'improve' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Improve Wording
                  </button>
                  <button
                    onClick={() => setTextMode('optimize')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      textMode === 'optimize' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Optimize ATS
                  </button>
                </div>
              </div>

              <button
                onClick={handleConvertRawText}
                disabled={isGeneratingText}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGeneratingText ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Converting to ATS Structure...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Convert to ATS Resume (Review First)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 3: Structured Resume Editor */}
          {leftTab === 'form' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs max-h-[82vh] overflow-y-auto">
              <ResumeForm 
                data={data} 
                onChange={handleUpdateResume}
                highlightSection={highlightSection}
              />
            </div>
          )}

          {/* Mode 4: AI Review Panel */}
          {leftTab === 'review' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs h-[82vh] overflow-hidden">
              <AIReview 
                result={reviewResult} 
                onClose={() => setLeftTab('form')}
              />
            </div>
          )}

        </section>

        {/* Right Column: Live ATS Single-Column Preview (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-3">
          
          {/* Preview Toolbar */}
          <div className="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-800">Deterministic ATS Preview</span>
              <span className="text-[11px] text-slate-400">| A4 Single Column</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                Font: {selectedFont}
              </span>
              <span>• Linear Reading Order</span>
            </div>
          </div>

          {/* Resume A4 Paper Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-h-[842px] print:border-none print:shadow-none print:rounded-none">
            <ResumePreview data={data} font={selectedFont} />
          </div>

        </section>

      </main>

      {/* Hidden high-fidelity export element strictly for html2pdf to clone */}
      <div 
        id="resume-export-content" 
        className="hidden"
        style={{
          width: '210mm',
          backgroundColor: '#ffffff',
          color: '#000000',
          margin: 0,
          padding: 0
        }}
      >
        <ResumePreview data={data} font={selectedFont} />
      </div>

      {/* MODAL 1: Resume Import Review (Requirement 4) */}
      {importReviewData && (
        <ResumeImportModal
          importData={importReviewData}
          onConfirm={(confirmedData) => {
            handleUpdateResume(confirmedData);
            setImportReviewData(null);
            setLeftTab('form');
          }}
          onEditInForm={(confirmedData) => {
            handleUpdateResume(confirmedData);
            setImportReviewData(null);
            setLeftTab('form');
          }}
          onCancel={() => setImportReviewData(null)}
        />
      )}

      {/* MODAL 2: ATS Technical Validator (Requirement 10 & 11) */}
      {showAtsValidatorModal && (
        <ATSValidatorModal
          validation={validationResult}
          onClose={() => setShowAtsValidatorModal(false)}
          onFixSection={(sec) => {
            setHighlightSection(sec);
            setLeftTab('form');
          }}
        />
      )}

      {/* MODAL 3: Job Description Matching (Requirement 8) */}
      {showJobMatchModal && (
        <JobMatchModal
          resumeData={data}
          onClose={() => setShowJobMatchModal(false)}
        />
      )}

      {/* MODAL 4: Pre-Export Check (Requirement 16) */}
      {showPreExportModal && (
        <PreExportCheckModal
          validation={validationResult}
          onProceedExport={executePdfDownload}
          onReviewInEditor={() => {
            setShowPreExportModal(false);
            setLeftTab('form');
          }}
          onCancel={() => setShowPreExportModal(false)}
        />
      )}

    </div>
  );
}
