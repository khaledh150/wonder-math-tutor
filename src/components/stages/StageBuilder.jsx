import React, { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/useGameStore'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'
import { playTapSfx, playSnapSfx, playCorrectSfx, playWrongSfx } from '../../utils/sfx'
import { speak, stopSpeaking } from '../../utils/tts'
import PipCat from '../characters/PipCat'
import { triggerSuccessConfetti } from '../../utils/confetti'

// ─── DraggableBlock with BlendingFactory-style pointer tracking ─────────────
const DraggableBlock = ({ id, value, onDrop, color = 'var(--wk-blue)', shadow = 'var(--wk-blue-dark)' }) => {
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
        width: '9.5vmin', height: '9.5vmin',
        backgroundColor: color,
        borderRadius: 'var(--radius-md)',
        border: '0.6vmin solid rgba(255,255,255,0.7)',
        boxShadow: `0 1.2vmin 0 ${shadow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '6.5vmin', fontWeight: 900, color: 'white',
        cursor: 'grab', position: 'relative',
        zIndex: 100, touchAction: 'none'
      }}
    >
      {value}
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: '2vmin', height: '2vmin', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', pointerEvents: 'none' }} />
    </motion.div>
  )
}

// ─── DropZone — correct fills green, no star emoji ──────────────────────────
const DropZone = ({ label, value, isFilled, isCorrect, targetRef, onClear, slotIndex = 1 }) => (
  <div
    ref={targetRef}
    data-drop-slot={slotIndex}
    onClick={isFilled ? onClear : undefined}
    className="glass-panel"
    style={{
      width: '10vmin', height: '10vmin',
      background: isCorrect ? '#22c55e' : (isFilled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.03)'),
      borderRadius: '3.5vmin', border: `0.8vmin solid ${isCorrect ? 'white' : (isFilled ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.15)')}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '5.5vmin', fontWeight: 900, color: isCorrect ? 'white' : '#4338ca',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: isFilled ? 'pointer' : 'default',
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

const LockedBlock = ({ value, color = 'transparent' }) => (
  <div style={{ width: '10vmin', height: '10vmin', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5.5vmin', fontWeight: 900, color: '#1e1b4b', background: color, borderRadius: '3.5vmin' }}>
    {value}
  </div>
)

const EquationPart = ({ val, isSlot, isComplete, onDrop, slotRef, slot }) => {
  if (isSlot) return <DropZone label="?" value={slot} isFilled={slot !== null} isCorrect={isComplete} targetRef={slotRef} onClear={() => onDrop(null, null, null)} />
  return <LockedBlock value={val} />
}

// ─── Emoji-based VisualGroup — proportional count (max 9), dynamic size scaling
const VisualGroup = ({ num, label, emoji, color }) => {
  const count = num <= 9 ? num : Math.min(9, Math.max(3, Math.ceil(num / 10)))
  const labelLower = (label || '').toLowerCase()
  const scale = (labelLower.includes('small') || labelLower.includes('เล็ก') || labelLower.includes('little')) ? 0.8
    : (labelLower.includes('big') || labelLower.includes('ใหญ่') || labelLower.includes('large')) ? 1.25
    : 1
  const cleanLabel = (label || '').replace(/\d+/g, '').trim().split(/\s+/).slice(0, 2).join(' ')

  const emojiStyle = {
    fontSize: '4vmin',
    filter: 'drop-shadow(0 0.5vmin 0.5vmin rgba(0,0,0,0.2))',
    lineHeight: 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1vmin', transform: `scale(${scale})`, width: '18vmin' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.3vmin', width: '100%', minHeight: '9vmin' }}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} style={emojiStyle}>{emoji || '🟦'}</span>
        ))}
      </div>
      <span style={{ fontSize: '2.2vmin', fontWeight: 800, color }}>{num} {cleanLabel}</span>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function StageBuilder() {
  const { currentQuestion, nextStage, addMistake, isAnalyzerMode } = useGameStore()
  const { language } = useLanguageStore()
  const t = i18n[language]

  const num1 = currentQuestion?.math?.num1 ?? 0
  const num2 = currentQuestion?.math?.num2 ?? 0
  const num3 = currentQuestion?.math?.num3 ?? null
  const ans = currentQuestion?.math?.ans ?? 0
  const builderText = currentQuestion?.narrative?.[language] || "..."
  const is3Step = num3 !== null

  const [missingField, setMissingField] = useState(null)
  const [activeBlocks, setActiveBlocks] = useState([])
  const [slot, setSlot] = useState(null)
  const [slot2, setSlot2] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const slotRef = useRef(null)
  const slotRef2 = useRef(null)

  const [subPhase, setSubPhase] = useState('build')
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1)
  const words = useMemo(() => builderText.split(' '), [builderText])

  // Word-by-word dictation state
  const [readingIdx, setReadingIdx] = useState(-1)
  const [poppedWords, setPoppedWords] = useState(new Set())
  const [showBlock1, setShowBlock1] = useState(false)
  const [showBlock2, setShowBlock2] = useState(false)
  const [showBlock3, setShowBlock3] = useState(false)
  const [blocksSettled, setBlocksSettled] = useState(false)
  const [showEquation, setShowEquation] = useState(false)

  // Dynamic keywords from analysis data, with fallback
  const analysis = currentQuestion?.analysis || {}
  const KEYWORD_LIST = useMemo(() => {
    const fromAnalysis = [...(analysis.keywordsEN || []), ...(analysis.keywordsTH || [])]
    return fromAnalysis.length > 0 ? fromAnalysis : ['gives', 'gave', 'more', 'added', 'total', 'all', 'left', 'remain', 'and', 'ให้', 'อีก', 'เพิ่ม', 'ทั้งหมด', 'เหลือ', 'กี่']
  }, [analysis.keywordsEN, analysis.keywordsTH])

  // ─── Word-by-word dictation timeline — sentence-by-sentence, relaxed pace ───
  useEffect(() => {
    if (subPhase !== 'build') return
    let cancelled = false
    const wait = (ms) => new Promise(res => { const id = setTimeout(res, ms); if (cancelled) clearTimeout(id) })

    const sentences = builderText.split(/(?<=[.?。？])/).map(s => s.trim()).filter(Boolean)

    const runDictation = async () => {
      setReadingIdx(-1)
      setPoppedWords(new Set())
      setShowBlock1(false)
      setShowBlock2(false)
      setShowBlock3(false)
      setBlocksSettled(false)
      setShowEquation(false)

      await wait(1000)
      if (cancelled) return

      const num1Str = String(num1)
      const num2Str = String(num2)
      const num3Str = num3 !== null ? String(num3) : null
      let block1Done = false
      let block2Done = false
      let block3Done = false
      let globalIdx = 0

      for (let s = 0; s < sentences.length; s++) {
        if (cancelled) return
        const sentenceWords = sentences[s].split(' ').filter(Boolean)
        const isLastSentence = s === sentences.length - 1

        // Before the question sentence: settle the blocks
        if (isLastSentence && s > 0 && (block1Done || block2Done || block3Done)) {
          await wait(1800)
          if (cancelled) return
          setBlocksSettled(true)
          await wait(2000)
          if (cancelled) return
        }

        speak(sentences[s], language)

        const basePace = 400
        const totalTtsTime = sentenceWords.length * basePace
        let timeSpent = 0

        for (let w = 0; w < sentenceWords.length; w++) {
          if (cancelled) return
          setReadingIdx(globalIdx)

          const raw = sentenceWords[w].replace(/[^a-zA-Z0-9ก-๙]/g, '')
          const lower = raw.toLowerCase()
          const isKw = KEYWORD_LIST.some(kw => {
            const kwLower = kw.toLowerCase()
            return kwLower.length <= 4 ? lower === kwLower : lower.includes(kwLower)
          })
          const hitsNum1 = !block1Done && raw === num1Str
          const hitsNum2 = !block2Done && block1Done && raw === num2Str
          const hitsNum3 = !block3Done && block2Done && num3Str && raw === num3Str

          const wordsLeft = sentenceWords.length - w - 1
          const ttsTimeLeft = Math.max(0, totalTtsTime - timeSpent)
          const catchUpPace = wordsLeft > 0 ? Math.min(basePace, ttsTimeLeft / wordsLeft) : basePace

          if (hitsNum1) {
            block1Done = true
            setShowBlock1(true)
            await wait(basePace)
            timeSpent += basePace
          } else if (hitsNum2) {
            block2Done = true
            setShowBlock2(true)
            await wait(basePace)
            timeSpent += basePace
          } else if (hitsNum3) {
            block3Done = true
            setShowBlock3(true)
            await wait(basePace)
            timeSpent += basePace
          } else if (isKw) {
            setPoppedWords(prev => new Set([...prev, globalIdx]))
            await wait(basePace)
            timeSpent += basePace
          } else {
            const pace = Math.max(200, Math.round(catchUpPace))
            await wait(pace)
            timeSpent += pace
          }

          globalIdx++
        }

        if (!isLastSentence) {
          await wait(1200)
        }
      }

      if (cancelled) return
      setReadingIdx(-1)

      await wait(2000)
      if (cancelled) return

      speak(language === 'en' ? "Now let's build the equation!" : "มาสร้างสมการกัน!", language)
      setShowEquation(true)
    }

    runDictation()
    return () => { cancelled = true; stopSpeaking() }
  }, [subPhase, builderText, language, num1, num2])

  // ─── Always operation mode — answer blank for Stage 3 ─────────────────────
  useEffect(() => {
    setMissingField('operation')

    const BLOCK_COLORS = [
      { color: '#8b5cf6', shadow: '#6d28d9' },
      { color: '#f97316', shadow: '#c2410c' },
      { color: '#06b6d4', shadow: '#0e7490' },
      { color: '#ec4899', shadow: '#be185d' },
    ]
    const shuffledColors = [...BLOCK_COLORS].sort(() => Math.random() - 0.5)
    const allOps = ['+', '-', '×', '÷']
    setActiveBlocks(allOps.map((op, idx) => ({
      id: op, val: op,
      color: shuffledColors[idx].color,
      shadow: shuffledColors[idx].shadow
    })))
    setSlot(null)
    setSlot2(null)
    setIsComplete(false)
  }, [num1, num2, ans, currentQuestion])

  // ─── Analyze subPhase (legacy, kept for compatibility) ────────────────────
  useEffect(() => {
    if (subPhase !== 'analyze' || !isAnalyzerMode()) return

    const runSequence = async () => {
      stopSpeaking()
      await delay(1000)
      const infoPart = builderText.split('?')[0] + '?'
      speak(language === 'en' ? "Let's look at the numbers." : "มาดูตัวเลขกัน", language)
      await delay(2500)
      speak(infoPart, language)
      const infoWords = infoPart.split(' ')
      for (let i = 0; i < infoWords.length; i++) {
        setHighlightedWordIndex(i)
        await delay(450)
      }
      setHighlightedWordIndex(-1)
      await delay(1500)
      const goalPart = builderText.includes('?') ? builderText.substring(builderText.indexOf('?') + 1).trim() : ''
      if (goalPart) {
        speak(language === 'en' ? "What do we need to find?" : "เราต้องหาอะไร?", language)
        await delay(2500)
        speak(goalPart, language)
        const goalWords = goalPart.split(' ')
        const actualStartIndex = words.length - goalWords.length
        for (let i = actualStartIndex; i < words.length; i++) {
          setHighlightedWordIndex(i)
          await delay(500)
        }
      }
      await delay(2500)
      speak(language === 'en' ? "Now, let's build the equation!" : "มาสร้างสมการกัน!", language)
      await delay(2000)
      setSubPhase('build')
    }
    runSequence()
    return () => stopSpeaking()
  }, [subPhase, builderText, language])

  const delay = (ms) => new Promise(res => setTimeout(res, ms))

  // ─── Completion dictation — operation only, no answer ─────────────────────
  useEffect(() => {
    const op = currentQuestion?.config?.operation || '+'
    if (isComplete) {
      const opWord = op === '+' ? (language === 'en' ? 'plus' : 'บวก') :
        op === '-' ? (language === 'en' ? 'minus' : 'ลบ') :
          op === '×' ? (language === 'en' ? 'times' : 'คูณ') :
            (language === 'en' ? 'divided by' : 'หาร')
      const op2Word = targetOp2 === '+' ? (language === 'en' ? 'plus' : 'บวก') :
        targetOp2 === '-' ? (language === 'en' ? 'minus' : 'ลบ') : ''
      const eqPart = is3Step
        ? `${num1} ${opWord} ${num2} ${op2Word} ${num3}`
        : `${num1} ${opWord} ${num2}`
      const equationStr = language === 'en'
        ? `${eqPart}. Now let's find the answer!`
        : `${eqPart} มาหาคำตอบกัน!`
      setTimeout(() => speak(equationStr, language), 800)
    }
  }, [isComplete, language, num1, num2, currentQuestion])

  const targetOp1 = currentQuestion?.config?.operation || '+'
  const targetOp2 = currentQuestion?.config?.op2 || null

  // ─── Drop detection via elementsFromPoint ─────────────────────────────────
  const findSlotAtPoint = (x, y) => {
    const els = document.elementsFromPoint(x, y)
    for (const el of els) {
      const idx = el.getAttribute('data-drop-slot')
      if (idx !== null) return parseInt(idx)
      const pIdx = el.parentElement?.getAttribute('data-drop-slot')
      if (pIdx !== null) return parseInt(pIdx)
    }
    // Proximity fallback for slot 1
    if (slotRef.current) {
      const rect = slotRef.current.getBoundingClientRect()
      if (Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2)) < rect.width / 2 + 60) return 1
    }
    // Proximity fallback for slot 2
    if (slotRef2.current) {
      const rect = slotRef2.current.getBoundingClientRect()
      if (Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2)) < rect.width / 2 + 60) return 2
    }
    return -1
  }

  const checkComplete = (s1, s2) => {
    const op1Correct = s1?.val === targetOp1
    const op2Correct = !is3Step || s2?.val === targetOp2
    if (op1Correct && op2Correct) {
      playCorrectSfx()
      triggerSuccessConfetti()
      setIsComplete(true)
      setTimeout(() => nextStage(), 4500)
    }
  }

  const handleDrop = (id, val, pointer) => {
    if (!pointer || isComplete) return
    const slotIdx = findSlotAtPoint(pointer.x, pointer.y)
    if (slotIdx === 1 && !slot) {
      playSnapSfx()
      const newSlot = { id, val }
      setSlot(newSlot)
      if (val === targetOp1) {
        checkComplete(newSlot, slot2)
      } else {
        playWrongSfx()
        addMistake()
        setTimeout(() => setSlot(null), 600)
      }
    } else if (slotIdx === 2 && !slot2 && is3Step) {
      playSnapSfx()
      const newSlot2 = { id, val }
      setSlot2(newSlot2)
      if (val === targetOp2) {
        checkComplete(slot, newSlot2)
      } else {
        playWrongSfx()
        addMistake()
        setTimeout(() => setSlot2(null), 600)
      }
    } else {
      playTapSfx()
    }
  }

  if (!missingField) return null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '10vmin 5vmin' }}>
      <AnimatePresence mode="wait">
        {subPhase === 'analyze' ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4vmin',
              padding: '6vmin', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              borderRadius: '6vmin', border: '0.8vmin solid white', boxShadow: '0 4vmin 8vmin rgba(139,92,246,0.3)', maxWidth: '110vmin'
            }}
          >
            <PipCat size="22vmin" mood="thinking" waving={true} />
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5vmin', padding: '2vmin' }}>
              {words.map((word, i) => {
                const clean = word.replace(/[^a-zA-Z0-9ก-๙]/g, '').toLowerCase()
                const isKeyword = KEYWORD_LIST.some(kw => {
                  const kwLower = kw.toLowerCase()
                  return kwLower.length <= 4 ? clean === kwLower : clean.includes(kwLower)
                })
                const shouldHigh = i === highlightedWordIndex

                return (
                  <motion.span
                    key={i}
                    animate={{ color: shouldHigh ? 'var(--wk-purple)' : (isKeyword ? '#ef4444' : '#1e1b4b'), scale: shouldHigh ? 1.3 : 1 }}
                    style={{ fontSize: '5vmin', fontWeight: 800, lineHeight: 1.3, position: 'relative', textShadow: shouldHigh ? '0 0.5vmin 1vmin rgba(0,0,0,0.2)' : 'none' }}
                  >
                    {word}
                    {isKeyword && (
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ position: 'absolute', inset: '-1.8vmin', border: '0.6vmin solid #ef4444', borderRadius: '50%', boxShadow: '0 0 2.5vmin rgba(239,68,68,0.5)' }}
                      />
                    )}
                  </motion.span>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="build" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', gap: '4vmin', justifyContent: 'flex-start', paddingTop: '2vmin' }}>
            {/* Question text — word-by-word green/red dictation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel"
              style={{ padding: '3vmin 6vmin', borderRadius: '4vmin', border: '0.5vmin solid white', boxShadow: '0 3vmin 6vmin rgba(0,0,0,0.2)', maxWidth: '120vmin', width: '90%', marginTop: '0.5vmin' }}
            >
              <p style={{ fontSize: '3.8vmin', fontWeight: 800, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                {words.map((word, i) => {
                  const isReading = i === readingIdx
                  const isPopped = poppedWords.has(i)
                  const justActivated = isReading && isPopped
                  const color = isPopped ? '#ef4444' : (isReading ? '#16a34a' : '#4338ca')

                  return (
                    <motion.span
                      key={i}
                      animate={{
                        color,
                        scale: justActivated ? [1, 1.4, 1.05] : (isReading ? 1.1 : 1),
                        textShadow: justActivated ? '0 0 2vmin rgba(239,68,68,0.6)' : (isReading ? '0 0 1.5vmin rgba(22,163,74,0.4)' : 'none'),
                      }}
                      transition={{ duration: justActivated ? 0.35 : 0.2 }}
                      style={{ display: 'inline', fontWeight: (isReading || isPopped) ? 900 : 800 }}
                    >
                      {word}{' '}
                    </motion.span>
                  )
                })}
              </p>
            </motion.div>

            {/* Emoji counting blocks — appear HUGE then settle */}
            {(showBlock1 || showBlock2 || showBlock3) && (
              <motion.div
                animate={blocksSettled
                  ? { scale: 1.15, y: 0 }
                  : { scale: 1.8, y: '8vmin' }
                }
                transition={blocksSettled
                  ? { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }
                  : { duration: 0.3 }
                }
                style={{ display: 'flex', justifyContent: 'center', gap: '8vmin' }}
              >
                <AnimatePresence>
                  {showBlock1 && (
                    <motion.div
                      key="block1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: [0, 1.3, 1] }}
                      transition={{ type: 'spring', stiffness: 250, damping: 12, mass: 1 }}
                    >
                      <VisualGroup num={num1} label={analysis.item1Label || ''} emoji={analysis.emoji1} color="#1e40af" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showBlock2 && (
                    <motion.div
                      key="block2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: [0, 1.3, 1] }}
                      transition={{ type: 'spring', stiffness: 250, damping: 12, mass: 1 }}
                    >
                      <VisualGroup num={num2} label={analysis.item2Label || ''} emoji={analysis.emoji2} color="#be185d" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showBlock3 && is3Step && (
                    <motion.div
                      key="block3"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: [0, 1.3, 1] }}
                      transition={{ type: 'spring', stiffness: 250, damping: 12, mass: 1 }}
                    >
                      <VisualGroup num={num3} label={analysis.item1Label || ''} emoji={analysis.emoji1} color="#7c3aed" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Operator bank + Equation bar — after dictation */}
            <AnimatePresence>
              {showEquation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '3vmin' }}
                >
                  <div style={{ display: 'flex', gap: '3vmin', background: 'rgba(255,255,255,0.6)', padding: '1.5vmin', borderRadius: '3.5vmin', border: '0.3vmin solid white', boxShadow: '0 1vmin 3vmin rgba(0,0,0,0.05)' }}>
                    {activeBlocks.map((opt) => (
                      <div key={opt.id} style={{ position: 'relative', width: '9.5vmin', height: '9.5vmin' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-md)', border: '0.4vmin dashed rgba(0,0,0,0.05)', backgroundColor: 'rgba(0,0,0,0.02)' }} />
                        {slot?.id !== opt.id && <DraggableBlock id={opt.id} value={opt.val} color={opt.color} shadow={opt.shadow} onDrop={handleDrop} />}
                      </div>
                    ))}
                  </div>

                  <motion.div layout className="glass-panel-v2" style={{ padding: '1.5vmin 4.5vmin', display: 'flex', alignItems: 'center', gap: is3Step ? '1.5vmin' : '2.5vmin', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(255,255,255,0.95)', borderRadius: '4vmin', border: '0.6vmin solid white', boxShadow: '0 2vmin 6vmin rgba(0,0,0,0.08)' }}>
                    <LockedBlock value={num1} />
                    <DropZone value={slot} isFilled={slot !== null} isCorrect={slot?.val === targetOp1} targetRef={slotRef} onClear={() => setSlot(null)} slotIndex={1} />
                    <LockedBlock value={num2} />
                    {is3Step && (
                      <>
                        <DropZone value={slot2} isFilled={slot2 !== null} isCorrect={slot2?.val === targetOp2} targetRef={slotRef2} onClear={() => setSlot2(null)} slotIndex={2} />
                        <LockedBlock value={num3} />
                      </>
                    )}
                    <span style={{ fontSize: '5.5vmin', fontWeight: 900, color: '#4338ca', opacity: 0.6 }}>=</span>
                    <div style={{ width: '10vmin', height: '10vmin', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3.5vmin', border: '0.8vmin solid rgba(0,0,0,0.15)', background: 'rgba(0,0,0,0.03)' }} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
