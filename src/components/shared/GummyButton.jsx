// GummyButton — Juicy 3D candy-like buttons matching Wonder Phonics quality
import { motion } from 'framer-motion'

const variants = {
  yellow: {
    bg: 'linear-gradient(180deg, #FFE066 0%, #FBBF24 100%)',
    border: '#D4940A',
    shadow: '#B8820A',
    text: '#5B21B6',
    shine: 'rgba(255,255,255,0.5)',
  },
  purple: {
    bg: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
    border: '#5B21B6',
    shadow: '#4C1D95',
    text: '#FFFFFF',
    shine: 'rgba(255,255,255,0.3)',
  },
  green: {
    bg: 'linear-gradient(180deg, #86EFAC 0%, #22C55E 100%)',
    border: '#16A34A',
    shadow: '#15803D',
    text: '#FFFFFF',
    shine: 'rgba(255,255,255,0.4)',
  },
  orange: {
    bg: 'linear-gradient(180deg, #FDBA74 0%, #F97316 100%)',
    border: '#EA580C',
    shadow: '#C2410C',
    text: '#FFFFFF',
    shine: 'rgba(255,255,255,0.35)',
  },
  ghost: {
    bg: 'rgba(255,255,255,0.15)',
    border: 'rgba(255,255,255,0.3)',
    shadow: 'transparent',
    text: '#FFFFFF',
    shine: 'rgba(255,255,255,0.1)',
  },
}

export default function GummyButton({
  children,
  variant = 'yellow',
  size = 'md',
  circle = false,
  disabled = false,
  onClick,
  className = '',
  style = {},
}) {
  const v = variants[variant] || variants.yellow

  const sizes = {
    xs: { px: '2vmin', py: '1vmin', fontSize: '2vmin' },
    sm: { px: '3vmin', py: '1.5vmin', fontSize: '2.5vmin' },
    md: { px: '4vmin', py: '2vmin', fontSize: '3vmin' },
    lg: { px: '6vmin', py: '3vmin', fontSize: '4.5vmin' },
    xl: { px: '8vmin', py: '4vmin', fontSize: '6vmin' },
  }

  const s = sizes[size] || sizes.md

  const circleSize = {
    xs: '7vmin',
    sm: '9vmin',
    md: '12vmin',
    lg: '16vmin',
    xl: '20vmin',
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.06, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95, y: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1vmin',
        background: v.bg,
        border: `0.3vmin solid ${v.border}`,
        borderRadius: circle ? '50%' : 'var(--btn-radius)',
        boxShadow: `0 0.5vmin 0 ${v.shadow}, 0 1vmin 2vmin rgba(0,0,0,0.15)`,
        color: v.text,
        fontFamily: 'var(--font-display)',
        fontSize: s.fontSize,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        overflow: 'hidden',
        userSelect: 'none',
        ...(circle ? {
          width: circleSize[size],
          height: circleSize[size],
          padding: 0,
        } : {
          padding: `${s.py} ${s.px}`,
        }),
        ...style,
      }}
    >
      {/* Shine overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, ${v.shine} 0%, transparent 100%)`,
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.button>
  )
}
