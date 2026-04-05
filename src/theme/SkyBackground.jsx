import React, { useEffect, useRef } from 'react'
import Lottie from 'lottie-react'
import { motion } from 'framer-motion'

import blueSkyUrl from '../assets/backgrounds/sky/blue-sky.webp'
import cloud1Url from '../assets/backgrounds/sky/cloud-1.webp'
import cloud2Url from '../assets/backgrounds/sky/cloude-2.webp'
import cloudSmallUrl from '../assets/backgrounds/sky/cloud-small.webp'

import bird1 from '../assets/materials/flying-birds/bird-flying-1.json'
import bird2 from '../assets/materials/flying-birds/bird-flying-2.json'
import bird3 from '../assets/materials/flying-birds/bird-flying-3.json'
import bird4 from '../assets/materials/flying-birds/bird-flying-4.json'
import bird5 from '../assets/materials/flying-birds/bird-flying-5.json'
import bird6 from '../assets/materials/flying-birds/bird-flying-6.json'

const BIRDS = [bird1, bird2, bird3, bird4, bird5, bird6]

const CLOUD_LANES = [
  { src: 'cloud1', topPct: 3,  speed: 120, widthCss: 'clamp(150px, 20vw, 280px)', opacity: 0.9, startPct: 0.05 },
  { src: 'small',  topPct: 8,  speed: 160, widthCss: 'clamp(100px, 12vw, 150px)',  opacity: 0.7, startPct: 0.55 },
  { src: 'cloud2', topPct: 15, speed: 140, widthCss: 'clamp(140px, 18vw, 250px)', opacity: 0.8, startPct: 0.3 },
  { src: 'cloud1', topPct: 22, speed: 180, widthCss: 'clamp(110px, 15vw, 190px)', opacity: 0.6, startPct: 0.75 },
  { src: 'small',  topPct: 32, speed: 150, widthCss: 'clamp(120px, 16vw, 200px)', opacity: 0.7, startPct: 0.15 },
  { src: 'cloud2', topPct: 40, speed: 200, widthCss: 'clamp(130px, 17vw, 220px)', opacity: 0.6, startPct: 0.6 },
]

const CLOUD_SRC_MAP = { cloud1: cloud1Url, cloud2: cloud2Url, small: cloudSmallUrl }

const BIRD_LANES = [
  { birdIdx: 0, yPct: 10, speed: 30, size: 90, goRight: true,  startPct: 0.1 },
  { birdIdx: 2, yPct: 25, speed: 40, size: 90, goRight: false, startPct: 0.6 },
  { birdIdx: 4, yPct: 45, speed: 25, size: 90, goRight: true,  startPct: 0.4 },
  { birdIdx: 5, yPct: 70, speed: 32, size: 90, goRight: true,  startPct: 0.8 },
]

const SkyClouds = () => {
  const containerRef = useRef(null)
  const cloudsRef = useRef(CLOUD_LANES.map(l => ({ ...l, x: 0, elWidth: 150 })))
  const cloudEls = useRef([])
  const rafRef = useRef()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let running = true

    requestAnimationFrame(() => {
      const W = el.offsetWidth || window.innerWidth
      cloudsRef.current.forEach((c, i) => {
        const dom = cloudEls.current[i]
        c.elWidth = dom ? dom.offsetWidth : 150
        c.x = c.startPct * (W + c.elWidth)
      })
    })

    let lastTime = performance.now()
    const tick = (now) => {
      if (!running) return
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const W = el.offsetWidth || window.innerWidth

      cloudsRef.current.forEach((c, i) => {
        const pxPerSec = W / c.speed
        c.x -= pxPerSec * dt
        if (c.x < -c.elWidth) c.x = W + Math.random() * 50
        const dom = cloudEls.current[i]
        if (dom) dom.style.transform = `translate3d(${c.x}px, 0, 0)`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {CLOUD_LANES.map((lane, i) => (
        <img
          key={i}
          ref={el => { cloudEls.current[i] = el }}
          src={CLOUD_SRC_MAP[lane.src]}
          alt=""
          style={{
            position: 'absolute', top: `${lane.topPct}%`, width: lane.widthCss,
            opacity: lane.opacity, willChange: 'transform'
          }}
        />
      ))}
    </div>
  )
}

const SkyBirds = () => {
  const containerRef = useRef(null)
  const birdsRef = useRef(BIRD_LANES.map(l => ({ ...l, x: 0 })))
  const birdEls = useRef([])
  const rafRef = useRef()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let running = true
    const W = el.offsetWidth || window.innerWidth
    birdsRef.current.forEach(b => {
      b.x = b.goRight ? -b.size + b.startPct * (W + b.size * 2) : W + b.size - b.startPct * (W + b.size * 2)
    })

    let lastTime = performance.now()
    const tick = (now) => {
      if (!running) return
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const W = el.offsetWidth || window.innerWidth
      birdsRef.current.forEach((b, i) => {
        const pxPerSec = W / b.speed
        b.x += b.goRight ? pxPerSec * dt : -pxPerSec * dt
        if (b.goRight && b.x > W + b.size * 2) b.x = -b.size * 2
        if (!b.goRight && b.x < -b.size * 2) b.x = W + b.size * 2
        const dom = birdEls.current[i]
        if (dom) dom.style.transform = `translate3d(${b.x}px, 0, 0) scaleX(${b.goRight ? 1 : -1})`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {BIRD_LANES.map((lane, i) => (
        <div key={i} ref={el => { birdEls.current[i] = el }} className="absolute" style={{ top: `${lane.yPct}%`, width: `${lane.size}px`, height: `${lane.size}px` }}>
          <Lottie animationData={BIRDS[lane.birdIdx]} loop autoplay style={{ width: '100%', height: '100%' }} />
        </div>
      ))}
    </div>
  )
}

export const SkyFullBackground = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
    <img src={blueSkyUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    <SkyClouds />
    <SkyBirds />
  </div>
)
