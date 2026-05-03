import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'At least 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form.name.trim(), form.email, form.password)
      toast.success('Account created! Welcome 🚀')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            HireSync <span style={{ color: '#8B5CF6' }}>AI</span>
          </span>
        </Link>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: 'var(--text-primary)', marginBottom: 8 }}>Create account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Start your AI-powered interview prep for free</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Aryan Mehta' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
            { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{field.label}</label>
              <input
                type={field.type}
                className="hs-input"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
              />
              {errors[field.key] && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors[field.key]}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="hs-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating account...' : "Create Account — It's Free"}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}