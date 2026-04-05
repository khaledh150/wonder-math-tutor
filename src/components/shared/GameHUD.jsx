import React from 'react'
import { motion } from 'framer-motion'
import { Home, Star, Settings } from 'lucide-react'
import GummyButton from './GummyButton'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'

import useLevelStore from '../../store/useLevelStore'

export default function GameHUD({ level, progress = 0, onQuit }) {
  const { language } = useLanguageStore()
  const { getTotalStars } = useLevelStore()
  const totalStars = getTotalStars()
  const t = i18n[language]

  // Ensure progress is always a valid number
  const safeProgress = isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress))

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, padding: '3vmin 5vmin' }}>
      {/* 1. TOP BAR: Back and Level Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <motion.div
          initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          style={{ display: 'flex', gap: '1.5vmin', pointerEvents: 'auto' }}
        >
          <GummyButton variant="pink" size="xs" onClick={onQuit} circle iconOnly>
            <Home size="3.5vmin" />
          </GummyButton>
          <div className="glass-panel-v2" style={{ padding: '1vmin 4vmin', display: 'flex', flexDirection: 'column', minWidth: '22vmin', background: 'rgba(255,255,255,0.92)', border: '0.4vmin solid rgba(139,92,246,0.2)', boxShadow: '0 1vmin 2vmin rgba(139,92,246,0.15)' }}>
            <span style={{ fontSize: '1.2vmin', opacity: 0.8, textTransform: 'uppercase', fontWeight: 900, color: 'var(--wk-purple-dark)', letterSpacing: '0.1em' }}>Wonder Math</span>
            <span className="text-hero" style={{ fontSize: '3.2vmin', lineHeight: 1, color: 'var(--wk-purple-dark)', WebkitTextStroke: '0px' }}>{t.MISSION} {level}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          style={{ display: 'flex', gap: '1.5vmin', pointerEvents: 'auto' }}
        >
          <div className="glass-panel-v2" style={{ padding: '1vmin 4vmin', display: 'flex', alignItems: 'center', gap: '1.5vmin', background: 'rgba(255,255,255,1)', border: '0.4vmin solid #ddd', boxShadow: '0 1vmin 2vmin rgba(0,0,0,0.1)' }}>
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Star color="#FBBF24" fill="#FBBF24" size="4.2vmin" />
            </motion.div>
            <span className="text-hero" style={{ fontSize: '3.2vmin', color: 'var(--wk-purple-dark)', WebkitTextStroke: '0px' }}>{totalStars}</span>
          </div>
          {/* Settings Trigger is passed via App.jsx usually, for now we assume it opens a local state if needed or we use global action */}
          <GummyButton variant="blue" size="xs" circle iconOnly onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}>
            <Settings size="3.5vmin" />
          </GummyButton>
        </motion.div>
      </div>

      {/* 2. BOTTOM BAR: Premium Liquid Progress */}
      <div style={{ position: 'absolute', bottom: '2.5vmin', left: '50%', transform: 'translateX(-50%)', width: '60vmin', pointerEvents: 'auto' }}>
        <div style={{ position: 'relative' }}>
          {/* Track Outer Label (Optional context) */}
          <div style={{ position: 'absolute', top: '-2.5vmin', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 1vmin' }}>
            <span style={{ fontSize: '1vmin', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Mission Progress</span>
            <span style={{ fontSize: '1vmin', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{Math.round(safeProgress)}%</span>
          </div>

          <div className="glass-panel-v2" style={{
            height: '3.8vmin', padding: '0.5vmin', borderRadius: '99vmin',
            background: 'rgba(255,255,255,0.9)', border: '0.5vmin solid white',
            boxShadow: '0 1.2vmin 3vmin rgba(0,0,0,0.2), inset 0 0.5vmin 1vmin rgba(255,255,255,0.5)'
          }}>
            {/* Progress Channel (The hollow part) */}
            <div style={{ position: 'relative', width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: 'inherit', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${safeProgress}%` }}
                transition={{ type: 'spring', stiffness: 40, damping: 10 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
                  borderRadius: 'inherit',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1vmin 1vmin rgba(255,255,255,0.3)'
                }}
              >
                {/* Visual Highlight Shine */}
                <div style={{ position: 'absolute', top: '0.4vmin', left: '1.5vmin', height: '1vmin', width: '85%', background: 'rgba(255,255,255,0.4)', borderRadius: '99px' }} />

                {/* Moving Wave Effect */}
                <motion.div
                  animate={{ x: [-100, 100] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  }}
                />
              </motion.div>
            </div>

            {/* Milestone Markers */}
            {[25, 50, 75].map((m) => (
              <div key={m} style={{
                position: 'absolute', left: `${m}%`, top: '50%', transform: 'translate(-50%, -50%)',
                width: '1vmin', height: '1vmin', borderRadius: '50%',
                background: safeProgress >= m ? 'white' : 'rgba(0,0,0,0.1)',
                border: safeProgress >= m ? '0.2vmin solid #16a34a' : 'none',
                zIndex: 10
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
