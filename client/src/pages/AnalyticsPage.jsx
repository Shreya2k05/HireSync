import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

// ── Mock Analytics Data ───────────────────────────────────────────────────────
const mockData = {
  stats: [
    { label: 'Total Interviews', value: 12, change: '+3', icon: '🎤', color: '#8B5CF6' },
    { label: 'Average Score', value: '74%', change: '+8%', icon: '📊', color: '#22D3EE' },
    { label: 'Best Score', value: '92%', icon: '🏆', color: '#EC4899' },
    { label: 'ATS Score', value: '84%', change: '+6%', icon: '📄', color: '#F59E0B' },
  ],
  scoreHistory: [
    { session: 'S1', score: 52, date: 'Mar 1' },
    { session: 'S2', score: 61, date: 'Mar 5' },
    { session: 'S3', score: 58, date: 'Mar 8' },
    { session: 'S4', score: 70, date: 'Mar 12' },
    { session: 'S5', score: 75, date: 'Mar 18' },
    { session: 'S6', score: 82, date: 'Mar 22' },
    { session: 'S7', score: 79, date: 'Mar 26' },
    { session: 'S8', score: 88, date: 'Apr 1' },
  ],
  skillRadar: [
    { skill: 'DSA', score: 72 },
    { skill: 'System Design', score: 58 },
    { skill: 'Behavioral', score: 85 },
    { skill: 'Communication', score: 78 },
    { skill: 'Problem Solving', score: 65 },
    { skill: 'Domain Knowledge', score: 80 },
  ],
  categoryScores: [
    { category: 'Technical', score: 71, count: 18 },
    { category: 'Behavioral', score: 84, count: 12 },
    { category: 'Situational', score: 76, count: 8 },
    { category: 'Domain', score: 69, count: 10 },
  ],
  pieData: [
    { name: 'Technical', value: 18, color: '#8B5CF6' },
    { name: 'Behavioral', value: 12, color: '#22D3EE' },
    { name: 'Situational', value: 8, color: '#EC4899' },
    { name: 'Domain', value: 10, color: '#F59E0B' },
  ],
  recentInterviews: [
    { role: 'SWE — Google', score: 88, date: 'Apr 1', duration: '42 min', status: 'completed' },
    { role: 'PM — Razorpay', score: 79, date: 'Mar 26', duration: '38 min', status: 'completed' },
    { role: 'SDE II — Swiggy', score: 82, date: 'Mar 22', duration: '45 min', status: 'completed' },
    { role: 'Frontend — Zomato', score: 75, date: 'Mar 18', duration: '35 min', status: 'completed' },
    { role: 'Fullstack — Meesho', score: 70, date: 'Mar 12', duration: '40 min', status: 'completed' },
  ],
  weakAreas: [
    { skill: 'System Design', score: 58, sessions: 4 },
    { skill: 'DSA — Trees & Graphs', score: 62, sessions: 6 },
    { skill: 'SQL Optimization', score: 65, sessions: 3 },
    { skill: 'Problem Solving', score: 65, sessions: 5 },
  ],
  atsHistory: [
    { label: 'Google SWE', score: 84 },
    { label: 'Razorpay PM', score: 71 },
    { label: 'Swiggy SDE', score: 90 },
    { label: 'Zomato FE', score: 78 },
    { label: 'Meesho FS', score: 85 },
  ],
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#8B5CF6', fontWeight: 700 }}>{p.name}: {p.value}{p.name === 'Score' || p.name === 'score' ? '%' : ''}</p>
      ))}
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, color = '#8B5CF6' }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 3, width: `${value}%`, background: color, transition: 'width 0.7s ease' }} />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('all')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300)
  }, [])

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: loaded ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.4, delay },
  })

  const scoreColor = (score) =>
    score >= 75 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Track your interview performance and progress over time
          </p>
        </div>
        {/* Time range filter */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {['week', 'month', 'all'].map(range => (
            <button key={range} onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                background: timeRange === range ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'transparent',
                color: timeRange === range ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}>
              {range === 'all' ? 'All Time' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div {...fadeUp(0.05)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {mockData.stats.map((s, i) => (
          <div key={i} className="hs-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: s.color, filter: 'blur(30px)', opacity: 0.2 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              {s.change && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>{s.change}</span>
              )}
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 2 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Score History + Radar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>

        {/* Line Chart */}
        <motion.div {...fadeUp(0.1)} className="hs-card" style={{ padding: 24 }}>
          <SectionHeader title="Interview Score History" subtitle="Your performance across all sessions" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockData.scoreHistory}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="session" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" name="Score" stroke="url(#scoreGrad)" strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 0 }}
                activeDot={{ fill: '#EC4899', r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div {...fadeUp(0.15)} className="hs-card" style={{ padding: 24 }}>
          <SectionHeader title="Skill Radar" subtitle="Strength across categories" />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={mockData.skillRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Category Scores + Pie ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>

        {/* Bar Chart */}
        <motion.div {...fadeUp(0.2)} className="hs-card" style={{ padding: 24 }}>
          <SectionHeader title="Score by Category" subtitle="Average score per question type" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockData.categoryScores} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                {mockData.categoryScores.map((_, i) => (
                  <Cell key={i} fill={['#8B5CF6', '#22D3EE', '#EC4899', '#F59E0B'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div {...fadeUp(0.25)} className="hs-card" style={{ padding: 24 }}>
          <SectionHeader title="Question Distribution" subtitle="Breakdown by type" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mockData.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {mockData.pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8}
                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── ATS Score History ── */}
      <motion.div {...fadeUp(0.3)} className="hs-card" style={{ padding: 24, marginBottom: 16 }}>
        <SectionHeader title="ATS Score History" subtitle="Resume compatibility across different job applications" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockData.atsHistory} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]} fill="#22D3EE" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Weak Areas + Recent Interviews ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Weak Areas */}
        <motion.div {...fadeUp(0.35)} className="hs-card" style={{ padding: 24 }}>
          <SectionHeader title="Focus Areas" subtitle="Topics that need improvement" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mockData.weakAreas.map((area, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{area.skill}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{area.sessions} sessions</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(area.score) }}>{area.score}%</span>
                  </div>
                </div>
                <ProgressBar value={area.score} color={scoreColor(area.score)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Interviews */}
        <motion.div {...fadeUp(0.4)} className="hs-card" style={{ padding: 24 }}>
          <SectionHeader title="Recent Interviews" subtitle="Your last 5 sessions" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mockData.recentInterviews.map((iv, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iv.role}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{iv.date} · {iv.duration}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(iv.score), flexShrink: 0 }}>{iv.score}%</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => window.location.href = '/interview'}
            style={{ width: '100%', marginTop: 14, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            🎤 Start New Interview
          </button>
        </motion.div>
      </div>

      {/* ── Improvement Tips ── */}
      <motion.div {...fadeUp(0.45)} className="hs-card" style={{ padding: 24 }}>
        <SectionHeader title="AI Recommendations" subtitle="Based on your performance data" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {[
            { icon: '🏗️', title: 'System Design', text: 'Practice 3 system design questions this week. Focus on scalability and trade-offs.', color: '#8B5CF6' },
            { icon: '🌳', title: 'DSA Practice', text: 'Work on tree and graph problems daily. LeetCode medium difficulty is your target.', color: '#22D3EE' },
            { icon: '📖', title: 'STAR Method', text: 'Prepare 5 strong behavioral stories using the STAR format for common scenarios.', color: '#EC4899' },
          ].map((tip, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 12, background: `${tip.color}10`, border: `1px solid ${tip.color}25` }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 700, color: tip.color, marginBottom: 6 }}>{tip.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}