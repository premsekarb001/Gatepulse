import { NextRequest, NextResponse } from 'next/server';
import {
  extractTextFromFileBuffer,
  extractCandidateProfileFromCV,
  calculateDriveMatches,
  getDrives,
} from '@/lib/cvEngine';
import { CandidateMatchResponse } from '@gatepulse/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let cvText = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('resume') as File | null;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        cvText = await extractTextFromFileBuffer(buffer, file.type, file.name);
      }
    } else {
      const body = await req.json().catch(() => ({}));
      cvText = String(body.cv_text || body.text || body.raw_text || '');
    }

    if (!cvText || cvText.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please select a valid CV document (.pdf, .docx, .txt) or paste resume text.',
        },
        { status: 400 }
      );
    }

    console.log(`[Next.js Serverless CV API] Processing candidate CV (${cvText.length} chars)...`);
    const candidateProfile = await extractCandidateProfileFromCV(cvText.trim());

    console.log(
      `[Next.js Serverless CV API] Profile extracted (${candidateProfile.key_skills.length} skills, ${candidateProfile.total_experience_years} yrs exp). Fetching active drives...`
    );
    const drives = await getDrives();
    const matches = calculateDriveMatches(candidateProfile, drives);

    const responsePayload: CandidateMatchResponse = {
      candidate: candidateProfile,
      matches,
    };

    return NextResponse.json(
      {
        success: true,
        message: `Successfully matched ${matches.length} walk-in drives for candidate`,
        data: responsePayload,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Next.js Serverless CV API Error] Upload & parse error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process CV document and match drives.',
      },
      { status: 500 }
    );
  }
}
