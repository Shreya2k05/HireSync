import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left — Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 40, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
              HireSync <span style={{ color: '#8B5CF6' }}>AI</span>
            </span>
          </Link>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Sign in to continue your interview prep</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                className="hs-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
              {errors.email && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                className="hs-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
              {errors.password && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hs-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 24 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>

          <button
            onClick={toggle}
            style={{ display: 'block', margin: '24px auto 0', padding: '8px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </motion.div>
      </div>

      {/* Right — Visual */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'linear-gradient(135deg, #0B1020, #1A0A2E)', position: 'relative', overflow: 'hidden' }}
        className="lg:flex">
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: 300, height: 300, borderRadius: '50%', background: '#8B5CF6', filter: 'blur(80px)', opacity: 0.2 }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', boxShadow: '0 0 60px rgba(139,92,246,0.5)' }}>⚡</div>
          </motion.div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'white', marginBottom: 12 }}>AI-Powered Interview Prep</h2>
          <p style={{ color: '#93C5FD', maxWidth: 280, lineHeight: 1.6 }}>Upload your resume, get your ATS score, and practice with personalized mock interviews.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24, justifyContent: 'center' }}>
            {['ATS Analysis', 'Mock Interviews', 'AI Feedback', 'Skill Gaps'].map(f => (
              <span key={f} style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.2)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.3)' }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}