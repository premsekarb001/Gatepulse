import { Request, Response } from 'express';
import { z } from 'zod';
import { parseNoticeWithGemini, extractTextFromFileBuffer, extractCandidateProfileFromCV, calculateDriveMatches } from '../services/geminiService';
import { saveDriveToSupabase, getDrivesFromSupabase } from '../services/supabaseService';
import { DriveFilterOptions, CandidateMatchResponse } from '@gatepulse/shared';

// Zod Input Validation Schema (20 to 2000 characters)
const ingestInputSchema = z.object({
  raw_text: z
    .string({ required_error: 'raw_text is required' })
    .min(20, 'Job notice text must be at least 20 characters long')
    .max(2000, 'Job notice text cannot exceed 2,000 characters')
});

export async function parseAndSaveDriveHandler(req: Request, res: Response): Promise<void> {
  try {
    // Normalize payload key (rawText / text -> raw_text)
    const rawInput = {
      raw_text: req.body?.raw_text || req.body?.rawText || req.body?.text || (typeof req.body === 'string' ? req.body : '')
    };

    // Zod schema validation
    const validationResult = ingestInputSchema.safeParse(rawInput);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.errors.map(err => err.message).join('; ');
      res.status(400).json({
        success: false,
        error: formattedErrors || 'Validation failed for raw job notice text'
      });
      return;
    }

    const validRawText = validationResult.data.raw_text.trim();
    console.log(`[API Security] Passed Zod validation for raw text (${validRawText.length} chars). Calling Gemini 1.5 Flash...`);
    
    // 1. Call Gemini 1.5 Flash AI parser
    const parsedData = await parseNoticeWithGemini(validRawText);

    // 2. Save extracted JSON to Supabase walkin_drives table
    const savedDrive = await saveDriveToSupabase(parsedData, validRawText);

    res.status(201).json({
      success: true,
      message: 'Notice parsed and saved successfully to walkin_drives table',
      data: savedDrive,
      parsed_attributes: parsedData
    });
  } catch (error: any) {
    console.error('[API Error] Ingest failed:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (error?.message || 'Failed to parse job notice')
    });
  }
}

export async function getDrivesHandler(req: Request, res: Response): Promise<void> {
  try {
    const filters: DriveFilterOptions = {
      city: req.query.city as string | undefined,
      it_park_name: req.query.it_park_name as string | undefined,
      experience: req.query.experience as string | undefined,
      search: req.query.search as string | undefined,
      min_trust_score: req.query.min_trust_score ? parseInt(req.query.min_trust_score as string, 10) : undefined
    };

    const drives = await getDrivesFromSupabase(filters);

    res.status(200).json({
      success: true,
      total: drives.length,
      data: drives
    });
  } catch (error: any) {
    console.error('[API Error] Fetch drives failed:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (error?.message || 'Failed to retrieve walkin drives')
    });
  }
}

export async function matchCVHandler(req: Request, res: Response): Promise<void> {
  try {
    let cvText = '';

    if (req.file) {
      cvText = await extractTextFromFileBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else if (req.body?.cv_text || req.body?.text) {
      cvText = String(req.body.cv_text || req.body.text);
    }

    if (!cvText || cvText.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'CV file upload or cv_text parameter (at least 10 characters) is required'
      });
      return;
    }

    console.log(`[CV Engine] Extracting candidate profile from CV text (${cvText.length} chars)...`);
    const candidateProfile = await extractCandidateProfileFromCV(cvText.trim());

    console.log(`[CV Engine] Profile extracted (${candidateProfile.key_skills.length} skills, ${candidateProfile.total_experience_years} yrs exp). Fetching active drives...`);
    const drives = await getDrivesFromSupabase({});

    const matches = calculateDriveMatches(candidateProfile, drives);

    const responsePayload: CandidateMatchResponse = {
      candidate: candidateProfile,
      matches
    };

    res.status(200).json({
      success: true,
      message: `Matched ${matches.length} active walk-in drives for candidate`,
      data: responsePayload
    });
  } catch (error: any) {
    console.error('[API Error] Match CV failed:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (error?.message || 'Failed to match CV with drives')
    });
  }
}
