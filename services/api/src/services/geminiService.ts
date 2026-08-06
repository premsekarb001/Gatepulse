import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { config } from '../config/env';
import { CandidateProfile, DriveMatch, WalkinDrive } from '@gatepulse/shared';

export const extractedDriveSchema = z.object({
  company_name: z.string().trim().min(1).default("Unknown Tech Corp"),
  job_title: z.string().trim().min(1).default("Software Engineer"),
  experience_range: z.string().trim().default("0-3 Years"),
  experience_min: z.number().nonnegative().default(0),
  experience_max: z.number().nonnegative().default(3),
  walkin_start_date: z.string().trim().default(() => new Date().toISOString().split('T')[0]),
  walkin_end_date: z.string().trim().optional(),
  time_slot: z.string().trim().optional(),
  city: z.string().trim().min(1).default("Bengaluru"),
  it_park_name: z.string().trim().min(1).default("Manyata Tech Park"),
  landmark_gate: z.string().trim().min(1).default("Gate 2 (Visitor Entry)"),
  trust_score: z.number().transform(s => Math.min(100, Math.max(0, s))).default(85),
  contains_payment_demand: z.boolean().default(false),
  contact_email: z.string().trim().optional(),
  venue_address: z.string().trim().optional()
});

export type ExtractedDriveData = z.infer<typeof extractedDriveSchema>;

export const candidateProfileSchema = z.object({
  key_skills: z.array(z.string()).default([]),
  total_experience_years: z.number().nonnegative().default(0),
  target_roles: z.array(z.string()).default([]),
  location_preference: z.string().optional()
});

