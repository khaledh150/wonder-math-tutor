// PipCat — Professional Branded Mascot (Monkey Stories Style)
import React from 'react'
import { motion } from 'framer-motion'

export default function PipCat({ size = 180, mood = 'happy', waving = false, speaking = false, thinking = false }) {
  const colors = {
    body: '#8B5CF6',
    belly: '#C4B5FD',
    accent: '#5B21B6',
    face: '#FFFFFF'
  }

  // Animation variants
  const breathingVariants = {
    idle: {
      scaleY: [1, 1.05, 1],
      y: [0, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    }
  }

  const earVariants = {
    idle: { 
      rotate: [0, 5, -5, 0], 
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } 
    }
  }

  const pupilVariants = {
    idle: {
      scaleY: [1, 0.1, 1],
      transition: { duration: 4, times: [0, 0.05, 0.1], repeat: Infinity, repeatDelay: 3 }
    }
  }

  return (
    <motion.div 
      style={{ width: size, height: size, position: 'relative' }}
      variants={breathingVariants}
      animate="idle"
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <defs>
          <filter id="pip-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>
        
        {/* Ears */}
        <motion.path 
          d="M25 35 L10 10 L40 25 Z" 
          fill={colors.body} 
          variants={earVariants} animate="idle"
        />
        <motion.path 
          d="M75 35 L90 10 L60 25 Z" 
          fill={colors.body} 
          variants={earVariants} animate="idle"
        />
        
        {/* Feet */}
        <circle cx="35" cy="88" r="8" fill={colors.accent} />
        <circle cx="65" cy="88" r="8" fill={colors.accent} />
        
        {/* Body */}
        <ellipse cx="50" cy="55" rx="35" ry="38" fill={colors.body} filter="url(#pip-shadow)" />
        <ellipse cx="50" cy="65" rx="22" ry="25" fill={colors.belly} opacity="0.4" />
        
        {/* Tail */}
        <motion.path
          d="M85 60 Q95 50 90 40"
          stroke={colors.accent} strokeWidth="6" strokeLinecap="round" fill="none"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Arms */}
        <motion.path 
          d="M15 55 Q5 45 10 35" 
          stroke={colors.body} strokeWidth="10" strokeLinecap="round" fill="none"
          animate={waving ? { rotate: [0, -30, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <motion.path 
          d="M85 55 Q95 45 90 35" 
          stroke={colors.body} strokeWidth="10" strokeLinecap="round" fill="none"
        />

        {/* Face */}
        <ellipse cx="50" cy="45" rx="25" ry="20" fill={colors.face} opacity="0.9" />
        
        {/* Eyes */}
        <motion.circle cx="40" cy="42" r="5" fill="#334155" variants={pupilVariants} />
        <motion.circle cx="60" cy="42" r="5" fill="#334155" variants={pupilVariants} />
        
        {/* Mouth/Muzzle */}
        <circle cx="46" cy="52" r="4" fill="#FDE68A" />
        <circle cx="54" cy="52" r="4" fill="#FDE68A" />
        <path d="M48 56 Q50 60 52 56" stroke="#5B21B6" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Mood Indicators */}
        {mood === 'excited' && (
          <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
            <path d="M35 30 Q40 25 45 30" stroke="#FBBF24" strokeWidth="2" fill="none" />
            <path d="M55 30 Q60 25 65 30" stroke="#FBBF24" strokeWidth="2" fill="none" />
          </motion.g>
        )}
        {mood === 'sad' && (
            <g>
                <path d="M38 38 L42 42 M58 42 L62 38" stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M44 58 Q50 54 56 58" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
        )}
      </svg>
    </motion.div>
  )
}
