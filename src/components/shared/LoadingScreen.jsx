import React from 'react'
import { motion } from 'framer-motion'
import PipCat from '../characters/PipCat'

export default function LoadingScreen({ message = "Loading...", onComplete }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="animate-float" style={{ marginBottom: '5vmin' }}>
        <PipCat size="25vmin" mood="thinking" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vmin' }}>
        <h2 className="text-hero" style={{ fontSize: '4vmin', color: 'var(--wk-purple-dark)', WebkitTextStroke: '0px' }}>
          {message}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          >.</motion.span>
        </h2>
        
        {/* Animated Progress Track */}
        <div style={{ 
          width: '40vmin', height: '2vmin', background: 'rgba(0,0,0,0.1)', 
          borderRadius: '1vmin', overflow: 'hidden', border: '0.4vmin solid white' 
        }}>
          <motion.div 
            animate={{ x: [-200, 400] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{ 
              width: '50%', height: '100%', 
              background: 'linear-gradient(90deg, transparent, var(--wk-green), transparent)',
              borderRadius: 'inherit'
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}
