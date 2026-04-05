// StageCelebration.jsx — Mastery & Loop Closure (Stage 4 Template)
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/useGameStore'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'
import { playSuccessSfx, playStarSfx, playTapSfx } from '../../utils/sfx'
import GummyButton from '../shared/GummyButton'
import { triggerSuccessConfetti } from '../../utils/confetti'
import { speak } from '../../utils/tts'

const Star = ({ delay, active }) => {
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => {
      setIsUnlocked(true)
      playStarSfx()
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [delay, active])

  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={isUnlocked ? { scale: 1, rotate: 0 } : (active ? {} : { scale: 1, opacity: 0.2, filter: 'grayscale(1)' })}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      style={{ fontSize: 80 }}
    >
      ⭐
    </motion.div>
  )
}

export default function StageCelebration() {
  const { currentQuestion, nextStage, mistakesMade } = useGameStore()
  const { language } = useLanguageStore()
  const t = i18n[language]
  const [showButton, setShowButton] = useState(false)

  // Calculate stars: 0 mistakes = 3, 1-2 = 2, 3+ = 1
  const starsEarned = mistakesMade === 0 ? 3 : mistakesMade <= 2 ? 2 : 1

  const data = currentQuestion || {
    math: { num1: 25, num2: 15, ans: 40 }
  }

  const num1 = data.math?.num1 ?? 0
  const num2 = data.math?.num2 ?? 0
  const ans = data.math?.ans ?? 0
  const op = currentQuestion?.config?.operation || '+'

  // Convert operator symbol to spoken word
  const spokenOp = (symbol, lang) => {
    const map = {
      '+': lang === 'en' ? 'plus' : 'บวก',
      '-': lang === 'en' ? 'minus' : 'ลบ',
      '×': lang === 'en' ? 'times' : 'คูณ',
      '÷': lang === 'en' ? 'divided by' : 'หาร',
    }
    return map[symbol] || symbol
  }

  useEffect(() => {
    playSuccessSfx()
    triggerSuccessConfetti()

    // 🎤 Dictate the full equation with spoken operator words
    const equalsWord = language === 'en' ? 'equals' : 'เท่ากับ'
    const equationText = `${num1} ${spokenOp(op, language)} ${num2} ${equalsWord} ${ans}`
    const celebrationText = language === 'en'
      ? `Mission Successful! ${equationText}!`
      : `ภารกิจสำเร็จ! ${equationText}!`

    // Show button after animations finish
    const buttonTimer = setTimeout(() => setShowButton(true), 2800)

    return () => {
      clearTimeout(buttonTimer)
    }
  }, [language, num1, num2, ans, op])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* 1. Header Mastery */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ textAlign: 'center', marginBottom: '4vmin' }}
      >
        <span style={{ fontSize: 'var(--p)', fontWeight: 900, color: '#10b981', letterSpacing: 4, textTransform: 'uppercase' }}>{t.MISSION_SUCCESS}</span>
        <h1 className="text-hero" style={{ fontSize: 'var(--h1)', color: 'white', textShadow: '0 8px 0 #064e3b, 0 12px 20px rgba(0,0,0,0.3)' }}>{t.MASTERY}!</h1>
      </motion.div>

      {/* 2. Equation Trophy */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-panel-v2"
        style={{ padding: '2vmin 8vmin', marginBottom: '6vmin', border: '4px solid #10b981' }}
      >
        <div className="text-hero" style={{ fontSize: 'var(--h2)', color: 'white' }}>
          {num1} {op} {num2} = {ans}
        </div>
      </motion.div>

      {/* 3. Star Rewards (Staggered) — Only show what's earned */}
      <div style={{ display: 'flex', gap: '3vmin', marginBottom: '8vmin' }}>
        <Star index={0} delay={1.2} active={starsEarned >= 1} />
        <Star index={1} delay={1.5} active={starsEarned >= 2} />
        <Star index={2} delay={1.8} active={starsEarned >= 3} />
      </div>

      {/* 4. Loop Closure Button (Safe Zone Placement) */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: [1, 1.05, 1], y: 0 }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              y: { type: 'spring', stiffness: 200 }
            }}
            style={{ position: 'absolute', bottom: '8vmin' }}
          >
            <GummyButton variant="yellow" size="lg" onClick={() => { playTapSfx(); nextStage(); }}>
              {t.COLLECT_REWARD} 🗺️
            </GummyButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Visuals (Particles) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '10%', left: '20%', width: 2, height: 2, backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 0 20px 10px white' }} />
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} style={{ position: 'absolute', top: '70%', left: '80%', width: 2, height: 2, backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 0 20px 10px white' }} />
      </div>

    </div>
  )
}
