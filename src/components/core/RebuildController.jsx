// RebuildController.jsx — The High-Fidelity Session Wrapper
import React, { useEffect } from 'react'
import useGameStore from '../../store/useGameStore'
import StageSwitcher from './StageSwitcher'
import SceneBackground from '../themes/SceneBackground'
import GameHUD from '../shared/GameHUD'

export default function RebuildController({ question, onExit, onComplete }) {
  const { stageIndex, isComplete } = useGameStore()

  // Handle level completion event back to App.jsx
  useEffect(() => {
    if (isComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])

  if (!question) return null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 1. Immersive Theme Background */}
      <SceneBackground themeId={question.theme?.id || 'candy'} />

      {/* 2. Global Game HUD (Store Aware) */}
      <GameHUD
        level={question.level || question.id}
        progress={((stageIndex + 1) / 4) * 100} // Based on 4 core stages
        onQuit={onExit}
      />

      {/* 3. The Stage Transition Engine */}
      <div style={{ position: 'relative', zIndex: 50, width: '100%', height: '100%' }}>
        <StageSwitcher />
      </div>
    </div>
  )
}
