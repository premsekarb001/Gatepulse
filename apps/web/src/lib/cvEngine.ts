import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { CandidateProfile, DriveMatch, WalkinDrive, DriveFilterOptions } from '@gatepulse/shared';

const candidateProfileSchema = z.object({
  key_skills: z.array(z.string()).default([]),
  total_experience_years: z.number().nonnegative().default(0),
  target_roles: z.array(z.string()).default([]),
  location_preference: z.string().optional(),
});

const INITIAL_MOCK_DRIVES: WalkinDrive[] = [
  {
    id: 'drive-101',
    company_name: 'TCS (Tata Consultancy Services)',
    job_title: 'Full Stack Java & Angular Developer',
    experience_range: '0-2 Years',
    experience_min: 0,
    experience_max: 2,
    walkin_start_date: '2026-08-10',
    walkin_end_date: '2026-08-11',
    time_slot: '09:00 AM - 01:00 PM',
    city: 'Bengaluru',
    it_park_name: 'Manyata Tech Park',
    landmark_gate: 'Gate 3 Main Visitor Entrance (Block N1)',
    trust_score: 96,
    contains_payment_demand: false,
    contact_email: 'campus.careers@tcs.com',
    venue_address: 'Manyata Tech Park, Nagavara, Outer Ring Rd, Bengaluru, Karnataka 560045',
    latitude: 13.0458,
    longitude: 77.6202,
    created_at: new Date('2026-08-05').toISOString(),
  },
  {
    id: 'drive-102',
    company_name: 'Infosys Limited',
    job_title: 'System Engineer & Data Analyst',
    experience_range: '1-3 Years',
    experience_min: 1,
    experience_max: 3,
    walkin_start_date: '2026-08-12',
    walkin_end_date: '2026-08-12',
    time_slot: '09:30 AM - 02:00 PM',
    city: 'Hyderabad',
    it_park_name: 'HITEC City',
    landmark_gate: 'Gate 1 (Building 12 Security Desk)',
    trust_score: 92,
    contains_payment_demand: false,
    contact_email: 'walkin.hyd@infosys.com',
    venue_address: 'Survey No. 64, HITEC City, Madhapur, Hyderabad, Telangana 500081',
    latitude: 17.4474,
    longitude: 78.3762,
    created_at: new Date('2026-08-04').toISOString(),
  },
  {
    id: 'drive-103',
    company_name: 'Tech Horizon Consultancy',
    job_title: 'Junior QA Automation Tester',
    experience_range: '0-1 Years',
    experience_min: 0,
    experience_max: 1,
    walkin_start_date: '2026-08-14',
    time_slot: '10:00 AM - 03:00 PM',
    city: 'Pune',
    it_park_name: 'EON Free Zone',
    landmark_gate: 'Gate 2 Entrance, Cluster C Lobby',
    trust_score: 42,
    contains_payment_demand: true,
    contact_email: 'hr@techhorizon-jobs.fake.com',
    venue_address: 'EON Free Zone, Kharadi, Pune, Maharashtra 411014',
    latitude: 18.5515,
    longitude: 73.9525,
    created_at: new Date('2026-08-06').toISOString(),
  },
  {
    id: 'drive-104',
    company_name: 'Cognizant Technology Solutions',
    job_title: 'Cloud DevOps & AWS Architect',
    experience_range: '3-6 Years',
    experience_min: 3,
    experience_max: 6,
    walkin_start_date: '2026-08-15',
    time_slot: '10:00 AM - 01:00 PM',
    city: 'Chennai',
    it_park_name: 'Ramanujan IT City',
    landmark_gate: 'Gate 4 North Tower Security Desk',
    trust_score: 88,
    contains_payment_demand: false,
    contact_email: 'lateral.hiring@cognizant.com',
    venue_address: 'Ramanujan IT City, Taramani, Chennai, Tamil Nadu 600113',
    latitude: 12.9863,
    longitude: 80.2432,
    created_at: new Date('2026-08-06').toISOString(),
  },
];

export async function extractTextFromFileBuffer(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<string> {
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
  const apiKey = process.env.GEMINI_API_KEY;
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
                items: { type: Type.STRING },
              },
              total_experience_years: { type: Type.NUMBER },
              target_roles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              location_preference: { type: Type.STRING },
            },
            required: ['key_skills', 'total_experience_years', 'target_roles'],
          },
        },
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
      console.warn('Gemini CV parsing failed, falling back to smart heuristic CV parser:', err);
    }
  }

  return candidateProfileSchema.parse(extractCandidateProfileHeuristically(cvText));
}

