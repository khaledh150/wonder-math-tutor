import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Lock, CheckCircle2, Settings, BarChart2 } from 'lucide-react'
import PipCat from './characters/PipCat'
import useLanguageStore from '../store/useLanguageStore'
import useLevelStore from '../store/useLevelStore'
import { i18n } from '../utils/i18n'
import { SkyFullBackground } from '../theme/SkyBackground'
import { questions } from '../data/loader'
import { THEMES } from '../theme/ThemeRegistry'
import { playTapSfx } from '../utils/sfx'
import AdultGate from './hud/AdultGate'
import ParentDashboard from './hud/ParentDashboard'

export default function WorldMap({ onSelectLevel, completedLevels = {}, currentLevel = 1 }) {
  const { language } = useLanguageStore()
  const { getTotalStars, allUnlocked } = useLevelStore()
  const totalStars = getTotalStars()
  const t = i18n[language]
  const scrollRef = useRef(null)
  const currentLevelRef = useRef(null)

  const [showAdultGate, setShowAdultGate] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (currentLevelRef.current) {
      setTimeout(() => {
        currentLevelRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        })
      }, 500)
    }
  }, [currentLevel])

  return (
    <div 
      ref={scrollRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'transparent',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <SkyFullBackground />
      
      {/* 1. Header Studio HUD */}
      <div style={{ position: 'fixed', top: '4vmin', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000 }}>
        <motion.div 
          initial={{ y: -100 }} animate={{ y: 0 }}
          className="glass-panel-v2"
          style={{ padding: '1vmin 6vmin', background: 'rgba(255,255,255,0.9)', borderRadius: '99vmin', boxShadow: '0 2vmin 6vmin rgba(30,64,175,0.1)' }}
        >
          <h1 className="text-hero" style={{ fontSize: '3.5vmin', color: '#1e40af', WebkitTextStroke: '0px', letterSpacing: '0.2em' }}>
            {t.WORLD_MAP}
          </h1>
        </motion.div>
      </div>

      {/* 2. The Winding Path Layout (Dynamic Height for 130+ levels) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column-reverse', 
        alignItems: 'center', 
        padding: '20vh 0',
        minHeight: `${questions.length * 20}vh`, // Scalable height
        position: 'relative',
        zIndex: 10
      }}>
        
        <svg 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', opacity: 0.8 }}
          viewBox={`0 0 100 ${questions.length * 150 + 500}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
            </linearGradient>
            <filter id="glass-blur">
              <feGaussianBlur stdDeviation="0.1" />
            </filter>
          </defs>
          
          {/* 1. Frosted Glass Path Border */}
          <path 
            d={(() => {
              let d = '';
              const svgH = questions.length * 150 + 500;
              const baseY = svgH - 150;
              for (let i = 0; i < questions.length; i++) {
                const x = 50 + (Math.sin(i * 1.2) * 20);
                const y = baseY - (i * 150); 
                if (i === 0) d = `M ${x} ${y}`;
                else {
                  const prevX = 50 + (Math.sin((i-1) * 1.2) * 20);
                  const prevY = baseY - ((i-1) * 150);
                  const cpY = (y + prevY) / 2;
                  d += ` C ${prevX} ${cpY}, ${x} ${cpY}, ${x} ${y}`;
                }
              }
              return d;
            })()}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* 2. Main Glass Surface */}
          <path 
            d={(() => {
              let d = '';
              const svgH = questions.length * 150 + 500;
              const baseY = svgH - 150;
              for (let i = 0; i < questions.length; i++) {
                const x = 50 + (Math.sin(i * 1.2) * 20);
                const y = baseY - (i * 150); 
                if (i === 0) d = `M ${x} ${y}`;
                else {
                  const prevX = 50 + (Math.sin((i-1) * 1.2) * 20);
                  const prevY = baseY - ((i-1) * 150);
                  const cpY = (y + prevY) / 2;
                  d += ` C ${prevX} ${cpY}, ${x} ${cpY}, ${x} ${y}`;
                }
              }
              return d;
            })()}
            fill="none"
            stroke="url(#glass-grad)"
            strokeWidth="8.5"
            strokeLinecap="round"
            filter="url(#glass-blur)"
          />

          {/* 3. Soft Center Shine */}
          <path 
            d={(() => {
              let d = '';
              const svgH = questions.length * 150 + 500;
              const baseY = svgH - 150;
              for (let i = 0; i < questions.length; i++) {
                const x = 50 + (Math.sin(i * 1.2) * 20);
                const y = baseY - (i * 150); 
                if (i === 0) d = `M ${x} ${y}`;
                else {
                  const prevX = 50 + (Math.sin((i-1) * 1.2) * 20);
                  const prevY = baseY - ((i-1) * 150);
                  const cpY = (y + prevY) / 2;
                  d += ` C ${prevX} ${cpY}, ${x} ${cpY}, ${x} ${y}`;
                }
              }
              return d;
            })()}
            fill="none"
            stroke="#fff"
            strokeWidth="0.2"
            strokeDasharray="1 3"
            strokeLinecap="round"
            style={{ opacity: 0.6 }}
          />
        </svg>

        {questions.map((q, idx) => {
          const levelId = idx + 1
          const isCompleted = !!completedLevels[levelId]
          const isCurrent = levelId === currentLevel
          const isLocked = allUnlocked ? false : (levelId > currentLevel && !isCompleted)
          
          // Get theme colors
          const themeId = q.theme?.id || 'candy'
          const themeData = THEMES[themeId] || THEMES.candy
          const primaryColor = isLocked ? '#cbd5e1' : themeData.colors.primary
          const shadowColor = isLocked ? '#94a3b8' : themeData.colors.secondary
 
          // Calculate staggered horizontal position
          const xOffset = Math.sin(idx * 1.2) * 20 // Percentage offset
 
          return (
            <div 
              key={levelId}
              ref={isCurrent ? currentLevelRef : null}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '18vh',
                position: 'relative',
                zIndex: 10 // Explicitly above the road
              }}
            >
              <motion.div
                style={{ marginLeft: `${xOffset}%`, position: 'relative', zIndex: 10 }}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                {/* Level Label (Localized) */}
                <div style={{ position: 'absolute', top: '-13vmin', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                   <span style={{ fontSize: '1.2vmin', fontWeight: 900, color: 'rgba(30,64,175,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{t.MISSION} {levelId}</span>
                </div>

                {/* Player Mascot Avatar atop current node */}
                {isCurrent && (
                  <motion.div
                    layoutId="pip-avatar"
                    style={{ position: 'absolute', top: '-9vmin', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}
                  >
                    <div className="animate-float">
                      <PipCat size="13vmin" mood="happy" waving />
                    </div>
                  </motion.div>
                )}

                {/* Level Node Button */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (!isLocked) {
                        playTapSfx()
                        onSelectLevel(idx)
                      }
                    }}
                    disabled={isLocked}
                    className="gummy-btn"
                    style={{
                      width: '15vmin',
                      height: '15vmin',
                      borderRadius: '99vmin',
                      backgroundColor: primaryColor,
                      border: '0.4vmin solid white',
                      boxShadow: isLocked ? 'none' : `0 0.8vmin 0 ${shadowColor}, 0 2vmin 4vmin rgba(0,0,0,0.1)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isLocked ? 'default' : 'pointer',
                      position: 'relative',
                      filter: isLocked ? 'grayscale(1)' : 'none',
                      opacity: isLocked ? 0.8 : 1
                    }}
                  >
                    {isLocked ? (
                      <Lock size="5vmin" color="white" opacity={0.6} />
                    ) : (
                      <span className="text-hero" style={{ fontSize: '6vmin', color: 'white' }}>
                        {levelId}
                      </span>
                    )}

                    {/* Completion Badge (Quick check) */}
                    {isCompleted && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{
                          position: 'absolute', top: '-0.5vmin', right: '-0.5vmin',
                          background: '#22c55e', borderRadius: '50%', padding: '0.5vmin',
                          color: 'white', border: '0.3vmin solid white', boxShadow: '0 0.4vmin 0.8vmin rgba(0,0,0,0.2)',
                          zIndex: 2
                        }}
                      >
                        <CheckCircle2 size="3vmin" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>

                  {/* Dynamic Stars (New Requirement) */}
                  <div style={{ display: 'flex', gap: '0.6vmin', marginTop: '1.2vmin', backgroundColor: 'rgba(255,255,255,0.8)', padding: '0.5vmin 1.5vmin', borderRadius: '99vmin', border: '0.2vmin solid rgba(0,0,0,0.05)' }}>
                    {[1, 2, 3].map(pos => {
                      const earnedCount = completedLevels[levelId] || 0
                      const isEarned = pos <= earnedCount
                      return (
                        <Star 
                          key={pos} 
                          size="2.8vmin" 
                          fill={isEarned ? '#fbbf24' : '#e2e8f0'} 
                          stroke={isEarned ? '#fbbf24' : '#94a3b8'}
                          strokeWidth={isEarned ? 0 : 2}
                          style={{ filter: isEarned ? 'drop-shadow(0 0.2vmin 0.5vmin rgba(251,191,36,0.3))' : 'none' }}
                        />
                      )
                    })}
                  </div>

                  {/* Shadow */}
                  <div style={{
                    width: '12vmin', height: '2vmin', background: 'rgba(0,0,0,0.05)',
                    borderRadius: '50%', marginTop: '0.8vmin', filter: 'blur(3px)',
                    pointerEvents: 'none'
                  }} />
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* 3. Global HUD UI (Left Side: Stats) */}
      <div style={{ position: 'fixed', top: '3vmin', left: '3vmin', zIndex: 1000, pointerEvents: 'none' }}>
        <motion.div 
          initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="glass-panel-v2" style={{ padding: '1vmin 4vmin', display: 'flex', alignItems: 'center', gap: '1.5vmin', borderRadius: '99vmin', background: 'rgba(255,255,255,0.95)', border: '0.4vmin solid #ddd' }}>
            <Star color="#fbbf24" fill="#fbbf24" size="5vmin" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.2vmin', opacity: 0.6, textTransform: 'uppercase', fontWeight: 900, color: 'var(--wk-purple-dark)' }}>{t.MASTERY}</span>
              <span className="text-hero" style={{ fontSize: '4vmin', lineHeight: 1, color: 'var(--wk-purple-dark)', WebkitTextStroke: '0px' }}>{totalStars}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Global HUD UI (Right Side: Settings & Dashboard) */}
      <div style={{ 
          position: 'fixed', top: '3vmin', right: '3vmin', zIndex: 1001,
          display: 'flex', flexDirection: 'column', gap: '2.5vmin'
      }}>
        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => { playTapSfx(); window.dispatchEvent(new CustomEvent('open-settings')); }}
          style={{
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '10vmin',
            height: '10vmin',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0.8vmin 0 #cbd5e1, 0 1.5vmin 3vmin rgba(0,0,0,0.1)',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <Settings size="6vmin" />
        </motion.button>

        {/* Dashboard Access Button (Protected by Adult Gate) */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playTapSfx(); setShowAdultGate(true); }}
          style={{
            background: 'var(--wk-purple-soft)',
            border: 'none',
            borderRadius: '50%',
            width: '10vmin',
            height: '10vmin',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0.8vmin 0 var(--wk-purple), 0 1.5vmin 3vmin rgba(139,92,246,0.15)',
            cursor: 'pointer',
            color: 'var(--wk-purple-dark)'
          }}
        >
          <BarChart2 size="5.5vmin" />
        </motion.button>
      </div>

      {/* Adult Gate and Dashboard Modals */}
      <AnimatePresence>
         {showAdultGate && (
            <AdultGate 
               onClose={() => setShowAdultGate(false)} 
               onUnlock={() => { setShowAdultGate(false); setShowDashboard(true); }} 
            />
         )}
         {showDashboard && (
            <ParentDashboard onClose={() => setShowDashboard(false)} />
         )}
      </AnimatePresence>
    </div>
  )
}
