import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/useGameStore'
import StageAdventure from '../stages/StageAdventure'
import StageBuilder from '../stages/StageBuilder'
import StageTutor from '../stages/StageTutor'
import StageCelebration from '../stages/StageCelebration'
import LoadingScreen from '../shared/LoadingScreen'


const STAGE_COMPONENTS = {
  adventure: StageAdventure,
  builder: StageBuilder,
  tutor: StageTutor,
  celebration: StageCelebration
}

const STAGE_MESSAGES = {
  adventure: "To the Adventure!",
  builder: "Let's build the equation!",
  tutor: "Time for a magic lesson!",
  celebration: "You did it! High five!"
}

export default function StageSwitcher() {
  const { stage } = useGameStore()
  const [currentStage, setCurrentStage] = useState(stage)
  const [isLoading, setIsLoading] = useState(false)
  // Trigger loading when stage changes
  useEffect(() => {
    if (stage !== currentStage) {
        setIsLoading(true)
        const timer = setTimeout(() => {
          setCurrentStage(stage)
          setIsLoading(false)
        }, 1200)
        return () => clearTimeout(timer)
    }
  }, [stage, currentStage])

  const ActiveStageUI = STAGE_COMPONENTS[currentStage] || StageAdventure

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="stage-loading" message={STAGE_MESSAGES[stage] || "Readying..."} />
        ) : (
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
            transition={{ 
              duration: 0.5, 
              ease: "circOut"
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <ActiveStageUI />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
