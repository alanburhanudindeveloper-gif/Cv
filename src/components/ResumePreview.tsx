import React from 'react';
import { ResumeData, ATSFont } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  font?: ATSFont;
}

export const getATSFontFamily = (font?: ATSFont | string): string => {
  switch (font) {
    case 'Calibri':
      return 'Calibri, Candara, "Segoe UI", Segoe, Optima, Arial, sans-serif';
    case 'Times New Roman':
      return '"Times New Roman", Times, Georgia, serif';
    case 'Georgia':
      return 'Georgia, "Times New Roman", Times, serif';
    case 'Garamond':
      return 'Garamond, "Baskerville", "Hoefler Text", "Times New Roman", serif';
    case 'Arial':
    default:
      return 'Arial, Helvetica, "Helvetica Neue", sans-serif';
  }
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, font = 'Arial' }) => {
  const fontFamily = getATSFontFamily(font);

  return (
    <div 
      className="bg-[#ffffff] p-10 sm:p-12 text-[#000000] w-full min-h-full mx-auto print:shadow-none print:p-0 print:m-0 select-text"
      style={{ fontFamily }}
    >
      {/* ATS Friendly Single-Column Container: No tables, no columns, no background graphics */}
      <div className="w-full text-[12px] leading-relaxed text-[#111827]">
        {/* Contact Information (Centered or Left-Aligned, Single-Column Stack) */}
        <header className="text-center mb-5 pb-1">
          <h1 className="text-2xl font-bold uppercase tracking-normal mb-1.5 text-[#000000]">
            {data.personalInfo.name || "YOUR NAME"}
          </h1>
          
          <div className="text-[12px] text-[#374151] flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo.phone && (
              <>
                {data.personalInfo.location && <span className="text-[#9ca3af]">|</span>}
                <span>{data.personalInfo.phone}</span>
              </>
            )}
            {data.personalInfo.email && (
              <>
                {(data.personalInfo.location || data.personalInfo.phone) && <span className="text-[#9ca3af]">|</span>}
                <span>{data.personalInfo.email}</span>
              </>
            )}
          </div>

          {(data.personalInfo.linkedin || data.personalInfo.website) && (
            <div className="text-[11.5px] text-[#374151] flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 mt-1">
              {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
              {data.personalInfo.website && (
                <>
                  {data.personalInfo.linkedin && <span className="text-[#9ca3af]">|</span>}
                  <span>{data.personalInfo.website}</span>
                </>
              )}
            </div>
          )}
        </header>

        {/* Section: Professional Summary */}
        {data.summary && (
          <section className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-1.5">
              Professional Summary
            </h2>
            <p className="text-[12px] leading-relaxed text-[#1f2937]">
              {data.summary}
            </p>
          </section>
        )}

        {/* Section: Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              Work Experience
            </h2>
            <div className="space-y-3.5">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="block">
                  <div className="flex justify-between items-baseline font-bold text-[#000000] text-[12px]">
                    <span>{exp.company}</span>
                    <span className="font-semibold text-[#374151] text-[11.5px]">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[#111827] text-[12px] mb-1">
                    <span className="font-medium italic">{exp.title}</span>
                    {exp.location && <span className="text-[11px] text-[#4b5563]">{exp.location}</span>}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc ml-5 space-y-1 mt-1 text-[#1f2937] text-[12px]">
                      {exp.description.map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-snug pl-0.5">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="block">
                  <div className="flex justify-between items-baseline font-bold text-[#000000] text-[12px]">
                    <span>{edu.school}</span>
                    <span className="font-semibold text-[#374151] text-[11.5px]">{edu.graduationDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[#111827] text-[12px]">
                    <div>
                      <span className="font-medium">{edu.degree}</span>
                      {edu.location ? <span className="text-[#4b5563]">, {edu.location}</span> : ""}
                    </div>
                    {edu.gpa && (
                      <span className="text-[11.5px] font-medium text-[#111827]">
                        GPA: {edu.gpa}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              Projects
            </h2>
            <div className="space-y-2.5">
              {data.projects.map((project, idx) => (
                <div key={idx} className="block">
                  <div className="flex justify-between items-baseline text-[12px]">
                    <span className="font-bold text-[#000000]">{project.name}</span>
                    {project.link && (
                      <span className="text-[11px] text-[#2563eb] underline">
                        {project.link}
                      </span>
                    )}
                  </div>
                  <p className="text-[#1f2937] text-[12px] mt-0.5 leading-snug">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Skills */}
        {data.skills && (data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
          <section className="mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              Skills
            </h2>
            <div className="text-[12px] space-y-1.5 text-[#111827]">
              {data.skills.technical.length > 0 && (
                <p className="leading-snug">
                  <strong className="font-bold text-[#000000]">Technical Skills: </strong>
                  <span>{data.skills.technical.join(", ")}</span>
                </p>
              )}
              {data.skills.soft.length > 0 && (
                <p className="leading-snug">
                  <strong className="font-bold text-[#000000]">Soft Skills: </strong>
                  <span>{data.skills.soft.join(", ")}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Section: Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              Certifications
            </h2>
            <ul className="list-disc ml-5 space-y-1 text-[#1f2937] text-[12px]">
              {data.certifications.map((cert, idx) => (
                <li key={idx} className="leading-snug pl-0.5">
                  {cert}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Section: Languages */}
        {data.languages && data.languages.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              Languages
            </h2>
            <p className="text-[#1f2937] text-[12px]">
              {data.languages.join(" • ")}
            </p>
          </section>
        )}

        {/* Custom Sections */}
        {data.customSections && data.customSections.map((sec, idx) => (
          <section key={idx} className="mb-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#000000] border-b border-[#000000] pb-0.5 mb-2">
              {sec.heading}
            </h2>
            <ul className="list-disc ml-5 space-y-1 text-[#1f2937] text-[12px]">
              {sec.items.map((item, iIdx) => (
                <li key={iIdx} className="leading-snug pl-0.5">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};
