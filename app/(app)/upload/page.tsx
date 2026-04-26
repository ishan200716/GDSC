'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { INDIA_CITIES } from '../../../lib/indiaCities';
import { spaceGrotesk, inter } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { CategoryChip } from '../../../components/ui/CategoryChip';
import { processSurveyRecord } from '../../../lib/gemini';
import { db, writeBatch, collection, doc } from '../../../lib/firebase';
import { CommunityNeed, NeedStatus } from '../../../types';

// ──────── types ────────
type UploadPhase = 'idle' | 'parsing' | 'processing' | 'preview' | 'saving' | 'completed';

interface ProcessedRow {
  raw: string;
  result: Partial<CommunityNeed>;
  coordinates?: { lat: number; lng: number };
}

// ──────── processing step labels ────────
const PROCESSING_STEPS = [
  'Extracting text…',
  'Classifying categories…',
  'Scoring urgency…',
  'Geo-tagging locations…',
  'Estimating impact…',
  'Structuring records…',
];

// ──────── urgency colour helper ────────
function urgencyBarColor(score: number) {
  if (score >= 8) return '#FF6B35';
  if (score >= 6) return '#fbbf24';
  if (score >= 4) return '#00D4C8';
  return '#9ca3af';
}

// ──────── circular progress ring ────────
function ProgressRing({
  progress,
  size = 140,
  stroke = 6,
}: {
  progress: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      {/* active arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-300"
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D4C8" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════
export default function UploadPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [entryMode, setEntryMode] = useState<'file' | 'manual'>('file');
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<string[]>([]);
  const [processed, setProcessed] = useState<ProcessedRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // -- Manual Entry Form State --
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<string>('other');
  const [manualUrgency, setManualUrgency] = useState(5);
  const [manualLocation, setManualLocation] = useState('');
  const [manualCount, setManualCount] = useState(0);
  const [manualDesc, setManualDesc] = useState('');

  // ── CSV parse ──
  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setPhase('parsing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as Record<string, string>[]).map((row) =>
          Object.values(row).filter(Boolean).join('. ')
        );
        setRawRows(rows);
        processRows(rows);
      },
      error: () => {
        toast.error('Failed to parse file');
        setPhase('idle');
      },
    });
  }, []);

  // ── Gemini row-by-row ──
  const processRows = async (rows: string[]) => {
    setPhase('processing');
    setProgress(0);
    setStepIndex(0);

    const results: ProcessedRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      // rotate visible step label for visual variety
      setStepIndex(i % PROCESSING_STEPS.length);

      const result = await processSurveyRecord(rows[i]);
      results.push({ raw: rows[i], result });

      setProgress(Math.round(((i + 1) / rows.length) * 100));
      setProcessed([...results]);
      
      // Small delay to prevent hitting Gemini rate limits (15 RPM)
      if (i < rows.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setProcessed(results);
    setPhase('preview');
  };

  const handleManualAdd = () => {
    if (!manualTitle || !manualDesc) {
      toast.error('Please fill in required fields');
      return;
    }

    const cityData = INDIA_CITIES.find(c => c.name === manualLocation);

    const newResult: ProcessedRow = {
      raw: manualDesc,
      result: {
        title: manualTitle,
        category: manualCategory as any,
        urgencyScore: manualUrgency,
        location: manualLocation,
        affectedCount: manualCount,
        description: manualDesc,
      },
      // Store coordinates immediately if available
      coordinates: cityData ? { lat: cityData.lat, lng: cityData.lng } : undefined
    };

    setProcessed([...processed, newResult]);
    setPhase('preview');
    
    // reset form
    setManualTitle('');
    setManualLocation('');
    setManualDesc('');
    setManualCount(0);
    setManualUrgency(5);
    
    toast.success('Manual entry added to list');
  };

  const updateRowLocation = (idx: number, cityName: string) => {
    const cityData = INDIA_CITIES.find(c => c.name === cityName);
    const newProcessed = [...processed];
    newProcessed[idx] = {
      ...newProcessed[idx],
      result: { ...newProcessed[idx].result, location: cityName },
      coordinates: cityData ? { lat: cityData.lat, lng: cityData.lng } : undefined
    };
    setProcessed(newProcessed);
  };

  // ── Firestore batch write ──
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    try {
      setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' });
      const { Geocoder } = await importLibrary('geocoding');
      const geocoder = new Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            console.warn('Geocoding failed for:', address, status);
            resolve({ lat: 0, lng: 0 }); // Fallback
          }
        });
      });
    } catch (err) {
      console.error('Geocoder init failed:', err);
      return { lat: 0, lng: 0 };
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    setPhase('saving');

    try {
      const batch = writeBatch(db);

      // We use a for...of loop to ensure sequential geocoding and avoid hitting API rate limits too hard
      let geocodedCount = 0;
      for (const row of processed) {
        let coords = row.coordinates;
        
        if (!coords || (coords.lat === 0 && coords.lng === 0)) {
          toast.loading(`Geocoding: ${row.result.location || 'Unknown'}...`, { id: 'geocoding' });
          coords = await geocodeAddress(row.result.location || '');
        }

        if (coords && (coords.lat !== 0 || coords.lng !== 0)) {
          geocodedCount++;
        }

        const ref = doc(collection(db, 'needs'));
        batch.set(ref, {
          ...row.result,
          status: NeedStatus.OPEN,
          coordinates: coords || { lat: 0, lng: 0 },
          createdAt: new Date(),
        });
      }

      toast.success(`Geocoded ${geocodedCount}/${processed.length} locations`, { id: 'geocoding' });
      await batch.commit();

      console.log('Upload: Batch write successful, committed', processed.length, 'records');
      
      toast.success(`Successfully saved ${processed.length} records`, { id: 'geocoding' });
      setPhase('completed');
      setProcessed([]);
    } catch (err: any) {
      console.error('Upload Error Details:', err);
      const errorMsg = err?.message || 'Check connection';
      toast.error(`Database Error: ${errorMsg}`, { id: 'geocoding' });
      setPhase('preview');
    } finally {
      setSaving(false);
    }
  };

  // ── Dropzone ──
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    onDrop: (files) => files[0] && handleFile(files[0]),
  });

  // ════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════
  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8">
        {/* ── Title row ── */}
        <div>
          <h2 className={cn('text-2xl md:text-3xl font-bold', spaceGrotesk.className)}>
            Data Ingestion Console
          </h2>
          <p className={cn('text-gray-400 mt-1 text-sm md:text-base', inter.className)}>
            Upload CSV survey data — each row will be AI-processed into a
            structured community need.
          </p>
        </div>

        {/* ── Mode Switcher ── */}
        {phase === 'idle' && (
          <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10">
            <button
              onClick={() => setEntryMode('file')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                entryMode === 'file' ? "bg-[#00D4C8] text-[#0f131f] shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              File Upload (AI)
            </button>
            <button
              onClick={() => setEntryMode('manual')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                entryMode === 'manual' ? "bg-[#7C3AED] text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              Manual Entry
            </button>
          </div>
        )}

        {/* ── Dropzone (idle / parsing) ── */}
        {phase === 'idle' && entryMode === 'file' && (
          <GlassCard
            className={cn(
              'flex flex-col items-center justify-center py-12 px-6 md:py-20 md:px-10 transition-all cursor-pointer',
              isDragActive && 'shadow-[0_0_30px_rgba(0,212,200,0.25)]'
            )}
            glowColor={isDragActive ? 'rgba(0,212,200,0.5)' : 'rgba(0,212,200,0.2)'}
            {...getRootProps()}
          >
            <input {...getInputProps()} />

            <motion.div
              animate={isDragActive ? { y: [0, -12, 0] } : { y: 0 }}
              transition={{
                repeat: isDragActive ? Infinity : 0,
                duration: 0.6,
                ease: 'easeInOut',
              }}
              className="mb-6"
            >
              <Upload
                className={cn(
                  'w-14 h-14 transition-colors',
                  isDragActive ? 'text-[#00D4C8]' : 'text-gray-500'
                )}
              />
            </motion.div>

            <p className={cn('text-lg font-semibold', spaceGrotesk.className)}>
              {isDragActive
                ? 'Release to ingest'
                : 'Drag & drop survey file here'}
            </p>
            <p className={cn('text-sm text-gray-400 mt-2', inter.className)}>
              Accepts .csv, .xlsx, .pdf, .jpg, .png
            </p>
          </GlassCard>
        )}

        {/* ── Manual Entry Form ── */}
        {phase === 'idle' && entryMode === 'manual' && (
          <GlassCard className="p-6 md:p-10 flex flex-col gap-6" glowColor="rgba(124,58,237,0.3)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Title *</span>
                <input 
                  type="text" 
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="Short summary of the need"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Category *</span>
                <select 
                  value={manualCategory}
                  onChange={e => setManualCategory(e.target.value)}
                  className="bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                >
                  <option value="medical" className="bg-[#1a1f2e]">Medical</option>
                  <option value="food" className="bg-[#1a1f2e]">Food</option>
                  <option value="education" className="bg-[#1a1f2e]">Education</option>
                  <option value="housing" className="bg-[#1a1f2e]">Housing</option>
                  <option value="safety" className="bg-[#1a1f2e]">Safety</option>
                  <option value="other" className="bg-[#1a1f2e]">Other</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Location *</span>
                <select 
                  value={manualLocation}
                  onChange={e => setManualLocation(e.target.value)}
                  className="bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                >
                  {INDIA_CITIES.map(city => (
                    <option key={city.name} value={city.name} className="bg-[#1a1f2e]">{city.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">People Affected</span>
                <input 
                  type="number" 
                  value={manualCount}
                  onChange={e => setManualCount(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Urgency Level</span>
                <span className="text-sm font-bold text-[#7C3AED]">{manualUrgency}/10</span>
              </div>
              <input 
                type="range" 
                min={1} max={100} 
                value={manualUrgency * 10}
                onChange={e => setManualUrgency(Math.ceil(Number(e.target.value) / 10))}
                className="w-full accent-[#7C3AED]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Full Description *</span>
              <textarea 
                rows={3}
                value={manualDesc}
                onChange={e => setManualDesc(e.target.value)}
                placeholder="Describe the situation in detail..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 resize-none"
              />
            </label>

            <button 
              onClick={handleManualAdd}
              className="mt-2 py-3 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Add to Results
            </button>
          </GlassCard>
        )}

        {/* ── Parsing state ── */}
        {phase === 'parsing' && (
          <GlassCard className="flex flex-col items-center justify-center py-20 px-10">
            <Loader2 className="w-14 h-14 text-[#00D4C8] animate-spin mb-6" />
            <p className={cn('text-lg font-semibold', spaceGrotesk.className)}>Parsing file…</p>
          </GlassCard>
        )}

        {/* ── Processing state ── */}
        {phase === 'processing' && (
          <GlassCard className="flex flex-col items-center justify-center py-10 px-6 md:py-16 md:px-10">
            <div className="relative mb-8">
              <ProgressRing progress={progress} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn('text-3xl font-bold text-white', spaceGrotesk.className)}>
                  {progress}%
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn('text-[#00D4C8] font-semibold text-lg mb-1', spaceGrotesk.className)}
              >
                {PROCESSING_STEPS[stepIndex]}
              </motion.p>
            </AnimatePresence>

            <p className={cn('text-sm text-gray-400', inter.className)}>
              {processed.length} of {rawRows.length} records ingested
            </p>

            <div className="flex items-center gap-2 mt-6">
              <FileSpreadsheet className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 truncate max-w-[220px]">
                {fileName}
              </span>
            </div>
          </GlassCard>
        )}

        {/* ── Results preview table ── */}
        {(phase === 'preview' || phase === 'saving') && (
          <>
            {/* summary bar */}
            <GlassCard className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-6 py-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#d2bbff]" />
                <span className={cn('font-semibold', spaceGrotesk.className)}>
                  {processed.length} records extracted
                </span>
                <span className="text-xs text-gray-500">from {fileName}</span>
              </div>

              <GradientButton
                onClick={handleConfirm}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {saving ? 'Committing…' : 'Confirm & Save'}
              </GradientButton>
            </GlassCard>

            {/* table */}
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className={cn('w-full text-sm min-w-[640px]', inter.className)}>
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left">#</th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left">Category</th>
                      <th className="px-5 py-4 text-left">Location</th>
                      <th className="px-5 py-4 text-left">Urgency</th>
                      <th className="px-5 py-4 text-left">Description</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence>
                      {processed.map((row, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-4 text-gray-500 font-mono text-xs">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          <td className="px-5 py-4">
                            <CategoryChip
                              label={row.result.category || 'other'}
                              selected
                              color={
                                row.result.category === 'medical'
                                  ? '#00D4C8'
                                  : row.result.category === 'food'
                                  ? '#d2bbff'
                                  : row.result.category === 'education'
                                  ? '#fbbf24'
                                  : row.result.category === 'housing'
                                  ? '#FF6B35'
                                  : row.result.category === 'safety'
                                  ? '#ef4444'
                                  : '#9ca3af'
                              }
                            />
                          </td>

                          <td className="py-4 px-4 text-sm">
                        <select 
                          value={INDIA_CITIES.some(c => c.name === row.result.location) ? row.result.location : ""}
                          onChange={(e) => updateRowLocation(idx, e.target.value)}
                          className="bg-[#1a1f2e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00D4C8]"
                        >
                          <option value="" disabled className="bg-[#1a1f2e]">Select City</option>
                          {INDIA_CITIES.map(city => (
                            <option key={city.name} value={city.name} className="bg-[#1a1f2e]">{city.name}</option>
                          ))}
                        </select>
                      </td>

                          {/* urgency mini-bar */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-bold text-xs w-5 text-center"
                                style={{ color: urgencyBarColor(row.result.urgencyScore || 0) }}
                              >
                                {row.result.urgencyScore}
                              </span>
                              <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${((row.result.urgencyScore || 0) / 10) * 100}%`,
                                    backgroundColor: urgencyBarColor(row.result.urgencyScore || 0),
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-gray-300 max-w-[220px] truncate">
                            {row.result.description || '—'}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <CheckCircle2 className="w-4 h-4 text-[#00D4C8] inline-block" />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}

        {/* ── Success state ── */}
        {phase === 'completed' && (
          <GlassCard className="flex flex-col items-center justify-center py-20 px-10 text-center" glowColor="rgba(0,212,200,0.4)">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-20 h-20 rounded-full bg-[#00D4C8]/10 border border-[#00D4C8]/30 flex items-center justify-center mb-8"
            >
              <CheckCircle2 className="w-10 h-10 text-[#00D4C8]" />
            </motion.div>
            
            <h3 className={cn('text-2xl font-bold mb-2', spaceGrotesk.className)}>
              Ingestion Successful
            </h3>
            <p className={cn('text-gray-400 max-w-sm mb-10', inter.className)}>
              All records have been structured and saved to the live database. The mission control feed has been updated.
            </p>

            <div className="flex gap-4">
              <GradientButton onClick={() => setPhase('idle')} variant="ghost">
                Upload More
              </GradientButton>
              <GradientButton onClick={() => router.push('/dashboard')}>
                View Dashboard
              </GradientButton>
            </div>
          </GlassCard>
        )}
      </div>
    </>
  );
}
