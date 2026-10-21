import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Resume schema definition for Gemini structured JSON output
const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ["name", "email", "phone", "location"]
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "company", "startDate", "endDate", "description"]
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          location: { type: Type.STRING },
          graduationDate: { type: Type.STRING },
          gpa: { type: Type.STRING },
        },
        required: ["degree", "school", "graduationDate"]
      }
    },
    skills: {
      type: Type.OBJECT,
      properties: {
        technical: { type: Type.ARRAY, items: { type: Type.STRING } },
        soft: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["technical", "soft"]
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          link: { type: Type.STRING },
        },
        required: ["name", "description"]
      }
    },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["personalInfo", "summary", "experience", "education", "skills"]
};

// Deterministic PDF text extractor using pdf-parse
async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const extractedText = (result.text || (result.pages && result.pages.map((p: any) => p.text).join("\n")) || "").trim();
    const pageCount = result.pages?.length || 1;
    await parser.destroy();
    return { text: extractedText, pages: pageCount };
  } catch (err) {
    console.warn("pdf-parse extraction warning/error:", err);
    return { text: "", pages: 0 };
  }
}

// Deterministic section detection in extracted text
function detectSectionsFromText(text: string): string[] {
  const detected: string[] = [];
  const lower = text.toLowerCase();

  const patterns: [string, RegExp][] = [
    ["Personal Information", /\b(email|phone|contact|curriculum|resume|address|linkedin|portfolio)\b/i],
    ["Professional Summary", /\b(summary|profile|about me|objective|executive summary|overview)\b/i],
    ["Work Experience", /\b(experience|employment|work history|professional experience|career history|positions)\b/i],
    ["Education", /\b(education|university|college|bachelor|master|degree|academic|gpa|ipk)\b/i],
    ["Skills", /\b(skills|technical skills|technologies|competencies|proficiencies|tools)\b/i],
    ["Projects", /\b(projects|personal projects|portfolio projects|key initiatives)\b/i],
    ["Certifications", /\b(certifications|certificates|licenses|credentials|accreditations)\b/i],
    ["Languages", /\b(languages|language proficiencies|bilingual)\b/i],
  ];

  for (const [name, regex] of patterns) {
    if (regex.test(lower)) {
      detected.push(name);
    }
  }

  return detected;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payloads up to 25MB for large PDFs
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // 1. PDF Upload & Extraction Pipeline
  app.post("/api/parse-pdf", async (req, res) => {
    try {
      const { fileBase64, fileName = "Uploaded_Resume.pdf", mode = "preserve" } = req.body;
      if (!fileBase64) {
        return res.status(400).json({ error: "No PDF file data provided" });
      }

      // Clean base64 header if present
      const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      // Step 1 — Deterministic PDF Text Extraction
      const { text: extractedText, pages } = await extractTextFromPdf(buffer);
      const isScanned = extractedText.replace(/\s+/g, "").length < 40;

      let detectedSections: string[] = [];
      let warningMessage: string | null = null;
      let resumeData: any = null;

      if (!isScanned) {
        // Deterministic layout / structure detection
        detectedSections = detectSectionsFromText(extractedText);

        const modeInstruction = mode === "preserve"
          ? "CRITICAL RULE: PRESERVE CONTENT. Keep the user's authentic wording, job titles, employer names, and descriptions verbatim as much as possible. Do NOT rephrase into generic corporate speak."
          : mode === "improve"
          ? "RULE: IMPROVE WORDING. Refine grammar and ensure bullet points start with strong active verbs without fabricating achievements."
          : "RULE: OPTIMIZE FOR ATS. Normalize formatting and section titles into standard universal headers.";

        const prompt = `You are a professional ATS resume parser and conversion specialist.
Convert the following extracted PDF text into structured JSON matching the provided schema.

${modeInstruction}

IMPORTANT ATS CONVERSION PRINCIPLES:
1. Strict Single-Column: Flatten any multi-column layout from the original PDF into a clean top-to-bottom reading order.
2. Standard Section Headings: Map sections into 'personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'.
3. NO FABRICATION: Never invent or hallucinate metrics (%, $), employers, tools, dates, or credentials that are not in the source text.
4. GPA/Honors: If education mentions GPA, IPK, or cum laude honors, extract it into the 'gpa' field.
5. Experience bullets: Format each duty or achievement as a clean single string without markdown or decorative symbols.
6. If any field is not available, provide an empty string or empty array.

Extracted PDF Content:
${extractedText}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
          },
        });

        resumeData = JSON.parse(response.text || "{}");
      } else {
        // Scanned PDF Pipeline (OCR via Gemini Multimodal)
        warningMessage = "This PDF appears to be scanned or image-based. OCR was used to extract the content; please verify the extracted information.";

        const prompt = `You are an expert OCR and resume extraction specialist.
Analyze this scanned/image-based resume PDF document.
Extract all visible text via OCR and format it directly into the structured resume JSON schema.

CRITICAL RULES:
1. Read the text accurately from top to bottom.
2. Do NOT invent dates, names, or metrics not visible in the document.
3. Extract GPA or IPK if visible into the education 'gpa' field.
4. Separate technical skills and soft skills.
5. Return strictly valid JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
          },
        });

        resumeData = JSON.parse(response.text || "{}");
        detectedSections = [
          "Personal Information",
          "Professional Summary",
          "Work Experience",
          "Education",
          "Skills",
        ];
      }

      res.json({
        isScanned,
        warning: warningMessage,
        fileName,
        extractedTextSample: extractedText.slice(0, 500) || "(Scanned image document)",
        detectedSections,
        resume: resumeData,
      });
    } catch (error: any) {
      console.error("PDF Parse Error:", error);
      res.status(500).json({ error: error.message || "Failed to process PDF" });
    }
  });

  // 2. Raw Text to ATS Resume (Paste Resume / Career draft)
  app.post("/api/generate-resume", async (req, res) => {
    try {
      const { text, mode = "preserve" } = req.body;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Text content is required" });
      }

      const modeInstruction = mode === "preserve"
        ? "PRESERVE USER CONTENT: Maintain the user's authentic facts, titles, and phrasing. Do not alter their core wording."
        : mode === "improve"
        ? "IMPROVE WORDING: Polish tone and ensure bullet points start with strong action verbs without fabricating achievements."
        : "OPTIMIZE FOR ATS: Normalize structure and headers for optimal ATS parsing.";

      const prompt = `You are an ATS resume builder specialist. Convert this raw text (career notes, old CV, or LinkedIn profile) into structured ATS-compliant resume JSON.

${modeInstruction}

RULES:
- Standard single-column hierarchy.
- No hallucinations: Only use facts, dates, and companies present in the text.
- If GPA/IPK is stated, place in education.gpa.
- Divide skills into technical and soft skills.

Source Text:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Generate Resume Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate resume" });
    }
  });

  // 3. In-line AI Bullet Point Rewriter
  app.post("/api/rewrite-bullet", async (req, res) => {
    try {
      const { bullet, context = "" } = req.body;
      if (!bullet || bullet.trim().length === 0) {
        return res.status(400).json({ error: "Bullet text is required" });
      }

      const prompt = `You are a professional ATS resume copywriter.
Rewrite the following resume bullet point to make it compelling, action-oriented, and ATS-optimized.

ORIGINAL BULLET: "${bullet}"
${context ? `ROLE CONTEXT: "${context}"` : ""}

CRITICAL INTEGRITY RULES:
1. Start with a strong active verb (e.g., 'Spearheaded', 'Engineered', 'Optimized', 'Streamlined', 'Delivered').
2. NEVER invent fake metrics, percentages, or dollar amounts that are not in the original text (e.g. do not invent "by 35%" if no number was given).
3. If no metric is given, focus on method and business impact (e.g., "streamlined process workflows to improve team throughput").
4. Provide 3 high quality distinct variations.

Output schema:
{
  "suggestions": ["Variation 1", "Variation 2", "Variation 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["suggestions"],
          },
        },
      });

      const result = JSON.parse(response.text || '{"suggestions":[]}');
      res.json(result);
    } catch (error: any) {
      console.error("Rewrite Bullet Error:", error);
      res.status(500).json({ error: error.message || "Failed to rewrite bullet" });
    }
  });

  // 4. Comprehensive AI Resume Reviewer
  app.post("/api/review-resume", async (req, res) => {
    try {
      const { resumeData } = req.body;
      if (!resumeData) {
        return res.status(400).json({ error: "Resume data is required" });
      }

      const prompt = `You are a veteran technical recruiter and ATS auditor.
Analyze the following resume JSON thoroughly across:
1. Overall Readiness
2. Content Quality & Clarity
3. ATS Compatibility & Keyword Balance
4. Achievement Strength & Action Verbs
5. Recruiter Readability

Provide an honest, highly actionable review with specific, constructive suggestions.
Do not just give generic praise. Identify exact areas where bullet points or summaries can be strengthened.

Resume JSON:
${JSON.stringify(resumeData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              overallScore: { type: Type.INTEGER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              quickTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              categoryScores: {
                type: Type.OBJECT,
                properties: {
                  overallReadiness: { type: Type.INTEGER },
                  contentQuality: { type: Type.INTEGER },
                  atsCompatibility: { type: Type.INTEGER },
                  achievementStrength: { type: Type.INTEGER },
                  recruiterReadability: { type: Type.INTEGER },
                },
                required: [
                  "overallReadiness",
                  "contentQuality",
                  "atsCompatibility",
                  "achievementStrength",
                  "recruiterReadability",
                ],
              },
            },
            required: [
              "summary",
              "overallScore",
              "strengths",
              "improvements",
              "quickTips",
              "categoryScores",
            ],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Gemini Review Error:", error);
      res.status(500).json({ error: error.message || "Failed to review resume" });
    }
  });

  // 5. Job Description Matching & Gap Analysis
  app.post("/api/match-job", async (req, res) => {
    try {
      const { resumeData, jobTitle = "", jobDescription = "" } = req.body;
      if (!jobDescription || jobDescription.trim().length === 0) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const prompt = `You are an expert talent acquisition specialist and ATS keyword auditor.
Compare this candidate's resume with the target job opening.

TARGET JOB TITLE: "${jobTitle}"
JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${JSON.stringify(resumeData, null, 2)}

TASK:
1. Calculate a realistic keyword match score (0-100%).
2. List "strongMatches": skills, tools, and experiences present in both the job description and the candidate's resume.
3. List "potentialGaps": key skills, certifications, or tools requested by the employer that are NOT found in the resume.
4. Provide actionable recommendations on how to emphasize legitimate matching experience in the summary or bullet points.
5. Emphasize the ethical ATS principle: "Consider adding recommended keywords only if you genuinely have this experience."`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.INTEGER },
              jobTitle: { type: Type.STRING },
              strongMatches: { type: Type.ARRAY, items: { type: Type.STRING } },
              potentialGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              disclaimer: { type: Type.STRING },
            },
            required: [
              "matchScore",
              "strongMatches",
              "potentialGaps",
              "recommendations",
              "disclaimer",
            ],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Job Match Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze job match" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
