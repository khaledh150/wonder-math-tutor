// Sound Engine — Studio-Grade Synthesized Audio (Monkey Stories Style)
// Uses Web Audio API for zero-latency, high-fidelity feedback without assets.

import useAudioStore from '../store/useAudioStore'

let audioCtx = null

function getCtx() {
  if (!useAudioStore.getState().sfxEnabled) return null // Early exit if disabled
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// Organic "Ding" with harmonic overtones
function magicChime(freq, dur, vol = 0.2) {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const freqs = [freq, freq * 1.5, freq * 2, freq * 2.5]
  const gains = [1, 0.5, 0.3, 0.1]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now)
    gain.gain.setValueAtTime(vol * gains[i], now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + dur)
  })
}

// Snappy "Pop" with noise-attack for tactile feel
function studioPop(startFreq, endFreq, dur, vol = 0.15) {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(startFreq, now)
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur)
  gain.gain.setValueAtTime(vol, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  const click = ctx.createOscillator()
  const clickGain = ctx.createGain()
  click.type = 'triangle'
  click.frequency.setValueAtTime(2000, now)
  clickGain.gain.setValueAtTime(vol * 0.5, now)
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
  click.connect(clickGain)
  clickGain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + dur)
  click.start(now)
  click.stop(now + 0.02)
}

export const playTapSfx = () => studioPop(600, 300, 0.1, 0.1)
export const playPopSfx = () => studioPop(400, 1000, 0.1, 0.2)
export const playSnapSfx = () => {
  studioPop(800, 1200, 0.1, 0.1)
  setTimeout(() => studioPop(400, 200, 0.1, 0.15), 50)
}

export const playCountSfx = (n = 1) => {
  const base = 440 + (n % 10) * 40
  magicChime(base, 0.3, 0.1)
}

export const playCorrectSfx = () => {
  magicChime(523.25, 0.8, 0.25)
  setTimeout(() => magicChime(659.25, 0.8, 0.2), 100)
  setTimeout(() => magicChime(783.99, 1.2, 0.15), 200)
}

export const playWrongSfx = () => {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(); osc.stop(ctx.currentTime + 0.3)
}

export const playWhooshSfx = () => {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(100, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(); osc.stop(ctx.currentTime + 0.3)
}

export const playSuccessSfx = () => {
  const notes = [523, 659, 784, 1047, 1318]
  notes.forEach((f, i) => setTimeout(() => magicChime(f, 1.5, 0.15), i * 150))
}

export const playStarSfx = () => {
  magicChime(880, 1.0, 0.2)
  setTimeout(() => magicChime(1567, 1.2, 0.1), 80)
}

export const playMagicSfx = () => {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]
  notes.forEach((f, i) => {
    setTimeout(() => magicChime(f, 0.8, 0.15), i * 100)
    setTimeout(() => magicChime(f * 2, 0.5, 0.05), i * 100 + 40)
  })
}
