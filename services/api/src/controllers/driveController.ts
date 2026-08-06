import { Request, Response } from 'express';
import { parseNoticeWithGemini } from '../services/geminiService';
import { saveDriveToSupabase, getDrivesFromSupabase } from '../services/supabaseService';
import { DriveFilterOptions } from '@gatepulse/shared';

export async function parseAndSaveDriveHandler(req: Request, res: Response): Promise<void> {
  try {
    const rawText = req.body.raw_text || req.body.rawText || req.body.text || (typeof req.body === 'string' ? req.body : '');

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing or empty raw job notice text in request body'
      });
      return;
    }

    console.log(`[API] Ingesting & parsing raw text (${rawText.length} chars)...`);
    
    // 1. Call Gemini 1.5 Flash AI parser
    const parsedData = await parseNoticeWithGemini(rawText.trim());

    // 2. Save extracted JSON to Supabase walkin_drives table
    const savedDrive = await saveDriveToSupabase(parsedData, rawText.trim());

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
      error: 'Failed to parse and save job walkin drive',
      details: error?.message || String(error)
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
      error: 'Failed to retrieve walkin drives',
      details: error?.message || String(error)
    });
  }
}
