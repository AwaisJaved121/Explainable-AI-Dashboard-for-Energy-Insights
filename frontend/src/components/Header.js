import React from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_STYLE = {
  manager: {
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
    color: '#a78bfa',
    label: 'Manager',
  },
  engineer: {
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.25)',
    color: '#22d3ee',
    label: 'Engineer',
  },
};

const Header = ({ user, pageTitle = 'Energy XAI Dashboard' }) => {
  const { logout } = useAuth();
  const roleStyle = ROLE_STYLE[user?.role] || ROLE_STYLE.engineer;

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#06b6d4'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold" style={{ letterSpacing: '-0.01em' }}>{pageTitle}</h1>
          <p className="text-xs" style={{ color: '#64748b' }}>Energy XAI Dashboard</p>
        </div>
      </div>

      {/* Right: status + role + user menu */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {user && (
          <div style={{
            padding: '4px 12px', borderRadius: 20,
            background: roleStyle.bg,
            border: `1px solid ${roleStyle.border}`,
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: roleStyle.color,
          }}>
            {roleStyle.label}
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