export async function parseNoticeWithGemini(rawText: string): Promise<ExtractedDriveData> {
  const apiKey = config.geminiApiKey;
  const isApiKeyConfigured = Boolean(
    apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0 && apiKey !== 'your_gemini_api_key_here'
  );

  if (isApiKeyConfigured) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey! });

      const prompt = `
You are an expert AI parser for job walk-in drive notices in India. Analyze the raw text notice below and extract structured JSON output.

Raw Notice Text:
"""
${rawText}
"""

Instructions:
1. company_name: Name of hiring company or recruiter (e.g. "TCS", "Infosys", "Wipro", "Accenture", "Tech Mahindra").
2. job_title: Main role/position (e.g. "Java Fullstack Developer", "Service Desk Engineer", "React Native Developer").
3. experience_range: Experience required, formatted as e.g. "0-2 Years", "1-3 Years", "Freshers", "3-5 Years".
4. experience_min: Minimum years of experience as a number (e.g. 0).
5. experience_max: Maximum years of experience as a number (e.g. 2).
6. walkin_start_date: The start date of walkin drive in ISO date YYYY-MM-DD (e.g. "2026-08-10"). If not explicit year, infer reasonable future date.
7. walkin_end_date: Optional end date in YYYY-MM-DD.
8. time_slot: Optional time slot e.g. "9:00 AM - 1:00 PM".
9. city: City where drive is held (e.g. "Bengaluru", "Hyderabad", "Pune", "Chennai", "Noida", "Gurugram").
10. it_park_name: IT Park / Tech hub name (e.g. "Manyata Tech Park", "HITEC City", "EON Free Zone", "ECIL", "Ramanujan IT City").
11. landmark_gate: Specific gate / entry point / landmark for job seekers to arrive at (e.g. "Gate 3, Block B, Main Security Check", "Gate 1 North Entrance", "Tower 4 Reception Gate").
12. trust_score: Trust score between 0 and 100 based on authenticity indicators (0 = suspicious/scam, 100 = verified official campus drive).
13. contains_payment_demand: Boolean (true if text mentions registration fee, mandatory training cost, security deposit, or payment demand for entry/offer; false if zero payment requested).
14. contact_email: Optional hr/contact email address.
15. venue_address: Full venue address.

Return ONLY valid JSON matching this schema:
{
  "company_name": string,
  "job_title": string,
  "experience_range": string,
  "experience_min": number,
  "experience_max": number,
  "walkin_start_date": string,
  "walkin_end_date": string,
  "time_slot": string,
  "city": string,
  "it_park_name": string,
  "landmark_gate": string,
  "trust_score": number,
  "contains_payment_demand": boolean,
  "contact_email": string,
  "venue_address": string
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              company_name: { type: Type.STRING },
              job_title: { type: Type.STRING },
              experience_range: { type: Type.STRING },
              experience_min: { type: Type.NUMBER },
              experience_max: { type: Type.NUMBER },
              walkin_start_date: { type: Type.STRING },
              walkin_end_date: { type: Type.STRING },
              time_slot: { type: Type.STRING },
              city: { type: Type.STRING },
              it_park_name: { type: Type.STRING },
              landmark_gate: { type: Type.STRING },
              trust_score: { type: Type.NUMBER },
              contains_payment_demand: { type: Type.BOOLEAN },
              contact_email: { type: Type.STRING },
              venue_address: { type: Type.STRING }
            },
            required: [
              "company_name",
              "job_title",
              "experience_range",
              "walkin_start_date",
              "city",
              "it_park_name",
              "landmark_gate",
              "trust_score",
              "contains_payment_demand"
            ]
          }
        }
      });

      const jsonText = response.text;
      if (jsonText) {
        const cleanJsonText = jsonText
          .replace(/^```(?:json)?/gi, '')
          .replace(/```$/gi, '')
          .trim();
        const rawJson = JSON.parse(cleanJsonText);
        return extractedDriveSchema.parse(rawJson);
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart heuristic parser:", err);
    }
  } else {
    console.info("[Config Guard] GEMINI_API_KEY is unconfigured; using smart heuristic drive parser.");
  }

  // Fallback Heuristic Parser when GEMINI_API_KEY is unset or API call is offline
  return extractedDriveSchema.parse(parseNoticeHeuristically(rawText));
}

function parseNoticeHeuristically(text: string): ExtractedDriveData {
  const lower = text.toLowerCase();
  
  // Payment fraud detection heuristic
  const hasPaymentDemand = /pay|fee|charges|deposit|registration amount|₹|\$|training fee|consultancy fee/i.test(text);
  
  // Company extraction heuristic
  let company = "Tech Solutions Ltd";
  const companyMatch = text.match(/(?:at|company|hiring for|walkin drive by|client:?)\s+([A-Z][A-Za-z0-9\s&]{2,25})/i) 
    || text.match(/^([A-Z][A-Za-z0-9\s&]{2,20})\s+(?:is hiring|walkin|recruitment)/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  // Job title heuristic
  let title = "Software Development Engineer";
  const titleMatch = text.match(/(?:role|position|profile|hiring for|hiring)\s*:?\s*([A-Za-z0-9\s/+-]{3,30})/i)
    || text.match(/(java|python|react|node|fullstack|devops|data engineer|frontend|backend|testing|qa|support|analyst)\s+(?:developer|engineer|lead|specialist)/i);
  if (titleMatch) {
    title = titleMatch[0].replace(/role|position|profile|hiring for/gi, '').trim();
  }

  // Experience heuristic
  let expRange = "0-2 Years";
  let expMin = 0;
  let expMax = 2;
  const expMatch = text.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years?/i) || text.match(/fresher|0\s*year/i);
  if (expMatch) {
    if (expMatch[0].toLowerCase().includes("fresher")) {
      expRange = "0-1 Years";
      expMin = 0; expMax = 1;
    } else if (expMatch[1] && expMatch[2]) {
      expMin = parseInt(expMatch[1], 10);
      expMax = parseInt(expMatch[2], 10);
      expRange = `${expMin}-${expMax} Years`;
    }
  }

  // City heuristic
  let city = "Bengaluru";
  if (lower.includes("hyderabad")) city = "Hyderabad";
  else if (lower.includes("pune")) city = "Pune";
  else if (lower.includes("chennai")) city = "Chennai";
  else if (lower.includes("noida") || lower.includes("delhi") || lower.includes("gurugram")) city = "Noida";

  // IT Park heuristic
  let itPark = "Manyata Tech Park";
  if (lower.includes("hitec") || lower.includes("gachibowli")) itPark = "HITEC City";
  else if (lower.includes("eon") || lower.includes("kharadi")) itPark = "EON Free Zone";
  else if (lower.includes("ecil") || lower.includes("electronic city")) itPark = "Electronics City Phase 1";
  else if (lower.includes("embassy") || lower.includes("manyata")) itPark = "Embassy Manyata Business Park";
  else if (lower.includes("ramanujan") || lower.includes("tidel")) itPark = "Ramanujan IT City";

  // Landmark Gate heuristic
  let gate = "Gate 3 (Visitor Entrance, South Tower)";
  const gateMatch = text.match(/gate\s*#?\d+[\w\s,()-]*/i) || text.match(/tower\s*\d+[\w\s,()-]*/i);
  if (gateMatch) {
    gate = gateMatch[0].trim();
  }

  // Trust Score heuristic
  let trustScore = 88;
  if (hasPaymentDemand) trustScore = 25; // Massive penalty for fee demands
  else if (lower.includes("official campus") || lower.includes("direct walkin")) trustScore = 95;

  // Date heuristic
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  return {
    company_name: company,
    job_title: title.charAt(0).toUpperCase() + title.slice(1),
    experience_range: expRange,
    experience_min: expMin,
    experience_max: expMax,
    walkin_start_date: dateStr,
    city,
    it_park_name: itPark,
    landmark_gate: gate,
    trust_score: trustScore,
    contains_payment_demand: hasPaymentDemand,
    time_slot: "09:30 AM - 01:30 PM",
    venue_address: `${itPark}, ${city}`
  };
}

// --------------------------------------------------------------------------
// AI CV PARSER & PERSONALIZED WALK-IN DRIVE MATCHING ENGINE
// --------------------------------------------------------------------------

export async function extractTextFromFileBuffer(buffer: Buffer, mimeType: string, originalName: string): Promise<string> {
  const ext = originalName ? originalName.split('.').pop()?.toLowerCase() : '';

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text && pdfData.text.trim()) {
        return pdfData.text;
      }
    } catch (err) {
      console.warn('[Serverless PDF Guard] PDF parsing failed, falling back to plaintext buffer extraction:', err);
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim()) {
        return result.value;
      }
    } catch (err) {
      console.warn('[Serverless Mammoth Guard] DOCX/DOC parsing failed, falling back to plaintext buffer extraction:', err);
    }
  }

  try {
    return buffer ? buffer.toString('utf-8') : '';
  } catch (err) {
    console.warn('[Buffer Fallback] Raw string conversion failed:', err);
    return '';
  }
}

export async function extractCandidateProfileFromCV(cvText: string): Promise<CandidateProfile> {
  const apiKey = config.geminiApiKey;
  const isApiKeyConfigured = Boolean(
    apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0 && apiKey !== 'your_gemini_api_key_here'
  );

  if (isApiKeyConfigured) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey! });

      const prompt = `
You are an expert AI Resume/CV Parser for software & IT job seekers in India. Analyze the raw candidate resume text below and extract candidate profile attributes.

Resume Text:
"""
${cvText}
"""

Instructions:
1. key_skills: Array of technical skills, frameworks, programming languages, and tools found in the CV (e.g. ["Java", "Angular", "Spring Boot", "SQL", "React", "AWS", "Python", "QA Automation"]).
2. total_experience_years: Total years of professional work experience as a number (e.g. 0 for freshers/students, 2 for 2 years).
3. target_roles: Array of target job titles or roles the candidate is suited for (e.g. ["Full Stack Java Developer", "Software Engineer", "Frontend Developer"]).
4. location_preference: Preferred city if mentioned (e.g. "Bengaluru", "Hyderabad", "Pune", "Chennai", "Noida"), or null if unspecified.

Return ONLY valid JSON matching this schema.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              key_skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              total_experience_years: { type: Type.NUMBER },
              target_roles: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              location_preference: { type: Type.STRING }
            },
            required: ["key_skills", "total_experience_years", "target_roles"]
          }
        }
      });

      const jsonText = response.text;
      if (jsonText) {
        const cleanJsonText = jsonText
          .replace(/^```(?:json)?/gi, '')
          .replace(/```$/gi, '')
          .trim();
        const rawJson = JSON.parse(cleanJsonText);
        return candidateProfileSchema.parse(rawJson);
      }
    } catch (err) {
      console.warn("Gemini CV parsing failed, falling back to smart heuristic CV parser:", err);
    }
  } else {
    console.info("[Config Guard] GEMINI_API_KEY is unconfigured; using smart heuristic CV parser.");
  }

  return candidateProfileSchema.parse(extractCandidateProfileHeuristically(cvText));
}

