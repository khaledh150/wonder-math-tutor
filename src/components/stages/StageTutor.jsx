// StageTutor.jsx — Find the Answer (Stage 3)
// Layout cloned from StageBuilder — question text + equation bar with answer slot + draggable choices
import React, { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/useGameStore'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'
import { playTapSfx, playSnapSfx, playCorrectSfx, playWrongSfx } from '../../utils/sfx'
import { speak, stopSpeaking } from '../../utils/tts'
import { triggerSuccessConfetti } from '../../utils/confetti'

const DraggableBlock = ({ id, value, onDrop, color, shadow }) => {
  const [isDragging, setIsDragging] = useState(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const t = e.touches?.[0] || e.changedTouches?.[0] || e
      lastPointerRef.current = { x: t.clientX, y: t.clientY }
    }
    const onEnd = (e) => {
      const t = e.changedTouches?.[0] || e
      if (t.clientX !== undefined) lastPointerRef.current = { x: t.clientX, y: t.clientY }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isDragging])

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragElastic={0.8}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 30 }}
      onDragStart={(e) => {
        setIsDragging(true)
        const t = e.touches?.[0] || e
        lastPointerRef.current = { x: t.clientX || 0, y: t.clientY || 0 }
      }}
      onDragEnd={() => {
        setIsDragging(false)
        onDrop(id, value, lastPointerRef.current)
      }}
      whileHover={{ scale: 1.08 }}
      whileDrag={{
        scale: 1.2,
        boxShadow: `0 2vmin 4vmin ${color}60, 0 1vmin 2vmin rgba(0,0,0,0.3)`,
        cursor: 'grabbing',
        zIndex: 9999
      }}
      className="gummy-btn animate-pop"
      style={{
        width: '12vmin', height: '12vmin',
        backgroundColor: color,
        borderRadius: 'var(--radius-md)',
        border: '0.6vmin solid rgba(255,255,255,0.7)',
        boxShadow: `0 1.2vmin 0 ${shadow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '8vmin', fontWeight: 900, color: 'white',
        cursor: 'grab',
        position: 'relative',
        zIndex: 100,
        touchAction: 'none'
      }}
    >
      {value}
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: '2vmin', height: '2vmin', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', pointerEvents: 'none' }} />
    </motion.div>
  )
}

const DropZone = ({ value, isFilled, isCorrect, targetRef, onClear }) => (
  <div
    ref={targetRef}
    data-drop-slot="true"
    onClick={isFilled && !isCorrect ? onClear : undefined}
    className="glass-panel"
    style={{
      width: '14vmin', height: '14vmin',
      background: isCorrect ? '#22c55e' : (isFilled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.03)'),
      borderRadius: '4vmin', border: `0.8vmin solid ${isCorrect ? 'white' : (isFilled ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.15)')}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '7vmin', fontWeight: 900, color: isCorrect ? 'white' : '#4338ca',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: isFilled && !isCorrect ? 'pointer' : 'default',
      position: 'relative', overflow: 'visible'
    }}
  >
    <AnimatePresence mode="wait">
      {isFilled ? (
        <motion.span key="filled" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
          {value.val}
        </motion.span>
      ) : null}
    </AnimatePresence>
  </div>
)

