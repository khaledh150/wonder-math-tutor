import React, { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import StartScreen from './components/StartScreen'
import WorldMap from './components/WorldMap'
import RebuildController from './components/core/RebuildController'
import SettingsModal from './components/shared/SettingsModal'
import LoadingScreen from './components/shared/LoadingScreen'
import useLevelStore from './store/useLevelStore'
import useGameStore from './store/useGameStore'
import { questions } from './data/loader'
import './App.css'

const LOADING_MESSAGES = {
  map: "Entering the Wonder World",
  start: "Back to Home Base"
}

const MISSION_TIPS = [
  "Read carefully...",
  "Think step by step!",
  "You've got this!",
  "Let's solve it together!",
  "Math is an adventure!",
  "Focus and have fun!",
  "Every problem has a solution!",
  "Ready to explore?"
]

export default function App() {
  const [screen, setScreen] = useState('start')
  const [loadingTarget, setLoadingTarget] = useState(null) // next screen if loading
  const [loadingMsg, setLoadingMsg] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const { completedLevels, currentLevelIdx, setCurrentLevel, addCompletedLevel } = useLevelStore()
  const { setQuestion, mistakesMade } = useGameStore()

  // Listen for global settings trigger
  useEffect(() => {
    const handleOpen = () => setIsSettingsOpen(true)
    window.addEventListener('open-settings', handleOpen)
    return () => window.removeEventListener('open-settings', handleOpen)
  }, [])

  const triggerTransition = useCallback((targetScreen, levelIdx = null) => {
    // Dynamic message
    let msg = LOADING_MESSAGES[targetScreen] || "Preparing..."
    if (levelIdx !== null) msg = `Mission ${levelIdx + 1}: ${MISSION_TIPS[Math.floor(Math.random() * MISSION_TIPS.length)]}`
    
    setLoadingMsg(msg)
    setLoadingTarget(targetScreen)

    // Wait for cinematic feel
    setTimeout(() => {
      if (levelIdx !== null) {
        setCurrentLevel(levelIdx)
        setQuestion(questions[levelIdx])
      }
      setScreen(targetScreen)
      setLoadingTarget(null)
    }, 1800)
  }, [setCurrentLevel, setQuestion])

  const completedLevelIds = Object.keys(completedLevels).map(Number)
  const lastLevelId = Math.max(0, ...completedLevelIds)
  const currentLevelToPlay = lastLevelId + 1

  const handleStart = useCallback(() => triggerTransition('map'), [triggerTransition])
  const handleSelectLevel = useCallback((idx) => triggerTransition('game', idx), [triggerTransition])
  const handleExitToMap = useCallback(() => triggerTransition('map'), [triggerTransition])
  
  const handleLevelComplete = useCallback(() => {
    const stars = mistakesMade === 0 ? 3 : mistakesMade <= 2 ? 2 : 1
    addCompletedLevel(currentLevelIdx + 1, stars)
    triggerTransition('map')
  }, [currentLevelIdx, addCompletedLevel, mistakesMade, triggerTransition])

  const currentQuestion = questions[currentLevelIdx]

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      <AnimatePresence mode="wait">
        {loadingTarget && (
          <LoadingScreen key="loading" message={loadingMsg} />
        )}

        {!loadingTarget && screen === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <StartScreen onStart={handleStart} />
          </motion.div>
        )}

        {!loadingTarget && screen === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <WorldMap 
              onSelectLevel={handleSelectLevel} 
              completedLevels={completedLevels} 
              currentLevel={currentLevelToPlay}
            />
          </motion.div>
        )}

        {!loadingTarget && screen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <RebuildController 
              question={currentQuestion} 
              onExit={handleExitToMap} 
              onComplete={handleLevelComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        )}
      </AnimatePresence>

      <div className="portrait-guard">
        <div className="rotate-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-hero" style={{ marginBottom: 10 }}>PLEASE ROTATE YOUR DEVICE</h2>
        <p>This studio-grade experience requires landscape mode!</p>
      </div>
    </div>
  )
}
