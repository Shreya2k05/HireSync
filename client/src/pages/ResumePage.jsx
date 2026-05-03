import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ScoreRing({ score, size = 130, color = '#8B5CF6' }) {
  const r = (size - 14) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.22, color: 'var(--text-primary)' }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
      </div>
    </div>
  )
}

function SkillPill({ skill, type }) {
  const matched = type === 'matched'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
      background: matched ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
      color: matched ? '#10B981' : '#EF4444',
      border: `1px solid ${matched ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
    }}>
      {matched ? '✓' : '✕'} {skill}
    </span>
  )
}

export default function ResumePage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedResume, setUploadedResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [step, setStep] = useState('upload')

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Only PDF or Word documents under 5MB allowed')
      return
    }
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first')
    setUploading(true)
    try {
      const token = localStorage.getItem('hs_token')
      const formData = new FormData()
      formData.append('resume', file)
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setUploadedResume(data.resume)
      toast.success('Resume uploaded!')
      setStep('jd')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return toast.error('Please paste a job description')
    if (jobDescription.trim().length < 50) return toast.error('Job description is too short')
    if (!uploadedResume) return toast.error('Please upload a resume first')
    setAnalyzing(true)
    try {
      const token = localStorage.getItem('hs_token')
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: uploadedResume._id,
          jobDescription: jobDescription.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Analysis failed')
      setAnalysis(data.analysis)
      setStep('results')
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setUploadedResume(null)
    setJobDescription('')
    setAnalysis(null)
    setStep('upload')
  }

  const scoreColor = analysis
    ? analysis.atsScore >= 75 ? '#10B981'
      : analysis.atsScore >= 50 ? '#F59E0B'
      : '#EF4444'
    : '#8B5CF6'

  const btnStyle = (disabled) => ({
    padding: '11px 22px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    color: 'white', fontWeight: 700, fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'DM Sans, sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  })

  const secondaryBtnStyle = {
    padding: '11px 22px', borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--bg-card)', color: 'var(--text-primary)',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>
          Resume Analyzer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Upload your resume and paste a job description to get your ATS score and skill gap analysis.
        </p>
      </motion.div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {[
          { id: 'upload', label: 'Upload Resume', num: 1 },
          { id: 'jd', label: 'Job Description', num: 2 },
          { id: 'results', label: 'ATS Results', num: 3 },
        ].map((s, i) => {
          const active = step === s.id
          const done = (step === 'jd' && i === 0) || (step === 'results' && i < 2)
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: done ? '#10B981' : active ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'var(--bg-card)',
                  color: done || active ? 'white' : 'var(--text-muted)',
                  border: active || done ? 'none' : '1px solid var(--border)',
                }}>
                  {done ? '✓' : s.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1, margin: '0 10px', background: done ? '#10B981' : 'var(--border)', transition: 'background 0.3s' }} />
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* STEP 1 */}
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="hs-card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>Upload Your Resume</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Supports PDF, DOC, DOCX — max 5MB</p>

              <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? '#8B5CF6' : file ? '#10B981' : 'var(--border)'}`,
                borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                background: isDragActive ? 'rgba(139,92,246,0.05)' : file ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)',
                transition: 'all 0.2s ease',
              }}>
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                    <p style={{ fontWeight: 700, color: '#10B981', fontSize: 14, marginBottom: 4 }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{formatSize(file.size)}</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null) }}
                      style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{isDragActive ? '📂' : '☁️'}</div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 6 }}>
                      {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>or click to browse</p>
                    <span style={{ padding: '7px 18px', borderRadius: 8, background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', fontSize: 12, fontWeight: 600, border: '1px solid rgba(139,92,246,0.25)' }}>
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <p style={{ fontSize: 12, color: '#C4B5FD', fontWeight: 600, marginBottom: 6 }}>💡 Tips for best results</p>
                {['Use PDF for most accurate text extraction', 'Make sure resume is text-based not a scanned image', 'Include skills, experience and education clearly'].map(tip => (
                  <p key={tip} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>→ {tip}</p>
                ))}
              </div>

              <button onClick={handleUpload} disabled={!file || uploading} style={{ ...btnStyle(!file || uploading), width: '100%', marginTop: 20, padding: '12px' }}>
                {uploading ? (
                  <>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Uploading...
                  </>
                ) : '📤 Upload Resume'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 'jd' && (
          <motion.div key="jd" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="hs-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
                <span>✅</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>Resume uploaded successfully</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{uploadedResume?.originalName} · {formatSize(uploadedResume?.fileSize)}</p>
                </div>
              </div>

              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>Paste Job Description</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Copy the full job description from LinkedIn, Naukri, or any job board.</p>

              <textarea
                rows={12}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{jobDescription.length} characters</span>
                <span style={{ fontSize: 12, color: jobDescription.length >= 50 ? '#10B981' : 'var(--text-muted)' }}>
                  {jobDescription.length >= 50 ? '✓ Good length' : 'Minimum 50 characters'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('upload')} style={secondaryBtnStyle}>← Back</button>
                <button
                  onClick={handleAnalyze}
                  disabled={jobDescription.trim().length < 50 || analyzing}
                  style={{ ...btnStyle(jobDescription.trim().length < 50 || analyzing), flex: 1 }}
                >
                  {analyzing ? (
                    <>
                      <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Analyzing with Gemini AI...
                    </>
                  ) : '🧠 Analyze with AI →'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 'results' && analysis && (
          <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="hs-card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 20 }}>ATS Analysis Results</h2>
              <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <ScoreRing score={analysis.atsScore} color={scoreColor} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>
                    {analysis.atsScore >= 75 ? '🟢 Strong Match' : analysis.atsScore >= 50 ? '🟡 Moderate Match' : '🔴 Weak Match'}
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {analysis.summary && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16, padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      💬 {analysis.summary}
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Matched Skills', value: analysis.matchedSkills?.length || 0, color: '#10B981' },
                      { label: 'Missing Skills', value: analysis.missingSkills?.length || 0, color: '#EF4444' },
                      { label: 'Compatibility', value: `${analysis.compatibilityPct || 0}%`, color: '#8B5CF6' },
                      { label: 'Suggestions', value: analysis.suggestions?.length || 0, color: '#F59E0B' },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#10B981', marginBottom: 14 }}>
                  ✓ Matched Skills <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', color: '#10B981', marginLeft: 4 }}>{analysis.matchedSkills?.length || 0}</span>
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.matchedSkills?.length > 0
                    ? analysis.matchedSkills.map(s => <SkillPill key={s} skill={s} type="matched" />)
                    : <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No matched skills found</p>}
                </div>
              </div>
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#EF4444', marginBottom: 14 }}>
                  ✕ Missing Skills <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', color: '#EF4444', marginLeft: 4 }}>{analysis.missingSkills?.length || 0}</span>
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.missingSkills?.length > 0
                    ? analysis.missingSkills.map(s => <SkillPill key={s} skill={s} type="missing" />)
                    : <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No missing skills detected</p>}
                </div>
              </div>
            </div>

            {analysis.suggestions?.length > 0 && (
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>💡 AI Improvement Suggestions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={handleReset} style={secondaryBtnStyle}>📄 Analyze Another Resume</button>
              <button onClick={() => window.location.href = '/interview'} style={btnStyle(false)}>🎤 Start Mock Interview →</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}