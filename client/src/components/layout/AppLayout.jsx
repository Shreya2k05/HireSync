import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [isMinimized, setIsMinimized] = useState(false)
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Resume', path: '/resume', icon: '📄' },
    { label: 'Interview', path: '/interview', icon: '🎤' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ]

  const sidebarWidth = isMinimized ? 80 : 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          flexShrink: 0,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: isMinimized ? '20px 8px' : '20px 12px',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 40,
          overflow: 'hidden',
        }}
      >
        {/* Header: Logo and Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMinimized ? 'center' : 'space-between',
          flexDirection: isMinimized ? 'column' : 'row',
          gap: isMinimized ? 24 : 8,
          padding: isMinimized ? '8px 0' : '4px 12px',
          marginBottom: 28,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⚡</div>
            {!isMinimized && (
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--text-primary)', fontSize: 15, whiteSpace: 'nowrap' }}>
                HireSync <span style={{ color: '#8B5CF6' }}>AI</span>
              </span>
            )}
          </div>

          {/* Toggle Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 50,
              fontSize: 10,
              flexShrink: 0
            }}
            title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            {isMinimized ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }} title={isMinimized ? item.label : ''}>
              <div className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`} style={{ justifyContent: isMinimized ? 'center' : 'flex-start', padding: isMinimized ? '10px 0' : '10px 12px' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {!isMinimized && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={toggle} className="sidebar-item" style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', justifyContent: isMinimized ? 'center' : 'flex-start', padding: isMinimized ? '10px 0' : '10px 12px' }} title={isMinimized ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}>
            <span style={{ fontSize: 18 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {!isMinimized && <span style={{ whiteSpace: 'nowrap' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: isMinimized ? 0 : 10, padding: isMinimized ? '10px 0' : '10px 12px', justifyContent: isMinimized ? 'center' : 'flex-start', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', flexDirection: isMinimized ? 'column' : 'row' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!isMinimized && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
                <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>🚪</button>
              </>
            )}
            {isMinimized && (
              <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, marginTop: 8 }}>🚪</button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: sidebarWidth, padding: 32, maxWidth: '100%', transition: 'margin-left 0.3s ease' }}>
        {children}
      </main>
    </div>
  )
}
