// GlassPanel — Glassmorphism container for UI panels
import React from 'react'

export default function GlassPanel({
  children,
  variant = 'panel', // 'panel' | 'pill' | 'card'
  className = '',
  style = {},
  onClick,
}) {
  const base = {
    background: 'var(--glass-bg)',
    backdropFilter: `blur(var(--glass-blur))`,
    WebkitBackdropFilter: `blur(var(--glass-blur))`,
    border: `1px solid var(--glass-border)`,
  }

  const shapes = {
    panel: { borderRadius: 'var(--panel-radius)', padding: 'var(--panel-padding)' },
    pill: { borderRadius: '999px', padding: 'clamp(6px, 1vw, 10px) clamp(14px, 2.5vw, 24px)' },
    card: { borderRadius: 'var(--panel-radius)', padding: 'clamp(16px, 3vw, 28px)' },
  }

  return (
    <div
      className={className}
      onClick={onClick}
      style={{ ...base, ...shapes[variant], ...style }}
    >
      {children}
    </div>
  )
}