function extractCandidateProfileHeuristically(text: string): CandidateProfile {
  const lower = text.toLowerCase();

  const skillKeywords = [
    'java', 'spring boot', 'angular', 'react', 'node.js', 'typescript', 'javascript',
    'python', 'django', 'aws', 'docker', 'kubernetes', 'sql', 'postgresql', 'mongodb',
    'c++', 'c#', '.net', 'qa', 'selenium', 'automation', 'devops', 'data analyst'
  ];

  const extractedSkills = skillKeywords.filter(skill => lower.includes(skill));

  let expYears = 1;
  const expMatch = text.match(/(\d+)\s*\+?\s*years?\s*(?:of\s*)?experience/i) || text.match(/fresher|student|graduate/i);
  if (expMatch) {
    if (expMatch[0].toLowerCase().includes('fresher') || expMatch[0].toLowerCase().includes('student')) {
      expYears = 0;
    } else if (expMatch[1]) {
      expYears = parseInt(expMatch[1], 10);
    }
  }

  let roles = ['Software Engineer'];
  if (lower.includes('java') || lower.includes('spring')) roles.push('Java Developer', 'Full Stack Developer');
  if (lower.includes('react') || lower.includes('angular') || lower.includes('frontend')) roles.push('Frontend Engineer');
  if (lower.includes('python') || lower.includes('data')) roles.push('Data Analyst', 'Python Engineer');
  if (lower.includes('qa') || lower.includes('testing')) roles.push('QA Automation Tester');

  let city: string | undefined = undefined;
  if (lower.includes('bengaluru') || lower.includes('bangalore')) city = 'Bengaluru';
  else if (lower.includes('hyderabad')) city = 'Hyderabad';
  else if (lower.includes('pune')) city = 'Pune';
  else if (lower.includes('chennai')) city = 'Chennai';

  return {
    key_skills: extractedSkills.length > 0 ? extractedSkills.map(s => s.toUpperCase()) : ['Java', 'SQL', 'Problem Solving'],
    total_experience_years: expYears,
    target_roles: Array.from(new Set(roles)),
    location_preference: city
  };
}

