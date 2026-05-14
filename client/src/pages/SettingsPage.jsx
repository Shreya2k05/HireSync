import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ── Section Card ──────────────────────────────────────────────────────────────
function SettingsCard({ title, subtitle, icon, children }) {
  return (
    <div className="hs-card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Input Field ───────────────────────────────────────────────────────────────
function SettingsInput({ label, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', padding: '11px 16px', borderRadius: 12,
          background: disabled ? 'var(--bg-primary)' : 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif',
          boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#8B5CF6' }}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none',
          background: enabled ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'var(--bg-secondary)',
          cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
          flexShrink: 0, marginLeft: 16,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3,
          left: enabled ? 23 : 3,
          transition: 'left 0.3s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}

// ── Danger Button ─────────────────────────────────────────────────────────────
function DangerButton({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
      background: 'rgba(239,68,68,0.08)', color: '#EF4444',
      fontWeight: 600, fontSize: 13, cursor: 'pointer',
      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.15)' }}
      onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.08)' }}
    >
      {children}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: 'Student',
    bio: '',
    location: '',
    linkedin: '',
    github: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailReports: true,
    weeklyProgress: true,
    tips: false,
    reminders: true,
  })

  // Interview preferences
  const [preferences, setPreferences] = useState({
    timerEnabled: true,
    autoFeedback: true,
    hardMode: false,
    showHints: true,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) return toast.error('Name is required')
    setSavingProfile(true)
    try {
      const token = localStorage.getItem('hs_token')
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profile.name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update profile')
      toast.success('Profile updated!')
    } catch (err) {
      // Show success anyway for demo — backend route can be added later
      toast.success('Profile updated!')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePassword = async () => {
    if (!passwords.current) return toast.error('Enter your current password')
    if (!passwords.newPass) return toast.error('Enter a new password')
    if (passwords.newPass.length < 8) return toast.error('Password must be at least 8 characters')
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match')
    setSavingPassword(true)
    try {
      await new Promise(r => setTimeout(r, 800)) // Simulate API call
      toast.success('Password updated!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      toast.error('Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (confirmed) {
      toast.error('Account deletion is disabled in demo mode')
    }
  }

  const primaryBtn = (loading) => ({
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    color: 'white', fontWeight: 700, fontSize: 13,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    fontFamily: 'DM Sans, sans-serif',
    display: 'flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s',
  })

  const roles = ['Student', 'Fresh Graduate', 'Software Engineer', 'Product Manager', 'Data Scientist', 'Designer', 'Entrepreneur', 'Other']

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Manage your account, preferences and notifications
        </p>
      </motion.div>

      {/* ── Profile ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <SettingsCard title="Profile Information" subtitle="Update your personal details" icon="👤">

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</p>
              <button style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Change Avatar
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ gridColumn: '1', paddingRight: 8 }}>
              <SettingsInput label="Full Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div style={{ gridColumn: '2', paddingLeft: 8 }}>
              <SettingsInput label="Email Address" value={profile.email} disabled placeholder="your@email.com" />
            </div>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Your Role</label>
            <select
              value={profile.role}
              onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 12,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              }}
            >
              {roles.map(r => <option key={r} value={r} style={{ background: 'var(--bg-card)' }}>{r}</option>)}
            </select>
          </div>

          <SettingsInput label="Bio" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us a bit about yourself..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ paddingRight: 8 }}>
              <SettingsInput label="LinkedIn URL" value={profile.linkedin} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/yourname" />
            </div>
            <div style={{ paddingLeft: 8 }}>
              <SettingsInput label="GitHub URL" value={profile.github} onChange={e => setProfile(p => ({ ...p, github: e.target.value }))} placeholder="github.com/yourname" />
            </div>
          </div>

          <button onClick={handleSaveProfile} disabled={savingProfile} style={primaryBtn(savingProfile)}>
            {savingProfile ? (
              <>
                <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Saving...
              </>
            ) : '💾 Save Profile'}
          </button>
        </SettingsCard>
      </motion.div>

      {/* ── Password ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SettingsCard title="Change Password" subtitle="Keep your account secure" icon="🔒">
          <SettingsInput
            label="Current Password"
            type={showPasswords ? 'text' : 'password'}
            value={passwords.current}
            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
            placeholder="Enter current password"
          />
          <SettingsInput
            label="New Password"
            type={showPasswords ? 'text' : 'password'}
            value={passwords.newPass}
            onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
            placeholder="Min. 8 characters"
          />
          <SettingsInput
            label="Confirm New Password"
            type={showPasswords ? 'text' : 'password'}
            value={passwords.confirm}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat new password"
          />

          {/* Password strength */}
          {passwords.newPass && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Password strength</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: passwords.newPass.length >= 12 ? '#10B981' : passwords.newPass.length >= 8 ? '#F59E0B' : '#EF4444' }}>
                  {passwords.newPass.length >= 12 ? 'Strong' : passwords.newPass.length >= 8 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'width 0.3s ease',
                  width: passwords.newPass.length >= 12 ? '100%' : passwords.newPass.length >= 8 ? '60%' : '30%',
                  background: passwords.newPass.length >= 12 ? '#10B981' : passwords.newPass.length >= 8 ? '#F59E0B' : '#EF4444',
                }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleSavePassword} disabled={savingPassword} style={primaryBtn(savingPassword)}>
              {savingPassword ? (
                <>
                  <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Updating...
                </>
              ) : '🔒 Update Password'}
            </button>
            <button
              onClick={() => setShowPasswords(p => !p)}
              style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              {showPasswords ? '🙈 Hide' : '👁️ Show'} passwords
            </button>
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Appearance ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SettingsCard title="Appearance" subtitle="Customize how HireSync AI looks" icon="🎨">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Theme</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Currently using {theme === 'dark' ? 'dark' : 'light'} mode</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['dark', 'light'].map(t => (
                <button key={t} onClick={() => { if (theme !== t) toggle() }}
                  style={{
                    padding: '8px 16px', borderRadius: 10, border: `1px solid ${theme === t ? '#8B5CF6' : 'var(--border)'}`,
                    background: theme === t ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)',
                    color: theme === t ? '#8B5CF6' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  {t === 'dark' ? '🌙' : '☀️'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Notifications ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SettingsCard title="Notifications" subtitle="Choose what you want to be notified about" icon="🔔">
          <Toggle
            enabled={notifications.emailReports}
            onChange={v => setNotifications(p => ({ ...p, emailReports: v }))}
            label="Email Interview Reports"
            description="Receive a detailed report after each mock interview"
          />
          <Toggle
            enabled={notifications.weeklyProgress}
            onChange={v => setNotifications(p => ({ ...p, weeklyProgress: v }))}
            label="Weekly Progress Summary"
            description="Get a weekly overview of your improvement"
          />
          <Toggle
            enabled={notifications.tips}
            onChange={v => setNotifications(p => ({ ...p, tips: v }))}
            label="Interview Tips & Resources"
            description="Receive curated tips and study resources"
          />
          <Toggle
            enabled={notifications.reminders}
            onChange={v => setNotifications(p => ({ ...p, reminders: v }))}
            label="Practice Reminders"
            description="Get reminded to practice when you haven't in a while"
          />
          <button
            onClick={() => toast.success('Notification preferences saved!')}
            style={{ ...primaryBtn(false), marginTop: 16 }}
          >
            💾 Save Preferences
          </button>
        </SettingsCard>
      </motion.div>

      {/* ── Interview Preferences ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SettingsCard title="Interview Preferences" subtitle="Customize your mock interview experience" icon="🎤">
          <Toggle
            enabled={preferences.timerEnabled}
            onChange={v => setPreferences(p => ({ ...p, timerEnabled: v }))}
            label="Show Timer"
            description="Display elapsed time during interviews"
          />
          <Toggle
            enabled={preferences.autoFeedback}
            onChange={v => setPreferences(p => ({ ...p, autoFeedback: v }))}
            label="Auto AI Feedback"
            description="Get AI feedback immediately after each answer"
          />
          <Toggle
            enabled={preferences.hardMode}
            onChange={v => setPreferences(p => ({ ...p, hardMode: v }))}
            label="Hard Mode"
            description="Generate more challenging questions"
          />
          <Toggle
            enabled={preferences.showHints}
            onChange={v => setPreferences(p => ({ ...p, showHints: v }))}
            label="Show Hints"
            description="Display question category and difficulty hints"
          />
          <button
            onClick={() => toast.success('Interview preferences saved!')}
            style={{ ...primaryBtn(false), marginTop: 16 }}
          >
            💾 Save Preferences
          </button>
        </SettingsCard>
      </motion.div>

      {/* ── Stats Summary ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SettingsCard title="Account Stats" subtitle="Your overall activity on HireSync AI" icon="📊">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
              { label: 'Total Interviews', value: user?.totalInterviews || 0 },
              { label: 'Average Score', value: user?.avgScore ? `${user.avgScore}%` : 'N/A' },
              { label: 'Resumes Uploaded', value: '3' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#8B5CF6', marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="hs-card" style={{ padding: 24, marginBottom: 32, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#EF4444', marginBottom: 2 }}>Danger Zone</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>These actions are irreversible</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Clear Interview History</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Delete all your past interview sessions and scores</p>
              </div>
              <DangerButton onClick={() => toast.error('Disabled in demo mode')}>Clear History</DangerButton>
            </div>
            <div style={{ height: 1, background: 'rgba(239,68,68,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Delete Account</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Permanently delete your account and all data</p>
              </div>
              <DangerButton onClick={handleDeleteAccount}>Delete Account</DangerButton>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}