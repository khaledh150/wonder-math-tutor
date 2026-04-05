import React from 'react'
import { motion } from 'framer-motion'
import useLanguageStore from '../store/useLanguageStore'
import { i18n } from '../utils/i18n'
import { SkyFullBackground } from '../theme/SkyBackground'
import GummyButton from './shared/GummyButton'
import PipCat from './characters/PipCat'

const enterFullscreen = () => {
  const el = document.documentElement
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
  if (req) req.call(el).catch(() => {})
}

export default function StartScreen({ onStart }) {
  const { language } = useLanguageStore()
  const t = i18n[language]

  const handleStart = () => {
    enterFullscreen()
    onStart()
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', overflow: 'hidden' }}>
      
      <SkyFullBackground />

      {/* 2. Hero Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        {/* Animated Title */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: [1, 1.05, 1] }}
          transition={{ duration: 0.8, type: 'spring', damping: 10, scale: { repeat: Infinity, duration: 4 } }}
        >
          <div className="text-hero" style={{ fontSize: '16vmin', color: 'var(--wk-purple-dark)', textShadow: '0 1vmin 0 var(--wk-purple-light)', lineHeight: 0.9 }}>
            WONDER<br/>
            <span style={{ color: 'var(--wk-yellow)', textShadow: '0 1vmin 0 var(--wk-yellow-dark)' }}>MATH</span>
          </div>
          <div style={{ fontSize: 'var(--p)', color: 'var(--wk-purple)', fontWeight: 800, marginTop: '2vmin', letterSpacing: 6 }}>REVOLUTION</div>
        </motion.div>

        {/* Start Button */}
        <div style={{ marginTop: '6vmin' }}>
          <GummyButton variant="yellow" size="lg" onClick={handleStart}>
            <span style={{ fontSize: 'var(--h3)', padding: '1vmin 4vmin' }}>{t.START_GAME}</span>
          </GummyButton>
        </div>
      </div>

      {/* 3. Mascot Greeting */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        style={{ position: 'absolute', bottom: '4vmin', left: '4vmin', zIndex: 20 }}
      >
        <div className="animate-float">
          <PipCat size="40vmin" mood="happy" waving={true} />
        </div>
      </motion.div>

      {/* 4. Footer Accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15vh', background: 'var(--wk-green)', borderRadius: '100% 100% 0 0' }}>
        <div style={{ position: 'absolute', top: -30, left: '60%' }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="white" opacity={0.4} /><circle cx="30" cy="30" r="10" fill="white" opacity={0.6} /></svg>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
