import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config/env';

export interface ExtractedDriveData {
  company_name: string;
  job_title: string;
  experience_range: string;
  experience_min: number;
  experience_max: number;
  walkin_start_date: string;
  walkin_end_date?: string;
  time_slot?: string;
  city: string;
  it_park_name: string;
  landmark_gate: string;
  trust_score: number;
  contains_payment_demand: boolean;
  contact_email?: string;
  venue_address?: string;
}

export async function parseNoticeWithGemini(rawText: string): Promise<ExtractedDriveData> {
  const apiKey = config.geminiApiKey;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
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
        const parsed = JSON.parse(jsonText);
        return {
          company_name: parsed.company_name || "Unknown Tech Corp",
          job_title: parsed.job_title || "Software Engineer",
          experience_range: parsed.experience_range || "0-3 Years",
          experience_min: parsed.experience_min ?? 0,
          experience_max: parsed.experience_max ?? 3,
          walkin_start_date: parsed.walkin_start_date || new Date().toISOString().split('T')[0],
          walkin_end_date: parsed.walkin_end_date,
          time_slot: parsed.time_slot || "09:30 AM - 02:00 PM",
          city: parsed.city || "Bengaluru",
          it_park_name: parsed.it_park_name || "Manyata Tech Park",
          landmark_gate: parsed.landmark_gate || "Gate 2 (Visitor Entry)",
          trust_score: Math.min(100, Math.max(0, parsed.trust_score ?? 85)),
          contains_payment_demand: Boolean(parsed.contains_payment_demand),
          contact_email: parsed.contact_email,
          venue_address: parsed.venue_address
        };
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart heuristic parser:", err);
    }
  }

  // Fallback Heuristic Parser when GEMINI_API_KEY is unset or API call is offline
  return parseNoticeHeuristically(rawText);
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
