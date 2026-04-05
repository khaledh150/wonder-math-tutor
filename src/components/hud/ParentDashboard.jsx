// ParentDashboard.jsx — Premium Analytics Overlay (V11.23.0)
import React from 'react'
import { motion } from 'framer-motion'
import useLevelStore from '../../store/useLevelStore'
import useLanguageStore from '../../store/useLanguageStore'
import { i18n } from '../../utils/i18n'
import { Star, BarChart3, Target, AlertCircle, X } from 'lucide-react'

const MetricCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="glass-panel-v2" style={{ padding: '3.5vmin', display: 'flex', flexDirection: 'column', gap: '1vmin', background: 'white', flex: 1, border: '0.4vmin solid white' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vmin', color: color }}>
        <Icon size="3.5vmin" />
        <span style={{ fontSize: '1.8vmin', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</span>
     </div>
     <div style={{ fontSize: '6.5vmin', fontWeight: 900, color: '#1e293b', fontFamily: 'var(--font-display)' }}>{value}</div>
     <div style={{ fontSize: '2vmin', color: '#64748b', fontWeight: 700 }}>{subValue}</div>
  </div>
)

const StruggleBar = ({ label, avg, color, unit }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vmin' }}>
     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '2.2vmin', fontWeight: 900, color: '#1e293b' }}>
        <span>{label}</span>
        <span style={{ color: color }}>{avg} {unit}</span>
     </div>
     <div style={{ height: '2.5vmin', background: '#f1f5f9', borderRadius: '1.2vmin', overflow: 'hidden', border: '0.3vmin solid #e2e8f0' }}>
        <motion.div 
           initial={{ width: 0 }} 
           animate={{ width: `${Math.min(avg * 20, 100)}%` }} // Scaled so 5 mistakes is "Full" caution
           transition={{ duration: 1.2, ease: "easeOut" }}
           style={{ height: '100%', background: color, boxShadow: 'inset 0 0.5vmin 1vmin rgba(255,255,255,0.3)' }}
        />
     </div>
  </div>
)

export default function ParentDashboard({ onClose }) {
  const { language } = useLanguageStore()
  const { completedLevels, analytics, getTotalStars } = useLevelStore()
  const t = i18n[language]

  // Stats calculation
  const totalLevels = 138
  const finishedLevels = Object.keys(completedLevels).length
  const totalStars = getTotalStars()
  const possibleStars = totalLevels * 3

  const opStats = [
    { id: 'addition', label: t.ADDITION, color: '#0ea5e9' },
    { id: 'subtraction', label: t.SUBTRACTION, color: '#f43f5e' },
    { id: 'multiplication', label: t.MULTIPLICATION, color: '#f59e0b' },
    { id: 'division', label: t.DIVISION, color: '#8b5cf6' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, background: 'rgba(240,249,255,0.98)', 
        zIndex: 9000, overflowY: 'auto', padding: '8vmin' 
      }}
    >
      <div style={{ maxWidth: '130vmin', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8vmin' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vmin' }}>
              <span style={{ fontSize: '1.8vmin', fontWeight: 900, color: 'var(--wk-purple)', letterSpacing: '0.4em' }}>WONDER ANALYTICS</span>
              <h1 className="text-hero" style={{ fontSize: '6.5vmin', color: 'var(--wk-purple-dark)', WebkitTextStroke: '0px' }}>{t.PARENT_TITLE}</h1>
           </div>
           <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              style={{ 
                width: '9vmin', height: '9vmin', borderRadius: '50%', background: 'white', 
                border: 'none', boxShadow: '0 1.5vmin 4vmin rgba(0,0,0,0.12)', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
            >
              <X size="4.5vmin" color="var(--wk-purple-dark)" strokeWidth={3} />
           </motion.button>
        </div>

        {/* Top Metric Row */}
        <div style={{ display: 'flex', gap: '4vmin', marginBottom: '6vmin' }}>
           <MetricCard 
              title={t.GLOBAL_PROGRESS} value={`${totalStars} / ${possibleStars}`} 
              subValue={t.STARS_EARNED} icon={Star} color="#f59e0b" 
           />
           <MetricCard 
              title={t.LEVELS_COMPLETED} value={`${finishedLevels} / ${totalLevels}`} 
              subValue={`${Math.round((finishedLevels / totalLevels) * 100)}% ${t.MISSION}`} icon={Target} color="var(--wk-blue-dark)" 
           />
        </div>

        {/* Struggle Areas (The Teacher Insight) */}
        <div className="glass-panel-v2" style={{ padding: '6vmin', background: 'white', border: '0.4vmin solid white', boxShadow: '0 2vmin 6vmin rgba(30,64,175,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5vmin', marginBottom: '5vmin' }}>
                <div style={{ padding: '1.5vmin', background: 'var(--wk-purple-soft)', borderRadius: '2vmin' }}>
                    <BarChart3 size="4.5vmin" color="var(--wk-purple)" />
                </div>
                <h2 style={{ fontSize: '3.5vmin', fontWeight: 900, color: '#1e293b', fontFamily: 'var(--font-display)' }}>{t.STRUGGLE_AREAS}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vmin' }}>
                {opStats.map(op => {
                   const stats = analytics?.[op.id] || { mistakes: 0, questions: 0 }
                   const avg = stats.questions > 0 ? (stats.mistakes / stats.questions).toFixed(1) : 0
                   return (
                      <StruggleBar key={op.id} label={op.label} avg={parseFloat(avg)} color={op.color} unit={t.AVG_MISTAKES} />
                   )
                })}
            </div>
            
            {(finishedLevels === 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ 
                  marginTop: '6vmin', padding: '4vmin', background: 'var(--wk-purple-soft)', 
                  borderRadius: '3vmin', display: 'flex', alignItems: 'center', gap: '3vmin' 
                }}
              >
                 <AlertCircle size="4.5vmin" color="var(--wk-purple)" />
                 <span style={{ fontSize: '2.2vmin', fontWeight: 800, color: 'var(--wk-purple-dark)' }}>{t.NO_DATA}</span>
              </motion.div>
            )}
        </div>

        {/* Privacy Note */}
        <div style={{ marginTop: '8vmin', textAlign: 'center', opacity: 0.3, fontSize: '1.6vmin', fontWeight: 700, color: '#64748b' }}>
            PRIVATE TUTORING DATA • V11.23.0 • WONDER ANALYTICS ENGINE
        </div>
      </div>
    </motion.div>
  )
}
