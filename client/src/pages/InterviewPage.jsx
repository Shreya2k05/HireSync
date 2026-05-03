import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ── Timer Hook ────────────────────────────────────────────────────────────────
function useTimer(isRunning) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning])
  const reset = () => setSeconds(0)
  const format = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return { seconds, format: format(seconds), reset }
}

// ── Category Badge ────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const styles = {
    technical:    { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', label: '⚙️ Technical' },
    behavioral:   { bg: 'rgba(34,211,238,0.15)', color: '#22D3EE', label: '🧠 Behavioral' },
    situational:  { bg: 'rgba(236,72,153,0.15)', color: '#EC4899', label: '💡 Situational' },
    domain:       { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: '🎯 Domain' },
  }
  const s = styles[category] || styles.technical
  return (
    <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ── Difficulty Badge ──────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }) {
  const styles = {
    easy:   { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
    medium: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    hard:   { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
  }
  const s = styles[difficulty] || styles.medium
  return (
    <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, textTransform: 'capitalize' }}>
      {difficulty}
    </span>
  )
}

// ── Score Circle ──────────────────────────────────────────────────────────────
function ScoreCircle({ score, size = 80 }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.22, color }}>{score}</span>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InterviewPage() {
  // Phases: 'setup' | 'interview' | 'feedback' | 'results'
  const [phase, setPhase] = useState('setup')

  // Setup state
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [generating, setGenerating] = useState(false)

  // Interview state
  const [interview, setInterview] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [answeredQuestions, setAnsweredQuestions] = useState([])

  // Results state
  const [completing, setCompleting] = useState(false)
  const [results, setResults] = useState(null)

  const timer = useTimer(phase === 'interview' && !evaluation)
  const textareaRef = useRef(null)

  const currentQuestion = interview?.questions[currentIdx]
  const totalQuestions = interview?.questions?.length || 0
  const isLastQuestion = currentIdx === totalQuestions - 1

  // ── Generate Interview ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!jobDescription.trim()) return toast.error('Please paste a job description')
    if (jobDescription.trim().length < 30) return toast.error('Job description is too short')
    setGenerating(true)
    try {
      const token = localStorage.getItem('hs_token')
      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobTitle: jobTitle.trim() || 'Software Engineer',
          jobDescription: jobDescription.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to generate interview')
      setInterview(data.interview)
      setPhase('interview')
      toast.success('Interview ready! Good luck 🎯')
    } catch (err) {
      toast.error(err.message || 'Failed to generate. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Submit Answer ───────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return toast.error('Please write an answer first')
    if (answer.trim().length < 10) return toast.error('Answer is too short')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('hs_token')
      const res = await fetch(`/api/interview/${interview._id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion._id,
          answer: answer.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit answer')
      setEvaluation(data.evaluation)
      setAnsweredQuestions(prev => [...prev, {
        ...currentQuestion,
        answer: answer.trim(),
        score: data.evaluation.score,
        feedback: data.evaluation.feedback,
      }])
    } catch (err) {
      toast.error(err.message || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Next Question ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete()
    } else {
      setCurrentIdx(prev => prev + 1)
      setAnswer('')
      setEvaluation(null)
      timer.reset()
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  // ── Complete Interview ──────────────────────────────────────────────────────
  const handleComplete = async () => {
    setCompleting(true)
    setPhase('feedback')
    try {
      const token = localStorage.getItem('hs_token')
      const res = await fetch(`/api/interview/${interview._id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to complete interview')
      setResults(data.feedback)
      setPhase('results')
    } catch (err) {
      toast.error(err.message || 'Failed to generate feedback')
      setPhase('interview')
    } finally {
      setCompleting(false)
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase('setup')
    setInterview(null)
    setCurrentIdx(0)
    setAnswer('')
    setEvaluation(null)
    setAnsweredQuestions([])
    setResults(null)
    setJobTitle('')
    setJobDescription('')
  }

  const avgScore = answeredQuestions.length > 0
    ? Math.round(answeredQuestions.reduce((a, q) => a + q.score, 0) / answeredQuestions.length)
    : 0

  // ── Styles ──────────────────────────────────────────────────────────────────
  const primaryBtn = (disabled) => ({
    padding: '11px 24px', borderRadius: 12, border: 'none',
    background: disabled ? 'var(--bg-card)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    color: disabled ? 'var(--text-muted)' : 'white',
    fontWeight: 700, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, fontFamily: 'DM Sans, sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
  })

  const secondaryBtn = {
    padding: '11px 22px', borderRadius: 12,
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <AnimatePresence mode="wait">

        {/* ── SETUP PHASE ── */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>
                Mock Interview
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Paste a job description and Gemini AI will generate 8 personalized interview questions just for you.
              </p>
            </div>

            <div className="hs-card" style={{ padding: 28 }}>
              {/* Job Title */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Job Title <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Product Manager, Data Analyst..."
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 16px', borderRadius: 12,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Job Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Job Description <span style={{ color: '#EC4899' }}>*</span>
                </label>
                <textarea
                  rows={10}
                  placeholder="Paste the full job description here...&#10;&#10;The AI will analyze it and generate personalized questions based on the required skills, experience level, and role requirements."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                    resize: 'vertical', outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{jobDescription.length} characters</span>
                  <span style={{ fontSize: 12, color: jobDescription.length >= 30 ? '#10B981' : 'var(--text-muted)' }}>
                    {jobDescription.length >= 30 ? '✓ Ready' : 'Minimum 30 characters'}
                  </span>
                </div>
              </div>

              {/* What to expect */}
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#C4B5FD', marginBottom: 10 }}>🎯 What to expect</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { icon: '❓', text: '8 personalized questions' },
                    { icon: '🤖', text: 'AI scores each answer' },
                    { icon: '⏱️', text: 'Timer per question' },
                    { icon: '📊', text: 'Full report at the end' },
                  ].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={jobDescription.trim().length < 30 || generating}
                style={{ ...primaryBtn(jobDescription.trim().length < 30 || generating), width: '100%', padding: '13px' }}
              >
                {generating ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Generating questions with Gemini AI...
                  </>
                ) : '🎤 Generate Interview Questions →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── INTERVIEW PHASE ── */}
        {phase === 'interview' && interview && (
          <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {interview.jobTitle}
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Question {currentIdx + 1} of {totalQuestions}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14 }}>⏱️</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: timer.seconds > 120 ? '#EF4444' : 'var(--text-primary)' }}>
                    {timer.format}
                  </span>
                </div>
                {/* Score so far */}
                {answeredQuestions.length > 0 && (
                  <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6' }}>Avg: {avgScore}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-card)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                  width: `${((currentIdx + (evaluation ? 1 : 0)) / totalQuestions) * 100}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{answeredQuestions.length} answered</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{totalQuestions - answeredQuestions.length} remaining</span>
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div key={currentIdx}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="hs-card" style={{ padding: 28, marginBottom: 16 }}>
                  {/* Question meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 100 }}>
                      Q{currentIdx + 1}
                    </span>
                    <CategoryBadge category={currentQuestion?.category} />
                    <DifficultyBadge difficulty={currentQuestion?.difficulty} />
                  </div>

                  {/* Question text */}
                  <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 24 }}>
                    {currentQuestion?.question}
                  </p>

                  {/* Answer area — only show if not yet evaluated */}
                  {!evaluation && (
                    <>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Your Answer
                      </label>
                      <textarea
                        ref={textareaRef}
                        rows={6}
                        placeholder="Type your answer here... Be specific and use examples where possible."
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: 12,
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                          resize: 'vertical', outline: 'none', fontFamily: 'DM Sans, sans-serif',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{answer.length} characters</span>
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={answer.trim().length < 10 || submitting}
                          style={primaryBtn(answer.trim().length < 10 || submitting)}
                        >
                          {submitting ? (
                            <>
                              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              Evaluating...
                            </>
                          ) : 'Submit Answer →'}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Evaluation Result */}
                {evaluation && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="hs-card" style={{ padding: 24, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
                        <ScoreCircle score={evaluation.score} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>AI FEEDBACK</p>
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{evaluation.feedback}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {/* Strengths */}
                        {evaluation.strengths?.length > 0 && (
                          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>✓ Strengths</p>
                            {evaluation.strengths.map((s, i) => (
                              <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</p>
                            ))}
                          </div>
                        )}
                        {/* Improvements */}
                        {evaluation.improvements?.length > 0 && (
                          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>↑ Improve</p>
                            {evaluation.improvements.map((s, i) => (
                              <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</p>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleNext}
                        style={{ ...primaryBtn(false), marginTop: 16, width: '100%', padding: '12px' }}
                      >
                        {isLastQuestion ? '🏁 Complete Interview & Get Results' : `Next Question → (${currentIdx + 2}/${totalQuestions})`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Question dots */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
              {interview.questions.map((_, i) => (
                <div key={i} style={{
                  width: i === currentIdx ? 20 : 8, height: 8, borderRadius: 4,
                  background: i < answeredQuestions.length ? '#10B981' : i === currentIdx ? '#8B5CF6' : 'var(--bg-card)',
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--border)',
                }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── FEEDBACK LOADING PHASE ── */}
        {phase === 'feedback' && (
          <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
            <div style={{ width: 60, height: 60, border: '3px solid rgba(139,92,246,0.2)', borderTop: '3px solid #8B5CF6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', marginBottom: 8 }}>
                Analyzing your performance...
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Gemini AI is generating your personalized feedback report
              </p>
            </div>
          </motion.div>
        )}

        {/* ── RESULTS PHASE ── */}
        {phase === 'results' && results && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Header */}
            <div style={{ marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>
                Interview Complete! 🎉
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Here's your detailed performance report</p>
            </div>

            {/* Score Overview */}
            <div className="hs-card" style={{ padding: 28, background: 'linear-gradient(135deg, #1A0A2E, #0F1A35)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'Overall Score', value: results.overallScore, color: '#8B5CF6' },
                  { label: 'Technical', value: results.technicalScore, color: '#22D3EE' },
                  { label: 'Communication', value: results.communicationScore, color: '#EC4899' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <ScoreCircle score={s.value} size={90} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                  </div>
                ))}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {results.summary && (
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      💬 {results.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#10B981', marginBottom: 14 }}>✓ Strengths</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.strengths?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#EF4444', marginBottom: 14 }}>↑ Areas to Improve</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.weaknesses?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <span style={{ color: '#EF4444', flexShrink: 0 }}>↑</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {results.suggestions?.length > 0 && (
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>💡 AI Suggestions for Next Time</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per-question breakdown */}
            {answeredQuestions.length > 0 && (
              <div className="hs-card" style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>📋 Question Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {answeredQuestions.map((q, i) => {
                    const scoreColor = q.score >= 75 ? '#10B981' : q.score >= 50 ? '#F59E0B' : '#EF4444'
                    return (
                      <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Q{i + 1}</span>
                              <CategoryBadge category={q.category} />
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>{q.question}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.feedback}</p>
                          </div>
                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: scoreColor }}>{q.score}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={handleReset} style={secondaryBtn}>🎤 Start New Interview</button>
              <button onClick={() => window.location.href = '/analytics'} style={primaryBtn(false)}>📊 View Analytics →</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}