function extractCandidateProfileHeuristically(text: string): CandidateProfile {
  const lower = text.toLowerCase();

  const skillKeywords = [
    'java',
    'spring boot',
    'angular',
    'react',
    'node.js',
    'typescript',
    'javascript',
    'python',
    'django',
    'aws',
    'docker',
    'kubernetes',
    'sql',
    'postgresql',
    'mongodb',
    'c++',
    'c#',
    '.net',
    'qa',
    'selenium',
    'automation',
    'devops',
    'data analyst',
  ];

  const extractedSkills = skillKeywords.filter((skill) => lower.includes(skill));

  let expYears = 1;
  const expMatch =
    text.match(/(\d+)\s*\+?\s*years?\s*(?:of\s*)?experience/i) || text.match(/fresher|student|graduate/i);
  if (expMatch) {
    if (expMatch[0].toLowerCase().includes('fresher') || expMatch[0].toLowerCase().includes('student')) {
      expYears = 0;
    } else if (expMatch[1]) {
      expYears = parseInt(expMatch[1], 10);
    }
  }

  const targetRoles: string[] = [];
  if (lower.includes('java') || lower.includes('spring')) targetRoles.push('Fullstack Java Developer');
  if (lower.includes('qa') || lower.includes('selenium') || lower.includes('testing'))
    targetRoles.push('QA Automation Engineer');
  if (lower.includes('react') || lower.includes('angular') || lower.includes('frontend'))
    targetRoles.push('Frontend Developer');
  if (targetRoles.length === 0) targetRoles.push('Software Engineer');

  let prefCity: string | undefined = undefined;
  if (lower.includes('bengaluru') || lower.includes('bangalore')) prefCity = 'Bengaluru';
  else if (lower.includes('hyderabad')) prefCity = 'Hyderabad';
  else if (lower.includes('pune')) prefCity = 'Pune';

  return {
    key_skills: extractedSkills.length > 0 ? extractedSkills : ['Java', 'SQL', 'Git'],
    total_experience_years: expYears,
    target_roles: targetRoles,
    location_preference: prefCity,
  };
}

export function calculateDriveMatches(candidate: CandidateProfile, drives: WalkinDrive[]): DriveMatch[] {
  return drives
    .map((drive) => {
      let score = 50; // base score
      const matchingSkills: string[] = [];
      const missingSkills: string[] = [];

      // 1. Target Role Overlap (~40 points)
      const driveRoleLower = drive.job_title.toLowerCase();
      const hasRoleFit = candidate.target_roles.some((role) => {
        const rLower = role.toLowerCase();
        return (
          driveRoleLower.includes(rLower) ||
          rLower.includes(driveRoleLower) ||
          (driveRoleLower.includes('java') && rLower.includes('java')) ||
          (driveRoleLower.includes('qa') && rLower.includes('qa')) ||
          (driveRoleLower.includes('software') && rLower.includes('software'))
        );
      });
      if (hasRoleFit) {
        score += 35;
      }

      // 2. Experience Fit (~25 points)
      if (
        candidate.total_experience_years >= drive.experience_min &&
        candidate.total_experience_years <= drive.experience_max + 1
      ) {
        score += 20;
      } else if (Math.abs(candidate.total_experience_years - drive.experience_min) <= 1) {
        score += 10;
      }

      // 3. Skill Overlap (~25 points)
      const sampleReqSkills = driveRoleLower.includes('java')
        ? ['java', 'spring boot', 'sql', 'angular']
        : driveRoleLower.includes('qa')
        ? ['qa', 'selenium', 'python', 'sql']
        : ['react', 'node.js', 'typescript', 'aws'];

      sampleReqSkills.forEach((reqSkill) => {
        const hasSkill = candidate.key_skills.some((userSkill) => userSkill.toLowerCase().includes(reqSkill));
        if (hasSkill) {
          matchingSkills.push(reqSkill);
          score += 5;
        } else {
          missingSkills.push(reqSkill);
        }
      });

      // 4. Location Preference (~10 points)
      if (
        candidate.location_preference &&
        drive.city.toLowerCase().includes(candidate.location_preference.toLowerCase())
      ) {
        score += 10;
      }

      const match_score = Math.min(100, Math.max(10, score));

      let recommendation_reason = 'Good alignment with experience profile.';
      if (match_score >= 80) {
        recommendation_reason = `High compatibility! Matches role (${drive.job_title}) and required skill stack.`;
      } else if (match_score >= 50) {
        recommendation_reason = `Moderate fit. Candidate experience fits ${drive.experience_range} requirement.`;
      } else {
        recommendation_reason = `Potential stretch match. Consider reviewing skill gap checklist.`;
      }

      return {
        drive,
        match_score,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        recommendation_reason,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
}

export async function getDrives(): Promise<WalkinDrive[]> {
  return INITIAL_MOCK_DRIVES;
}
