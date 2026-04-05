/**
 * tts.js — Bilingual Voiceover Engine V16
 * Cloned from soroban-school QuizPage.jsx (proven to work for Thai + English)
 */

import useAudioStore from '../store/useAudioStore'

// Force voice loading on startup
if (typeof window !== 'undefined') {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}

const getBestVoice = (langCode) => {
  const allVoices = window.speechSynthesis.getVoices()
  const preferred = langCode === 'th'
    ? ['Kanya', 'Narisa', 'Premwadee', 'Niwat']
    : ['Google US English', 'Samantha', 'Microsoft Zira']
  for (const name of preferred) {
    const found = allVoices.find(v => v.name.includes(name))
    if (found) return found
  }
  const langTag = langCode === 'th' ? 'th' : 'en'
  return allVoices.find(v => v.lang.startsWith(langTag)) || null
}

export const speak = (text, lang = 'en') => {
  const { voiceEnabled } = useAudioStore.getState()
  if (!voiceEnabled || !text) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang === 'th' ? 'th-TH' : 'en-US'
  utterance.rate = lang === 'th' ? 0.9 : 0.95
  utterance.pitch = lang === 'th' ? 1.0 : 1.15
  utterance.volume = 1

  const bestVoice = getBestVoice(lang)
  if (bestVoice) utterance.voice = bestVoice

  window.speechSynthesis.speak(utterance)
}

export const stopSpeaking = () => {
  window.speechSynthesis.cancel()
}
