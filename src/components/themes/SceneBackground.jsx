// SceneBackground — Professional Layered Parallax Environment
import React, { memo } from 'react'
import { motion } from 'framer-motion'

function Sun() {
  return (
    <motion.div
      style={{ position: 'absolute', top: '8%', left: '12%', zIndex: 1 }}
      animate={{ scale: [1, 1.05, 1], rotate: 360 }}
      transition={{ 
        scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 60, repeat: Infinity, ease: 'linear' }
      }}
    >
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9E5" />
            <stop offset="60%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <filter id="sun-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Rays */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.rect
            key={i}
            x="58" y="0" width="4" height="24" rx="2"
            fill="#FFD93D"
            style={{ originX: '60px', originY: '60px', rotate: i * 30 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
        <circle cx="60" cy="60" r="30" fill="url(#sun-grad)" filter="url(#sun-glow)" />
      </svg>
    </motion.div>
  )
}

function Cloud({ top, left, delay, speed, scale = 1, opacity = 0.8 }) {
  return (
    <motion.div
      style={{ position: 'absolute', top: `${top}%`, left, zIndex: 2, opacity, scale }}
      animate={{ x: ['-20vw', '120vw'] }}
      transition={{ duration: speed, repeat: Infinity, delay, ease: 'linear' }}
    >
      <svg width="200" height="100" viewBox="0 0 200 100">
        <path d="M40 80 Q10 80 10 55 Q10 30 35 30 Q40 10 70 10 Q100 10 110 30 Q140 25 160 45 Q190 45 190 70 Q190 85 170 85 H40" 
          fill="white" stroke="#E0F2FE" strokeWidth="2" />
        <ellipse cx="60" cy="40" rx="20" ry="15" fill="white" opacity="0.3" />
      </svg>
    </motion.div>
  )
}

function FarHills({ color }) {
  return (
    <div style={{ position: 'absolute', bottom: '15%', left: 0, right: 0, height: '40%', zIndex: 3, opacity: 0.6 }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0 200 Q200 100 400 200 Q600 300 800 150 Q1000 50 1200 220 Q1440 350 1440 320 V320 H0 Z" fill={color} />
      </svg>
    </div>
  )
}

const SCENES = {
  candy: {
    sky: 'linear-gradient(180deg, #BAE6FD 0%, #F0F9FF 100%)',
    ground: '#22C55E',
    farHill: '#86EFAC',
    items: ['🍭', '🍬']
  },
  classroom: {
    sky: 'linear-gradient(180deg, #7DD3FC 0%, #E0F2FE 100%)',
    ground: '#15803D',
    farHill: '#4ADE80',
    items: ['✏️', '📚']
  },
  bakery: {
    sky: 'linear-gradient(180deg, #FBCFE8 0%, #FFF1F2 100%)',
    ground: '#F97316',
    farHill: '#FDBA74',
    items: ['🧁', '🍪']
  },
  beach: {
    sky: 'linear-gradient(180deg, #0EA5E9 0%, #BAE6FD 100%)',
    ground: '#FBBF24',
    farHill: '#FDE68A',
    items: ['🐚', '🏖️']
  },
  garden: {
    sky: 'linear-gradient(180deg, #C4B5FD 0%, #EDE9FE 100%)',
    ground: '#10B981',
    farHill: '#6EE7B7',
    items: ['🍎', '🥭']
  }
}

const SceneBackground = memo(function SceneBackground({ themeId = 'candy' }) {
  const s = SCENES[themeId] || SCENES.candy

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, background: s.sky }}>
      <Sun />
      
      {/* Parallax Clouds */}
      <Cloud top={10} left="-10%" speed={50} delay={0} scale={1.2} opacity={0.6} />
      <Cloud top={25} left="20%" speed={40} delay={10} scale={0.8} opacity={0.4} />
      <Cloud top={15} left="60%" speed={60} delay={5} scale={1} opacity={0.5} />

      {/* Far Landscape */}
      <FarHills color={s.farHill} />

      {/* Ground Layer */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: -100, 
        right: -100, 
        height: '25%', 
        zIndex: 10,
        background: `radial-gradient(ellipse at 50% 0%, ${s.ground} 0%, ${s.ground} 100%)`,
        borderRadius: '50% 50% 0 0'
      }}>
        {/* Grass Blades */}
        <div style={{ position: 'absolute', top: -20, left: 0, right: 0, height: 40, display: 'flex', justifyContent: 'space-around', overflow: 'hidden' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              style={{ width: 4, height: 30, background: s.ground, borderRadius: 2 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

export default SceneBackground
