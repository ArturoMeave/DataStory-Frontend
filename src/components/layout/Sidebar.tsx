import { BarChart2, LayoutDashboard, LineChart, History, Settings, User, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: LineChart, label: 'Analysis', path: '/analysis' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { resetData } = useDataStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    resetData()
    navigate('/auth')
  }

  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        background: '#0d0d16',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 30,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--color-accent-dim)',
              border: '1px solid var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BarChart2 size={14} color="var(--color-accent)" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            DATASTORY
          </span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em', paddingLeft: 36 }}>
          FINANCIAL INTELLIGENCE
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname.startsWith(path)

          return (
            <div
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                background: active ? 'var(--color-accent-dim)' : 'transparent',
                borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon
                size={16}
                color={active ? 'var(--color-accent)' : 'var(--color-text-muted)'}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-accent-dim)',
              border: '1px solid var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={13} color="var(--color-accent)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Usuario'}
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            width: '100%',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={15} color="var(--color-danger)" />
          <span style={{ fontSize: 13, color: 'var(--color-danger)' }}>Logout</span>
        </button>
      </div>
    </aside>
  )
}