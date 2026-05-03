import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

const skillData = [
  { skill: 'DSA', score: 72 }, { skill: 'System Design', score: 58 },
  { skill: 'Behavioral', score: 85 }, { skill: 'Communication', score: 78 },
  { skill: 'Problem Solving', score: 65 }, { skill: 'Domain Knowledge', score: 80 },
]

const progressData = [
  { session: 'S1', score: 52 }, { session: 'S2', score: 61 },
  { session: 'S3', score: 58 }, { session: 'S4', score: 70 },
  { session: 'S5', score: 75 }, { session: 'S6', score: 82 },
]

const recentInterviews = [
  { role: 'SWE — Google', score: 82, date: '2 days ago' },
  { role: 'PM — Razorpay', score: 74, date: '5 days ago' },
  { role: 'SDE II — Swiggy', score: 68, date: '1 week ago' },
]

const skillGaps = [
  { skill: 'System Design', level: 58, priority: 'High' },
  { skill: 'DSA — Trees & Graphs', level: 62, priority: 'High' },
  { skill: 'SQL Optimization', level: 70, priority: 'Medium' },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Resume', path: '/resume', icon: '📄' },
    { label: 'Interview', path: '/interview', icon: '🎤' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', padding: '20px 12px', position: 'fixed',
        top: 0, left: 0, height: '100vh', zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--text-primary)', fontSize: 15 }}>HireSync <span style={{ color: '#8B5CF6' }}>AI</span></span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div className={`sidebar-item ${window.location.pathname === item.path ? 'active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={toggle} className="sidebar-item" style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
            <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>🚪</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 220, padding: 32, maxWidth: '100%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 20, padding: '28px 32px', marginBottom: 28, background: 'linear-gradient(135deg, #1A0A2E, #0F1A35)', border: '1px solid rgba(139,92,246,0.3)', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: '#8B5CF6', filter: 'blur(60px)', opacity: 0.15, transform: 'translate(30%, -30%)' }} />
            <p style={{ color: '#93C5FD', fontSize: 14, marginBottom: 6 }}>👋 Good morning</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white', marginBottom: 8 }}>
              {user?.name?.split(' ')[0]}, let's get you hired 🚀
            </h1>
            <p style={{ color: '#93C5FD', fontSize: 14 }}>Your interview score improved by <strong style={{ color: 'white' }}>12%</strong> this week.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Link to="/resume"><button className="hs-btn-secondary" style={{ fontSize: 13 }}>📄 Analyze Resume</button></Link>
              <Link to="/interview"><button className="hs-btn-primary" style={{ fontSize: 13 }}>🎤 Start Interview</button></Link>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'ATS Score', value: '84%', change: '+6%', icon: '📄', color: '#8B5CF6' },
              { label: 'Interviews Done', value: '12', change: '+3', icon: '🎤', color: '#22D3EE' },
              { label: 'Best Score', value: '92%', icon: '🏆', color: '#EC4899' },
              { label: 'Avg. Score', value: '74%', change: '+12%', icon: '📊', color: '#F59E0B' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="hs-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: s.color, filter: 'blur(30px)', opacity: 0.2 }} />
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{s.icon}</div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</p>
                {s.change && <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#10B98120', padding: '2px 8px', borderRadius: 100, position: 'absolute', top: 16, right: 16 }}>{s.change}</span>}
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 24 }}>
            {/* Line Chart */}
            <div className="hs-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Interview Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="session" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1A2340', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} activeDot={{ fill: '#EC4899', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="hs-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Skill Radar</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 10 }} />
                  <Radar dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Skill Gaps */}
            <div className="hs-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Skill Gaps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {skillGaps.map(s => (
                  <div key={s.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{s.skill}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: s.priority === 'High' ? '#EC489920' : '#F59E0B20', color: s.priority === 'High' ? '#EC4899' : '#F59E0B' }}>{s.priority}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${s.level}%`, background: s.priority === 'High' ? 'linear-gradient(90deg, #EC4899, #8B5CF6)' : 'linear-gradient(90deg, #F59E0B, #EF4444)', transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Interviews */}
            <div className="hs-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Interviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentInterviews.map((iv, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎤</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{iv.role}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{iv.date}</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: iv.score >= 80 ? '#10B981' : iv.score >= 65 ? '#F59E0B' : '#EF4444' }}>{iv.score}%</span>
                  </div>
                ))}
              </div>
              <Link to="/interview">
                <button className="hs-btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: 13 }}>🎤 Start New Interview</button>
              </Link>
            </div>

            {/* AI Recommendations */}
            <div className="hs-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>AI Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { text: 'Practice 3 system design questions this week', icon: '🏗️' },
                  { text: 'Review your answers from the Google SWE session', icon: '📋' },
                  { text: 'Upload your latest resume for re-analysis', icon: '📄' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p style={{ fontSize: 12, color: '#C4B5FD' }}>🧠 Gemini AI analyzed your last 6 sessions to generate these suggestions.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}