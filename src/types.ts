export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  id?: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  link: string;
  technologies?: string[];
}

export interface CustomSection {
  id: string;
  heading: string;
  items: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects?: Project[];
  certifications?: string[];
  languages?: string[];
  customSections?: CustomSection[];
}

export interface ResumeReviewResult {
  summary: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  quickTips: string[];
  categoryScores?: {
    overallReadiness: number;
    contentQuality: number;
    atsCompatibility: number;
    achievementStrength: number;
    recruiterReadability: number;
  };
}

export type ATSFont = 'Arial' | 'Calibri' | 'Times New Roman' | 'Georgia' | 'Garamond';

export type NormalizationMode = 'preserve' | 'improve' | 'optimize';

export interface ATSIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  section: string;
  message: string;
  recommendation: string;
}

export interface ATSValidationResult {
  overallScore: number;
  ruleScore: number;
  contentScore: number;
  issues: ATSIssue[];
  passedChecks: string[];
}

export interface JobMatchResult {
  matchScore: number;
  jobTitle?: string;
  strongMatches: string[];
  potentialGaps: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  targetRole?: string;
  lastModified: number;
  data: ResumeData;
  font: ATSFont;
}

export interface ImportReviewData {
  isScanned: boolean;
  warning?: string;
  fileName: string;
  extractedTextSample: string;
  detectedSections: string[];
  parsedData: ResumeData;
}