const LockedBlock = ({ value }) => (
  <div style={{ width: '14vmin', height: '14vmin', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7vmin', fontWeight: 900, color: '#1e1b4b', borderRadius: '4vmin' }}>
    {value}
  </div>
)

export default function StageTutor() {
  const { currentQuestion, nextStage, addMistake } = useGameStore()
  const { language } = useLanguageStore()

  const num1 = currentQuestion?.math?.num1 ?? 0
  const num2 = currentQuestion?.math?.num2 ?? 0
  const num3 = currentQuestion?.math?.num3 ?? null
  const ans = currentQuestion?.math?.ans ?? 0
  const op = currentQuestion?.config?.operation || '+'
  const op2 = currentQuestion?.config?.op2 || null
  const is3Step = num3 !== null
  const questionText = currentQuestion?.narrative?.[language] || '...'

  const [slot, setSlot] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const slotRef = useRef(null)

  // Generate answer choices: correct + 3 plausible distractors, all distinct colors
  const activeBlocks = useMemo(() => {
    const BLOCK_COLORS = [
      { color: '#8b5cf6', shadow: '#6d28d9' },
      { color: '#f97316', shadow: '#c2410c' },
      { color: '#06b6d4', shadow: '#0e7490' },
      { color: '#ec4899', shadow: '#be185d' },
    ]
    const shuffledColors = [...BLOCK_COLORS].sort(() => Math.random() - 0.5)

    const distractors = []
    const offsets = [10, -4, 2, -7, 5, -2]
    for (const off of offsets) {
      const d = ans + off
      if (d > 0 && d !== ans && !distractors.includes(d)) distractors.push(d)
      if (distractors.length >= 3) break
    }

    const all = [
      { id: 'correct', val: ans, ...shuffledColors[0] },
      ...distractors.map((d, i) => ({ id: `d-${i}`, val: d, ...shuffledColors[i + 1] }))
    ]
    return all.sort(() => Math.random() - 0.5)
  }, [ans])

  // Speak question on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(language === 'en' ? "Now find the answer!" : "หาคำตอบกันเลย!", language)
    }, 500)
    return () => { clearTimeout(timer); stopSpeaking() }
  }, [language])

  // Drop detection via elementsFromPoint
  const findSlotAtPoint = (x, y) => {
    const els = document.elementsFromPoint(x, y)
    for (const el of els) {
      if (el.getAttribute('data-drop-slot')) return true
      if (el.parentElement?.getAttribute('data-drop-slot')) return true
    }
    if (slotRef.current) {
      const rect = slotRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.hypot(x - cx, y - cy)
      if (dist < rect.width / 2 + 60) return true
    }
    return false
  }

  const handleDrop = (id, val, pointer) => {
    if (!pointer || isComplete) return
    if (findSlotAtPoint(pointer.x, pointer.y)) {
      playSnapSfx()
      setSlot({ id, val })
      if (val === ans) {
        playCorrectSfx()
        triggerSuccessConfetti()
        setIsComplete(true)
        setTimeout(() => nextStage(), 1500)
      } else {
        playWrongSfx()
        addMistake()
        setTimeout(() => setSlot(null), 600)
      }
    } else {
      playTapSfx()
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '10vmin 5vmin' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', gap: '4vmin', justifyContent: 'flex-start', paddingTop: '2vmin' }}>

        {/* Question text panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel"
          style={{ padding: '3vmin 6vmin', borderRadius: '4vmin', border: '0.5vmin solid white', boxShadow: '0 3vmin 6vmin rgba(0,0,0,0.2)', maxWidth: '120vmin', width: '90%', marginTop: '0.5vmin' }}
        >
          <p style={{ fontSize: '3.8vmin', fontWeight: 800, color: '#4338ca', textAlign: 'center', margin: 0, lineHeight: 1.3 }}>{questionText}</p>
        </motion.div>

        {/* Equation bar: num1 op num2 = [DROP SLOT] */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          layout
          className="glass-panel-v2"
          style={{ padding: '2vmin 6vmin', display: 'flex', alignItems: 'center', gap: is3Step ? '2vmin' : '3vmin', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(255,255,255,0.95)', borderRadius: '5vmin', border: '0.6vmin solid white', boxShadow: '0 2vmin 6vmin rgba(0,0,0,0.08)' }}
        >
          <LockedBlock value={num1} />
          <span style={{ fontSize: '7vmin', fontWeight: 900, color: '#4338ca', opacity: 0.3 }}>{op}</span>
          <LockedBlock value={num2} />
          {is3Step && (
            <>
              <span style={{ fontSize: '7vmin', fontWeight: 900, color: '#4338ca', opacity: 0.3 }}>{op2}</span>
              <LockedBlock value={num3} />
            </>
          )}
          <span style={{ fontSize: '7vmin', fontWeight: 900, color: '#4338ca', opacity: 0.6 }}>=</span>
          <DropZone value={slot} isFilled={slot !== null} isCorrect={isComplete} targetRef={slotRef} onClear={() => setSlot(null)} />
        </motion.div>

        {/* Answer bank: 4 draggable choices */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', gap: '3vmin', background: 'rgba(255,255,255,0.6)', padding: '1.5vmin', borderRadius: '3.5vmin', border: '0.3vmin solid white', boxShadow: '0 1vmin 3vmin rgba(0,0,0,0.05)' }}
        >
          {activeBlocks.map((opt) => (
            <div key={opt.id} style={{ position: 'relative', width: '12vmin', height: '12vmin' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-md)', border: '0.4vmin dashed rgba(0,0,0,0.05)', backgroundColor: 'rgba(0,0,0,0.02)' }} />
              {slot?.id !== opt.id && <DraggableBlock id={opt.id} value={opt.val} color={opt.color} shadow={opt.shadow} onDrop={handleDrop} />}
            </div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  )
}
