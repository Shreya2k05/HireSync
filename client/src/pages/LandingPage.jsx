import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const features = [
  {
    icon: '📄',
    tag: 'Resume Screener',
    title: 'Smart ATS Analysis',
    desc: 'Upload your resume and paste a job description. Get an instant compatibility score, matched skills, missing keywords, and actionable suggestions.',
    color: '#8B5CF6',
  },
  {
    icon: '🎤',
    tag: 'Mock Interview',
    title: 'AI Mock Interviews',
    desc: 'Practice with questions tailored to YOUR resume and the specific job. The AI adapts based on your profile — just like a real interviewer.',
    color: '#22D3EE',
  },
  {
    icon: '🧠',
    tag: 'AI Feedback',
    title: 'Deep Answer Feedback',
    desc: 'Every answer is scored on clarity, relevance, and depth. Get specific suggestions on exactly how to improve each response.',
    color: '#EC4899',
  },
  {
    icon: '📊',
    tag: 'Analytics',
    title: 'Progress Tracking',
    desc: 'Track improvement across sessions. See your confidence score rise, identify weak areas, and know exactly when you are ready.',
    color: '#F59E0B',
  },
]

const steps = [
  { num: '01', icon: '📄', title: 'Upload Resume + JD', desc: 'Drop your resume and paste the job description. HireSync AI reads both and understands the gap between where you are and where you need to be.' },
  { num: '02', icon: '📊', title: 'Get Your Fit Score', desc: 'Receive a detailed ATS compatibility report — skills match, experience alignment, keyword gaps, and a prioritized fix list.' },
  { num: '03', icon: '🎤', title: 'Practice the Interview', desc: 'Jump into a mock interview with questions tailored to your exact profile. Answer and get scored in real time by Gemini AI.' },
  { num: '04', icon: '✨', title: 'Review & Improve', desc: 'See your full session report. Track improvement over multiple sessions. Walk into the real interview with total confidence.' },
]

const testimonials = [
  { name: 'Priya S.', role: 'SWE @ Google', text: 'The mock interview felt scarily real. The questions were exactly what I got asked in my actual interview.', avatar: 'PS' },
  { name: 'Rahul M.', role: 'PM @ Razorpay', text: 'The resume gap analysis was eye-opening. I fixed 3 things and got callbacks from 2 companies the next week.', avatar: 'RM' },
  { name: 'Ananya K.', role: 'MBA Grad, IIM-B', text: 'I did 12 mock sessions before my McKinsey interview. HireSync AI is the reason I cleared the first round.', avatar: 'AK' },
]

const stats = [
  { value: '94%', label: 'Interview success rate' },
  { value: '3.2×', label: 'More callbacks after fix' },
  { value: '50K+', label: 'Mock sessions done' },
  { value: '2 min', label: 'To your first analysis' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

export default function LandingPage() {
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 6%', height: 64,
    background: scrolled
      ? theme === 'dark' ? 'rgba(11,16,32,0.9)' : 'rgba(248,249,255,0.9)'
      : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border)' : 'none',
    transition: 'all 0.3s ease',
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={navStyle}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>
            HireSync <span style={{ color: '#8B5CF6' }}>AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['Features', 'How it Works', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >{item}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggle} style={{ padding: '7px 10px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 15 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="hs-btn-ghost" style={{ fontSize: 14, padding: '7px 16px' }}>Log in</button>
          </Link>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <button className="hs-btn-primary" style={{ fontSize: 14, padding: '7px 18px' }}>Get Started Free</button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 6% 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          {/* Badge */}
          <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ fontSize: 12 }}>✨</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Powered by Gemini AI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.1)} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
            Smarter Interviews.<br />
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Better Careers.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}>
            Upload your resume, get an instant AI fit score against any job, then practice with a mock interview tailored to your exact profile. Turn preparation into confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <button className="hs-btn-primary" style={{ padding: '13px 32px', fontSize: 16 }}>
                Start for Free →
              </button>
            </Link>
            <a href="#how-it-works" style={{ textDecoration: 'none' }}>
              <button className="hs-btn-secondary" style={{ padding: '13px 32px', fontSize: 16 }}>
                See How It Works
              </button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div {...fadeUp(0.4)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['PS', 'RM', 'AK', 'VN', 'SK'].map((initials, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, hsl(${i * 50 + 200},70%,55%), hsl(${i * 50 + 240},70%,45%))`,
                  border: '2px solid var(--bg-primary)',
                  marginLeft: i > 0 ? -10 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'white',
                }}>{initials}</div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#F59E0B', fontSize: 13 }}>★★★★★</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loved by 50,000+ job seekers</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '0 6% 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.05)}
              style={{ background: 'var(--bg-card)', padding: '28px 24px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: '#8B5CF6', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 6%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <motion.p {...fadeUp(0)} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: 12 }}>Everything you need</motion.p>
            <motion.h2 {...fadeUp(0.1)} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: 14 }}>
              From Resume to Offer Letter
            </motion.h2>
            <motion.p {...fadeUp(0.2)} style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Two powerful tools, one seamless workflow — everything you need to prepare with precision.
            </motion.p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="hs-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: f.color, marginBottom: 8 }}>{f.tag}</p>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '80px 6%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <motion.p {...fadeUp(0)} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: 12 }}>The process</motion.p>
            <motion.h2 {...fadeUp(0.1)} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-primary)' }}>
              Ready in 4 Steps
            </motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {steps.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="hs-card" style={{ padding: 28, position: 'relative' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: 'var(--border)', position: 'absolute', top: 12, right: 20, lineHeight: 1, userSelect: 'none' }}>{s.num}</p>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ padding: '80px 6%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.p {...fadeUp(0)} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: 12 }}>Real results</motion.p>
            <motion.h2 {...fadeUp(0.1)} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-primary)' }}>
              People Who Got Hired
            </motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="hs-card" style={{ padding: 28 }}>
                <div style={{ color: '#F59E0B', fontSize: 14, marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 6% 100px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp(0)} style={{ borderRadius: 28, padding: '60px 40px', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 24px', boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>
                ⚡
              </motion.div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--text-primary)', marginBottom: 14 }}>
                Your Next Offer Starts Here
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
                Join thousands of job seekers who used HireSync AI to walk into interviews fully prepared — and walk out with offers.
              </p>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button className="hs-btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
                  Get Started Free →
                </button>
              </Link>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>No credit card required · Free tier always available</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 6%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>HireSync AI</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2026 HireSync AI. Built for job seekers.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(item => (
            <a key={item} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{item}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}