import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Music, Settings, RotateCcw } from 'lucide-react'
import useAudioStore from '../../store/useAudioStore'
import useLevelStore from '../../store/useLevelStore'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'

export default function SettingsModal({ isOpen, onClose }) {
  const { sfxEnabled, bgmEnabled, voiceEnabled, toggleSfx, toggleBgm, toggleVoice } = useAudioStore()
  const { resetProgress } = useLevelStore()
  const { language, setLanguage } = useLanguageStore()
  const t = i18n[language]

  const handleReset = () => {
    if (confirm(t.CONFIRM_RESET)) {
      resetProgress()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0, y: 50 }}
            className="glass-panel-v2-card"
            style={{
              width: '65vmin', background: 'rgba(255, 255, 255, 0.98)',
              padding: '5vmin', borderRadius: '6vmin', position: 'relative',
              boxShadow: '0 4vmin 8vmin rgba(0,0,0,0.3)', color: '#333'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '4vmin' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2vmin', marginBottom: '1vmin' }}>
                <Settings size="8vmin" color="var(--wk-purple)" />
                <h2 className="text-hero" style={{ fontSize: '7vmin', color: 'var(--wk-purple-dark)', textShadow: 'none', margin: 0 }}>{t.SETTINGS}</h2>
              </div>
            </div>

            {/* Toggle Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vmin' }}>
              <ToggleRow 
                icon={bgmEnabled ? <Music /> : <Music style={{ opacity: 0.4 }} />}
                label={t.BGM} enabled={bgmEnabled} onToggle={toggleBgm} 
              />
              <ToggleRow 
                icon={sfxEnabled ? <Volume2 /> : <VolumeX style={{ opacity: 0.4 }} />}
                label={t.SFX} enabled={sfxEnabled} onToggle={toggleSfx} 
              />
              <ToggleRow 
                icon={voiceEnabled ? <Volume2 /> : <VolumeX style={{ opacity: 0.4 }} />}
                label={t.VOICE} enabled={voiceEnabled} onToggle={toggleVoice} 
              />

              {/* Language Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1vmin 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3vmin' }}>
                   <div style={{ width: '10vmin', height: '10vmin', borderRadius: '3vmin', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wk-purple)', fontSize: '4vmin', fontWeight: 900 }}>🌐</div>
                   <span style={{ fontWeight: 800, fontSize: '3vmin', color: '#1a0533' }}>{t.LANGUAGE}</span>
                </div>
                
                <div style={{ display: 'flex', background: '#f3f4f6', padding: '0.6vmin', borderRadius: '99vmin', gap: '0.5vmin', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {['en', 'th'].map(lang => (
                    <motion.button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '1.2vmin 3vmin', borderRadius: '99vmin', border: 'none',
                        background: language === lang ? 'var(--wk-purple)' : 'transparent',
                        color: language === lang ? 'white' : '#666',
                        fontWeight: 900, cursor: 'pointer', fontSize: '2.2vmin', transition: '0.2s all'
                      }}
                    >
                      {lang === 'en' ? 'EN' : 'TH'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ marginTop: '4vmin', paddingTop: '3vmin', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
              <button
                onClick={handleReset}
                style={{
                  width: '100%', padding: '2vmin', borderRadius: '99vmin', border: 'none',
                  background: '#fee2e2', color: '#ef4444', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2vmin', cursor: 'pointer'
                }}
              >
                <RotateCcw size="4vmin" />
                {t.RESET_PROGRESS}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '2vmin', right: '2vmin', width: '8vmin', height: '8vmin',
                borderRadius: '50%', border: 'none', background: 'white',
                boxShadow: '0 1vmin 2vmin rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#666'
              }}
            >
              <X size="5vmin" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ToggleRow({ icon, label, enabled, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3vmin' }}>
        <div style={{ width: '10vmin', height: '10vmin', borderRadius: '3vmin', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wk-purple)' }}>
          {React.cloneElement(icon, { size: '6vmin' })}
        </div>
        <span style={{ fontWeight: 800, fontSize: '3vmin', color: '#1a0533' }}>{label}</span>
      </div>

      <button
        onClick={onToggle}
        style={{
          width: '12vmin', height: '6.5vmin', borderRadius: '99vmin', border: 'none', padding: '0.8vmin',
          background: enabled ? '#22c55e' : '#d1d5db', cursor: 'pointer', position: 'relative',
          transition: 'all 0.3s ease'
        }}
      >
        <motion.div
          animate={{ x: enabled ? '5.5vmin' : '0vmin' }}
          style={{ width: '4.9vmin', height: '4.9vmin', borderRadius: '50%', background: 'white', boxShadow: '0 0.5vmin 1vmin rgba(0,0,0,0.1)' }}
        />
      </button>
    </div>
  )
}
