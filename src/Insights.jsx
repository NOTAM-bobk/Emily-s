import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { computeStreak, weeklyActivity, topTag } from './dates.js'

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={22} strokeWidth={1.6} />
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    </motion.div>
  )
}

export default function Insights({ entries }) {
  const streak = computeStreak(entries)
  const activity = weeklyActivity(entries)
  const maxCount = Math.max(1, ...activity.map((a) => a.count))
  const tag = topTag(entries)

  return (
    <div className="screen">
      <header className="section-header">
        <p className="home-header__eyebrow">Your patterns</p>
        <h1>Insights</h1>
      </header>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__num">{streak}</span>
          <span className="stat-card__label">day streak</span>
        </div>
        <div className="stat-card stat-card--coral">
          <span className="stat-card__num">{entries.length}</span>
          <span className="stat-card__label">entries logged</span>
        </div>
        <div className="stat-card stat-card--lavender">
          <span className="stat-card__num stat-card__num--small">{tag || '—'}</span>
          <span className="stat-card__label">most common tag</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nothing to show yet"
          subtitle="Once you log a few entries, your patterns will show up here."
        />
      ) : (
        <div className="chart-card">
          <h3>Writing activity this week</h3>
          <div className="chart">
            {activity.map((a, i) => (
              <div className="chart__col" key={a.day}>
                <motion.div
                  className="chart__bar"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(6, (a.count / maxCount) * 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                />
                <span>{a.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
