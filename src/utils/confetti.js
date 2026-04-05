// Celebration Effects — Canvas Confetti
import confettiLib from 'canvas-confetti'

const COLORS = ['#7C3AED', '#FBBF24', '#F97316', '#EC4899', '#22C55E', '#4FC3F7', '#FF6B81', '#A78BFA']

// Big celebration burst — used on stage completion
export const triggerSuccessConfetti = () => {
  confettiLib({
    particleCount: 150,
    spread: 100,
    origin: { x: 0.2, y: 0.8 },
    colors: COLORS,
    gravity: 0.5,
    scalar: 1.2
  })
  setTimeout(() => {
    confettiLib({
      particleCount: 150,
      spread: 100,
      origin: { x: 0.8, y: 0.8 },
      colors: COLORS,
      gravity: 0.5,
      scalar: 1.2
    })
  }, 200)
  setTimeout(() => {
    confettiLib({
      particleCount: 120,
      spread: 180,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FDE68A', '#FFF'], 
      gravity: 0.4,
      ticks: 400,
      scalar: 2
    })
  }, 500)
}

export const triggerCelebration = () => triggerSuccessConfetti()


// Small burst for correct answers
export function triggerSmallBurst() {
  confettiLib({
    particleCount: 30,
    spread: 50,
    origin: { x: 0.5, y: 0.5 },
    colors: COLORS,
    gravity: 1.2,
  })
}

// Burst from a specific screen position
export function triggerBurstAt(x, y) {
  confettiLib({
    particleCount: 25,
    spread: 40,
    origin: { x, y },
    colors: COLORS,
    startVelocity: 20,
    gravity: 0.8,
  })
}
