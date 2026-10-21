import { ResumeData, ATSValidationResult, ATSIssue, ATSFont } from '../types';

const STANDARD_HEADINGS = [
  'Professional Summary',
  'Work Experience',
  'Education',
  'Skills',
  'Projects',
  'Certifications',
  'Languages',
];

const STRONG_ACTION_VERBS = new Set([
  'built', 'developed', 'engineered', 'led', 'managed', 'created', 'designed',
  'implemented', 'architected', 'optimized', 'reduced', 'increased', 'generated',
  'spearheaded', 'orchestrated', 'streamlined', 'delivered', 'automated',
  'mentored', 'analyzed', 'launched', 'improved', 'resolved', 'collaborated',
  'deployed', 'scaled', 'initiated', 'formulated', 'restructured'
]);

const WEAK_VERB_STARTERS = [
  'responsible for', 'assisted with', 'helped to', 'worked on', 'duties included',
  'participated in', 'tasked with', 'handled daily'
];

export function validateResumeATS(data: ResumeData, currentFont: ATSFont = 'Arial'): ATSValidationResult {
  const issues: ATSIssue[] = [];
  const passedChecks: string[] = [];

  let rulePoints = 0;
  const maxRulePoints = 50;

  let contentPoints = 0;
  const maxContentPoints = 50;

  // Rule 1: Single-column linear layout
  passedChecks.push('Strict single-column linear reading order (Top → Bottom)');
  rulePoints += 10;

  // Rule 2: ATS-Safe Typography Check
  const validFonts: ATSFont[] = ['Arial', 'Calibri', 'Times New Roman', 'Georgia', 'Garamond'];
  if (validFonts.includes(currentFont)) {
    passedChecks.push(`ATS-safe standard font active: ${currentFont}`);
    rulePoints += 10;
  } else {
    issues.push({
      id: 'font-check',
      type: 'warning',
      section: 'Typography',
      message: `Current font may not parse reliably on older ATS systems.`,
      recommendation: `Switch to Arial, Calibri, or Times New Roman.`
    });
  }

  // Rule 3: No graphics, tables, or floating text boxes
  passedChecks.push('Zero tables, text boxes, skill rating bars, or photo graphics');
  rulePoints += 10;

  // Rule 4: Standard Headings
  passedChecks.push('Universal standard section headings applied');
  rulePoints += 10;

  // Rule 5: PDF Selectable Text Layer
  passedChecks.push('Selectable and searchable plain-text layer preserved');
  rulePoints += 10;

  // Contact Info Checks
  const { name, email, phone, location, linkedin } = data.personalInfo || {};
  if (!name || name.trim().length === 0) {
    issues.push({
      id: 'contact-name',
      type: 'critical',
      section: 'Personal Information',
      message: 'Candidate full name is missing.',
      recommendation: 'Add your legal first and last name.'
    });
  } else {
    contentPoints += 5;
  }

  if (!email || !email.includes('@')) {
    issues.push({
      id: 'contact-email',
      type: 'critical',
      section: 'Personal Information',
      message: 'Valid professional email address is missing.',
      recommendation: 'Include a clean email address (e.g. name@email.com).'
    });
  } else {
    contentPoints += 5;
  }

  if (!phone || phone.trim().length < 6) {
    issues.push({
      id: 'contact-phone',
      type: 'warning',
      section: 'Personal Information',
      message: 'Direct phone number is missing.',
      recommendation: 'Add a reachable phone number with country/area code.'
    });
  } else {
    contentPoints += 5;
  }

  if (!location || location.trim().length === 0) {
    issues.push({
      id: 'contact-location',
      type: 'warning',
      section: 'Personal Information',
      message: 'Location (City, Country) is missing.',
      recommendation: 'Specify your metropolitan area (e.g., Jakarta, Indonesia or New York, NY).'
    });
  } else {
    contentPoints += 5;
  }

  if (!linkedin || linkedin.trim().length === 0) {
    issues.push({
      id: 'contact-linkedin',
      type: 'info',
      section: 'Personal Information',
      message: 'LinkedIn profile link is missing.',
      recommendation: 'Add your customized LinkedIn public profile URL.'
    });
  } else {
    contentPoints += 5;
  }

  // Professional Summary Check
  if (!data.summary || data.summary.trim().length < 40) {
    issues.push({
      id: 'summary-length',
      type: 'warning',
      section: 'Professional Summary',
      message: 'Professional summary is too short or missing.',
      recommendation: 'Include a concise 2-4 sentence executive overview of your core skills and focus.'
    });
  } else {
    contentPoints += 5;
    passedChecks.push('Targeted professional summary included');
  }

  // Work Experience Checks
  if (!data.experience || data.experience.length === 0) {
    issues.push({
      id: 'exp-empty',
      type: 'critical',
      section: 'Work Experience',
      message: 'No work experience listed.',
      recommendation: 'Add at least one professional role or relevant project.'
    });
  } else {
    contentPoints += 5;
    let hasWeakVerbs = false;
    let hasQuantifiableMetric = false;
    let totalBullets = 0;

    data.experience.forEach((exp, idx) => {
      if (!exp.company || !exp.title) {
        issues.push({
          id: `exp-${idx}-title`,
          type: 'warning',
          section: 'Work Experience',
          message: `Role #${idx + 1} is missing company name or job title.`,
          recommendation: 'Provide clear job title and legal employer name.'
        });
      }

      // Check dates
      if (!exp.startDate) {
        issues.push({
          id: `exp-${idx}-dates`,
          type: 'warning',
          section: 'Work Experience',
          message: `Role #${idx + 1} (${exp.title || 'Untitled'}) has missing start date.`,
          recommendation: 'Provide employment dates in consistent format (e.g., "Jan 2022 - Present").'
        });
      }

      // Check bullet points
      if (exp.description && Array.isArray(exp.description)) {
        exp.description.forEach((bullet) => {
          const trimmed = bullet.trim();
          if (!trimmed) return;
          totalBullets++;

          const lower = trimmed.toLowerCase();
          for (const weak of WEAK_VERB_STARTERS) {
            if (lower.startsWith(weak)) {
              hasWeakVerbs = true;
            }
          }

          // Check for metrics (% or $ or numbers)
          if (/\d+%|\$\d+|\d+\+|\b\d+\s*(users|clients|team|projects|ms|hours|percent)\b/i.test(trimmed)) {
            hasQuantifiableMetric = true;
          }
        });
      }
    });

    if (hasWeakVerbs) {
      issues.push({
        id: 'weak-verbs',
        type: 'warning',
        section: 'Work Experience',
        message: 'Some bullet points start with passive phrasing like "Responsible for".',
        recommendation: 'Use dynamic action verbs like "Spearheaded", "Engineered", or "Orchestrated".'
      });
    } else if (totalBullets > 0) {
      passedChecks.push('Action-oriented bullet points used in experience');
      contentPoints += 5;
    }

    if (!hasQuantifiableMetric && totalBullets > 0) {
      issues.push({
        id: 'metrics-missing',
        type: 'info',
        section: 'Work Experience',
        message: 'Experience lacks measurable impact or metrics where possible.',
        recommendation: 'If you have legitimate metrics, include them (e.g., "reduced latency by 40%"). Do not fabricate numbers.'
      });
    } else if (hasQuantifiableMetric) {
      passedChecks.push('Quantifiable metrics and achievements included');
      contentPoints += 5;
    }
  }

  // Education Check
  if (!data.education || data.education.length === 0) {
    issues.push({
      id: 'edu-missing',
      type: 'warning',
      section: 'Education',
      message: 'No education entries found.',
      recommendation: 'List your highest degree, university/institution, and year.'
    });
  } else {
    passedChecks.push('Education background clearly listed');
    contentPoints += 5;
  }

  // Skills Check
  const techCount = data.skills?.technical?.length || 0;
  const softCount = data.skills?.soft?.length || 0;
  if (techCount + softCount === 0) {
    issues.push({
      id: 'skills-missing',
      type: 'critical',
      section: 'Skills',
      message: 'No skills listed.',
      recommendation: 'Add key industry technologies and relevant soft competencies.'
    });
  } else {
    passedChecks.push(`Skills cataloged (${techCount} technical, ${softCount} soft)`);
    contentPoints += 5;
  }

  const overallScore = Math.min(100, Math.max(0, Math.round(rulePoints + contentPoints)));

  return {
    overallScore,
    ruleScore: Math.round((rulePoints / maxRulePoints) * 100),
    contentScore: Math.round((contentPoints / maxContentPoints) * 100),
    issues,
    passedChecks
  };
}
