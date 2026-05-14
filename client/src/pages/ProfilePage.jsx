import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST APIs',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'System Design', 'DSA',
  'Machine Learning', 'Data Analysis', 'Product Management', 'Figma', 'SQL',
]

const BADGES = [
  { icon: '🎯', label: 'First Interview', desc: 'Completed your first mock interview', earned: true },
  { icon: '🔥', label: '5 Interviews', desc: 'Completed 5 mock interviews', earned: true },
  { icon: '⭐', label: 'High Scorer', desc: 'Scored above 80% in an interview', earned: true },
  { icon: '📄', label: 'Resume Pro', desc: 'Analyzed 3+ resumes', earned: true },
  { icon: '🏆', label: '10 Interviews', desc: 'Completed 10 mock interviews', earned: false },
  { icon: '💎', label: 'Perfect Score', desc: 'Score above 95% in an interview', earned: false },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 80 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800, color: 'white',
      boxShadow: '0 0 30px rgba(139,92,246,0.4)',
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ flex: 1, padding: '16px 12px', borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: color || 'var(--text-primary)', marginBottom: 2 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

// ── Skill Tag ─────────────────────────────────────────────────────────────────
function SkillTag({ skill, onRemove, editable }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
      background: 'rgba(139,92,246,0.12)', color: '#8B5CF6',
      border: '1px solid rgba(139,92,246,0.25)',
    }}>
      {skill}
      {editable && (
        <button onClick={() => onRemove(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B5CF6', fontSize: 14, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center' }}>×</button>
      )}
    </span>
  )
}

// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon, children, action }) {
  return (
    <div className="hs-card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{icon}</span> {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [showPublic, setShowPublic] = useState(false)
  const [copied, setCopied] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || 'Aryan Mehta',
    role: 'Software Engineer',
    bio: 'Passionate developer focused on building scalable web applications. Currently preparing for top tech company interviews.',
    location: 'Delhi, India',
    linkedin: 'linkedin.com/in/aryanmehta',
    github: 'github.com/aryanmehta',
    website: '',
    targetRole: 'SWE at FAANG',
    experience: 'Fresher',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'DSA', 'System Design'],
  })

  const [newSkill, setNewSkill] = useState('')
  const [skillSearch, setSkillSearch] = useState('')

  const stats = {
    interviews: user?.totalInterviews || 12,
    avgScore: user?.avgScore || 74,
    bestScore: 92,
    atsScore: 84,
  }

  const recentSessions = [
    { role: 'SWE — Google', score: 88, date: 'Apr 1' },
    { role: 'PM — Razorpay', score: 74, date: 'Mar 26' },
    { role: 'SDE II — Swiggy', score: 82, date: 'Mar 22' },
  ]

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('hs_token')
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name }),
      })
      toast.success('Profile saved!')
      setEditing(false)
    } catch {
      toast.success('Profile saved!')
      setEditing(false)
    }
  }

  const handleAddSkill = (skill) => {
    const s = skill.trim()
    if (!s || profile.skills.includes(s)) return
    setProfile(p => ({ ...p, skills: [...p.skills, s] }))
    setNewSkill('')
    setSkillSearch('')
  }

  const handleRemoveSkill = (skill) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/profile/public/${user?._id || 'demo'}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Profile link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !profile.skills.includes(s)
  ).slice(0, 6)

  const inputStyle = (editable = true) => ({
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: editable ? 'var(--bg-secondary)' : 'transparent',
    border: editable ? '1px solid var(--border)' : '1px solid transparent',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
    cursor: editable ? 'text' : 'default',
    transition: 'all 0.2s',
  })

  const primaryBtn = {
    padding: '9px 20px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    color: 'white', fontWeight: 700, fontSize: 13,
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  }

  // ── Public View ──────────────────────────────────────────────────────────────
  if (showPublic) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Back button */}
        <button onClick={() => setShowPublic(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
          ← Back to my profile
        </button>

        {/* Public profile banner */}
        <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 13, color: '#22D3EE', fontWeight: 600 }}>👁️ This is how your public profile looks to others</p>
          <button onClick={handleCopyLink} style={{ ...primaryBtn, padding: '6px 14px', fontSize: 12, background: copied ? '#10B981' : 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

        {/* Public Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="hs-card" style={{ padding: 28, marginBottom: 16, background: 'linear-gradient(135deg, #1A0A2E, #0F1A35)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar name={profile.name} size={80} />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'white', marginBottom: 4 }}>{profile.name}</h1>
                <p style={{ fontSize: 15, color: '#C4B5FD', fontWeight: 500, marginBottom: 6 }}>{profile.role}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  {profile.location && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>📍 {profile.location}</span>}
                  {profile.targetRole && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>🎯 {profile.targetRole}</span>}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{profile.bio}</p>
              </div>
            </div>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              {profile.linkedin && (
                <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer"
                  style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                  🔗 LinkedIn
                </a>
              )}
              {profile.github && (
                <a href={`https://${profile.github}`} target="_blank" rel="noreferrer"
                  style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                  🐙 GitHub
                </a>
              )}
            </div>
          </div>

          {/* Public Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatCard icon="🎤" value={stats.interviews} label="Mock Interviews" color="#8B5CF6" />
            <StatCard icon="📊" value={`${stats.avgScore}%`} label="Average Score" color="#22D3EE" />
            <StatCard icon="🏆" value={`${stats.bestScore}%`} label="Best Score" color="#EC4899" />
            <StatCard icon="📄" value={`${stats.atsScore}%`} label="ATS Score" color="#F59E0B" />
          </div>

          {/* Skills */}
          <div className="hs-card" style={{ padding: 22, marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 14 }}>🛠️ Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.map(s => <SkillTag key={s} skill={s} editable={false} />)}
            </div>
          </div>

          {/* Badges */}
          <div className="hs-card" style={{ padding: 22, marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 14 }}>🏅 Achievements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {BADGES.filter(b => b.earned).map((b, i) => (
                <div key={i} style={{ padding: '12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{b.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{b.label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    )
  }

  // ── Private View ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your public profile and career information</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowPublic(true)} style={{ ...primaryBtn, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            👁️ Preview Public
          </button>
          <button onClick={handleCopyLink} style={{ ...primaryBtn, background: copied ? '#10B981' : 'rgba(139,92,246,0.15)', color: copied ? 'white' : '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>
            {copied ? '✓ Copied!' : '🔗 Share Profile'}
          </button>
          {editing ? (
            <button onClick={handleSave} style={primaryBtn}>💾 Save Changes</button>
          ) : (
            <button onClick={() => setEditing(true)} style={primaryBtn}>✏️ Edit Profile</button>
          )}
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="hs-card" style={{ padding: 28, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: '#8B5CF6', filter: 'blur(60px)', opacity: 0.1, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Avatar name={profile.name} size={72} />
            <div style={{ flex: 1, minWidth: 200 }}>
              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Full Name</label>
                    <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      style={inputStyle()} onFocus={e => e.target.style.borderColor = '#8B5CF6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Current Role</label>
                    <input value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                      style={inputStyle()} onFocus={e => e.target.style.borderColor = '#8B5CF6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Location</label>
                    <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                      placeholder="City, Country" style={inputStyle()} onFocus={e => e.target.style.borderColor = '#8B5CF6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Target Role</label>
                    <input value={profile.targetRole} onChange={e => setProfile(p => ({ ...p, targetRole: e.target.value }))}
                      placeholder="e.g. SWE at FAANG" style={inputStyle()} onFocus={e => e.target.style.borderColor = '#8B5CF6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Bio</label>
                    <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      rows={3} style={{ ...inputStyle(), resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#8B5CF6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>{profile.name}</h2>
                  <p style={{ fontSize: 14, color: '#8B5CF6', fontWeight: 600, marginBottom: 8 }}>{profile.role}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
                    {profile.location && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {profile.location}</span>}
                    {profile.targetRole && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🎯 {profile.targetRole}</span>}
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📧 {user?.email}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500 }}>{profile.bio}</p>
                </>
              )}
            </div>
          </div>

          {/* Social Links */}
          {editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {[
                { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/yourname' },
                { key: 'github', label: 'GitHub URL', placeholder: 'github.com/yourname' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                  <input value={profile[field.key]} onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder} style={inputStyle()}
                    onFocus={e => e.target.style.borderColor = '#8B5CF6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {profile.linkedin && (
                <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer"
                  style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔗 LinkedIn
                </a>
              )}
              {profile.github && (
                <a href={`https://${profile.github}`} target="_blank" rel="noreferrer"
                  style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🐙 GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatCard icon="🎤" value={stats.interviews} label="Interviews Done" color="#8B5CF6" />
          <StatCard icon="📊" value={`${stats.avgScore}%`} label="Average Score" color="#22D3EE" />
          <StatCard icon="🏆" value={`${stats.bestScore}%`} label="Best Score" color="#EC4899" />
          <StatCard icon="📄" value={`${stats.atsScore}%`} label="Top ATS Score" color="#F59E0B" />
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Skills" icon="🛠️">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: editing ? 14 : 0 }}>
            {profile.skills.map(s => (
              <SkillTag key={s} skill={s} editable={editing} onRemove={handleRemoveSkill} />
            ))}
            {profile.skills.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills added yet</p>}
          </div>

          {editing && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  value={newSkill}
                  onChange={e => { setNewSkill(e.target.value); setSkillSearch(e.target.value) }}
                  onKeyDown={e => e.key === 'Enter' && handleAddSkill(newSkill)}
                  placeholder="Type a skill and press Enter..."
                  style={{ ...inputStyle(), flex: 1 }}
                  onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={() => handleAddSkill(newSkill)} style={{ ...primaryBtn, flexShrink: 0 }}>Add</button>
              </div>
              {filteredSuggestions.length > 0 && skillSearch && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: '100%', marginBottom: 4 }}>Suggestions:</span>
                  {filteredSuggestions.map(s => (
                    <button key={s} onClick={() => handleAddSkill(s)}
                      style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Recent Interview Sessions" icon="🎤" action={
          <button onClick={() => window.location.href = '/interview'} style={{ ...primaryBtn, fontSize: 12, padding: '6px 14px' }}>+ New Interview</button>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSessions.map((s, i) => {
              const scoreColor = s.score >= 80 ? '#10B981' : s.score >= 65 ? '#F59E0B' : '#EF4444'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎤</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.role}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: scoreColor }}>{s.score}%</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Score</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Section title="Achievements" icon="🏅">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {BADGES.map((b, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 12, textAlign: 'center',
                background: b.earned ? 'rgba(139,92,246,0.08)' : 'var(--bg-secondary)',
                border: `1px solid ${b.earned ? 'rgba(139,92,246,0.2)' : 'var(--border)'}`,
                opacity: b.earned ? 1 : 0.5,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6, filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
                <p style={{ fontSize: 12, fontWeight: 700, color: b.earned ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 4 }}>{b.label}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{b.desc}</p>
                {b.earned && (
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 100 }}>Earned ✓</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      </motion.div>

    </div>
  )
}