export function calculateDriveMatches(candidate: CandidateProfile, drives: WalkinDrive[]): DriveMatch[] {
  const candidateSkills = (candidate.key_skills || []).map(s => s.toLowerCase());
  const targetRoles = (candidate.target_roles || []).map(r => r.toLowerCase());
  const expYears = candidate.total_experience_years ?? 0;

  const matches: DriveMatch[] = drives.map((drive) => {
    const jobTitleLower = (drive.job_title || '').toLowerCase();
    const rawTextLower = (drive.raw_text || '').toLowerCase();
    const driveText = `${jobTitleLower} ${rawTextLower}`;

    // 1. Role Overlap Score (Max 40 points)
    let roleScore = 10;
    const hasRoleMatch = targetRoles.some(role => {
      const words = role.split(/\s+/);
      return words.some(w => w.length > 2 && jobTitleLower.includes(w));
    });
    if (hasRoleMatch) {
      roleScore = 40;
    } else {
      const partialMatch = candidateSkills.some(skill => jobTitleLower.includes(skill));
      if (partialMatch) roleScore = 25;
    }

    // 2. Experience Fit Score (Max 30 points)
    let expScore = 5;
    if (expYears >= drive.experience_min && expYears <= drive.experience_max) {
      expScore = 30;
    } else if (Math.abs(expYears - drive.experience_min) <= 1 || Math.abs(expYears - drive.experience_max) <= 1) {
      expScore = 20;
    } else if (expYears === 0 && drive.experience_min <= 1) {
      expScore = 30;
    }

    // 3. Skill Overlap & Extraction (Max 30 points)
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    candidateSkills.forEach((skill) => {
      if (driveText.includes(skill)) {
        matchingSkills.push(skill.toUpperCase());
      }
    });

    const commonRoleSkills = ['Java', 'Python', 'React', 'Angular', 'SQL', 'AWS', 'Spring Boot', 'Node.js', 'QA', 'Docker'];
    commonRoleSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      if (driveText.includes(sLower) && !candidateSkills.some(cs => cs.includes(sLower))) {
        missingSkills.push(skill);
      }
    });

    const skillMatchRatio = candidateSkills.length > 0 ? matchingSkills.length / Math.max(1, candidateSkills.length) : 0.5;
    const skillScore = Math.min(30, Math.round(skillMatchRatio * 20) + (matchingSkills.length > 0 ? 10 : 0));

    let totalScore = Math.min(100, Math.max(0, roleScore + expScore + skillScore));

    if (candidate.location_preference && drive.city.toLowerCase().includes(candidate.location_preference.toLowerCase())) {
      totalScore = Math.min(100, totalScore + 5);
    }

    let reason = '';
    if (totalScore >= 80) {
      reason = `Strong match for ${drive.job_title} at ${drive.company_name}! Excellent overlap in target role, ${expYears} yrs experience fit, and key skills (${matchingSkills.join(', ') || 'Core Stack'}).`;
    } else if (totalScore >= 50) {
      reason = `Good candidate fit for ${drive.job_title}. Experience level matches (${drive.experience_range}). Consider highlighting skills in ${missingSkills.slice(0, 2).join(', ') || 'related frameworks'}.`;
    } else {
      reason = `Moderate/Low match. Drive requires ${drive.experience_range} for ${drive.job_title}. Skill gaps noted: ${missingSkills.slice(0, 2).join(', ') || 'specialized tech'}.`;
    }

    return {
      drive,
      match_score: totalScore,
      matching_skills: Array.from(new Set(matchingSkills)),
      missing_skills: Array.from(new Set(missingSkills.slice(0, 4))),
      recommendation_reason: reason
    };
  });

  return matches.sort((a, b) => b.match_score - a.match_score);
}
