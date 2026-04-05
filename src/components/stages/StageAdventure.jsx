import React from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../../store/useGameStore'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'
import { speak, stopSpeaking } from '../../utils/tts'
import { playTapSfx } from '../../utils/sfx'
import GummyButton from '../shared/GummyButton'

export default function StageAdventure() {
  const { currentQuestion, nextStage } = useGameStore()
  const { language } = useLanguageStore()
  const t = i18n[language]

  const introText = currentQuestion?.narrative?.[language] || "..."

  // 🎤 Bilingual Voiceover Logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      speak(introText, language)
    }, 800)
    return () => {
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [introText, language])

  const handleGo = () => {
    playTapSfx()
    nextStage()
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{
          position: 'absolute', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)'
        }}
      >
        <div className="glass-panel" style={{ padding: '8vmin 12vmin', borderRadius: '5vmin', border: '0.8vmin solid white', boxShadow: '0 4vmin 8vmin rgba(0,0,0,0.4)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5vmin' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1vmin' }}>
            <span style={{ fontSize: '2vmin', fontWeight: 900, color: 'var(--wk-purple)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>{t.NEW_QUEST}</span>
            <h1 className="text-hero" style={{ fontSize: '10vmin', color: 'var(--wk-purple-dark)', textShadow: '0 0.8vmin 1.5vmin rgba(139,92,246,0.3)' }}>{t.QUEST_START} 🚀</h1>
          </div>
          <p style={{ fontSize: '5vmin', fontWeight: 700, color: '#1e1b4b', maxWidth: '80vmin', textAlign: 'center', lineHeight: 1.3 }}>{introText}</p>
          <GummyButton variant="yellow" size="lg" onClick={handleGo}>
            <span style={{ padding: '0 4vmin', fontSize: '5vmin' }}>{t.GO} 🎮</span>
          </GummyButton>
        </div>
      </motion.div>
    </div>
  )
}
