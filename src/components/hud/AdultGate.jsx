// AdultGate.jsx — Security layer for protected dashboard access (V11.23.0)
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'
import { playTapSfx, playMagicSfx } from '../../utils/sfx'

export default function AdultGate({ onUnlock, onClose }) {
  const { language } = useLanguageStore()
  const t = i18n[language]
  const [holding, setHolding] = useState(false)
  const timerRef = useRef(null)
  
  const handleStart = () => {
    setHolding(true)
    playTapSfx()
    timerRef.current = setTimeout(() => {
      playMagicSfx()
      onUnlock()
    }, 3000)
  }

  const handleEnd = () => {
    setHolding(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', 
        backdropFilter: 'blur(12px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4vmin'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
        className="glass-panel-v2" 
        style={{ 
            padding: '8vmin', textAlign: 'center', background: 'white', 
            maxWidth: '90vmin', borderRadius: '5vmin', boxShadow: '0 4vmin 8vmin rgba(0,0,0,0.5)' 
        }}
      >
        <h2 className="text-hero" style={{ fontSize: '5.5vmin', color: 'var(--wk-purple-dark)', marginBottom: '3vmin' }}>
            {t.ADULT_GATE_TITLE}
        </h2>
        <p style={{ color: '#64748b', fontSize: '2.2vmin', marginBottom: '8vmin', fontWeight: 700, letterSpacing: '0.05em' }}>
            {t.HOLD_TO_UNLOCK}
        </p>
        
        <div style={{ position: 'relative', width: '28vmin', height: '28vmin', margin: '0 auto 8vmin' }}>
            {/* SVG Progress Circle Background */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="var(--wk-purple)" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={holding ? { strokeDashoffset: 0 } : { strokeDashoffset: 283 }}
                    transition={{ duration: 3, ease: "linear" }}
                />
            </svg>
            
            {/* Interactive Lock Area */}
            <motion.div 
                onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                onTouchStart={handleStart} onTouchEnd={handleEnd}
                whileTap={{ scale: 0.88 }}
                style={{ 
                    position: 'absolute', inset: '12%', background: '#fafafa', 
                    borderRadius: '50%', cursor: 'pointer', display: 'flex', 
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: holding ? 'inset 0 1vmin 2vmin rgba(0,0,0,0.1)' : '0 1.5vmin 4vmin rgba(139,92,246,0.25)', 
                    border: '0.4vmin solid white', userSelect: 'none'
                }}
            >
                <div style={{ fontSize: '10vmin', filter: holding ? 'grayscale(0)' : 'grayscale(1)', transition: 'all 0.3s' }}>
                    {holding ? '🔓' : '🔒'}
                </div>
            </motion.div>
        </div>

        <button 
           onClick={onClose} 
           style={{ 
               background: 'var(--wk-purple-soft)', color: 'var(--wk-purple-dark)', 
               border: 'none', padding: '1.5vmin 4vmin', borderRadius: '2vmin',
               fontWeight: 900, cursor: 'pointer', fontSize: '2.5vmin' 
           }}
        >
            {t.CLOSE}
        </button>
      </motion.div>
    </motion.div>
  )
}
