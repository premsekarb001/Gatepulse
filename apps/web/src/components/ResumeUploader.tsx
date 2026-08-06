'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { CandidateMatchResponse } from '@gatepulse/shared';

interface ResumeUploaderProps {
  onMatchComplete: (data: CandidateMatchResponse) => void;
  apiBaseUrl: string;
}

const SAMPLE_CVS = [
  {
    label: 'Java Fullstack (2 Yrs Exp)',
    text: `KUMAR SHARMA - FULLSTACK JAVA DEVELOPER
Email: kumar.sharma@gmail.com | Phone: +91 9876543210
Summary: Results-driven Software Engineer with 2+ years of hands-on experience building enterprise Web Applications.
Technical Skills: Java 17, Spring Boot, Microservices, Angular 16, REST APIs, PostgreSQL, AWS S3, Docker, Git.
Work Experience: Software Engineer at Tech Corp (2024 - Present). Built REST microservices and Angular dashboards.
Education: B.Tech in Computer Science (2024).
Preferred Location: Bengaluru, Hyderabad`
  },
  {
    label: 'Fresher QA Engineer (0 Yrs)',
    text: `PRIYA VERMA - QA AUTOMATION TRAINEE
Email: priya.verma@outlook.com | Phone: +91 9123456789
Summary: Energetic Computer Science Graduate (Fresher) seeking entry-level QA Automation / Testing roles.
Technical Skills: Manual Testing, QA Automation, Selenium WebDriver, Python, SQL Queries, Bug Tracking, JIRA.
Projects: Web E-commerce Automation Test Suite using Selenium & Python.
Education: B.E. Information Technology (2026).
Preferred Location: Pune, Bengaluru`
  }
];

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onMatchComplete, apiBaseUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'matching' | 'completed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        setFile(selected);
        setErrorMsg(null);
      } else {
        setErrorMsg('Invalid file format. Please upload .pdf, .docx, .doc, or .txt file.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        setFile(selected);
        setErrorMsg(null);
      } else {
        setErrorMsg('Invalid file format. Please upload .pdf, .docx, .doc, or .txt file.');
      }
    }
  };

  const handleProcessCV = async () => {
    if (!file && !rawText.trim()) {
      setErrorMsg('Please select a CV file or paste resume text.');
      return;
    }

    setErrorMsg(null);
    setStatus('uploading');

    try {
      let response: Response;

      if (file) {
        setStatus('uploading');
        const formData = new FormData();
        formData.append('resume', file);

        setTimeout(() => setStatus('parsing'), 600);
        setTimeout(() => setStatus('matching'), 1500);

        response = await fetch(`${apiBaseUrl}/api/v1/match-cv`, {
          method: 'POST',
          body: formData,
        });
      } else {
        setStatus('parsing');
        setTimeout(() => setStatus('matching'), 800);

        response = await fetch(`${apiBaseUrl}/api/v1/match-cv`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv_text: rawText.trim() }),
        });
      }

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to process CV and match drives');
      }

      setStatus('completed');
      onMatchComplete(json.data);
    } catch (err: any) {
      console.error('CV Matching Error:', err);
      setStatus('error');
      setErrorMsg(err?.message || 'Failed to connect to AI CV matching backend');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-sky-500/30 shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI CV Parser &amp; Walk-in Drive Matcher
            </h2>
            <p className="text-xs text-slate-400">
              Upload your Resume/CV to extract skills, experience fit &amp; calculate 0-100% drive match compatibility
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUseTextInput(!useTextInput)}
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          {useTextInput ? 'Upload File (.pdf, .docx)' : 'Paste CV Text'}
        </button>
      </div>

      {!useTextInput ? (
        /* Drag and Drop Zone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-sky-500/30 hover:border-sky-400/60 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-sky-500/5 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>

          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Selected: {file.name}
              </p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB — Click or drag to change</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">
                Drag &amp; Drop your Resume/CV here, or <span className="text-sky-400 underline">Browse Files</span>
              </p>
              <p className="text-xs text-slate-500">Supports PDF, DOCX, DOC, TXT (Up to 5MB)</p>
            </div>
          )}
        </div>
      ) : (
        /* Textarea Input Fallback */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Paste Plaintext CV / Resume:</label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Sample CV:</span>
              {SAMPLE_CVS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawText(sample.text)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste candidate resume text here (Skills, Experience years, Project summary...)"
            className="w-full p-3 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      )}

      {/* Progress Status Indicators */}
      {status !== 'idle' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              {status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              )}
              {status === 'uploading' && 'Uploading Resume File...'}
              {status === 'parsing' && 'Extracting Profile with Gemini 1.5 Flash AI...'}
              {status === 'matching' && 'Scoring 0-100% Walk-in Drive Match Compatibility...'}
              {status === 'completed' && 'Drive Matching Engine Finished!'}
              {status === 'error' && 'Processing Error'}
            </span>
            <span className="font-mono text-sky-400 font-bold">
              {status === 'uploading' && '30%'}
              {status === 'parsing' && '65%'}
              {status === 'matching' && '90%'}
              {status === 'completed' && '100%'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
              style={{
                width:
                  status === 'uploading'
                    ? '30%'
                    : status === 'parsing'
                    ? '65%'
                    : status === 'matching'
                    ? '90%'
                    : status === 'completed'
                    ? '100%'
                    : '0%',
              }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-slate-500">
          * Instant AI feature overlap parsing: Target Role, Experience Alignment &amp; Missing Skill Gaps.
        </p>

        <button
          type="button"
          onClick={handleProcessCV}
          disabled={status !== 'idle' && status !== 'completed' && status !== 'error'}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status !== 'idle' && status !== 'completed' && status !== 'error' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing CV...
            </>
          ) : (
            <>
              Match CV with Walk-in Drives
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
