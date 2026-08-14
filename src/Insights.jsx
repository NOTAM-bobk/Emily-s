import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Flame,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Lightbulb,
  Sparkles,
  Heart,
  Type as TypeIcon,
  Tag as TagIcon,
} from 'lucide-react'
import { computeStreak, weeklyActivity, topTag, formatEntryDate } from './dates.js'
import { moods, MOOD_TINTS, TINTS } from './copy.js'

/* ============================== Local helpers ============================== */
/* Insights owns its own mood-face renderer and stat math so this screen stays
   self-contained — it doesn't need App.jsx to change to grow. */

const MOOD_FACE_PATHS = {
  happy: (
    <>
      <path d="M9 14c1 1.4 2.4 2.1 4 2.1s3-.7 4-2.1" strokeLinecap="round" />
      <path d="M9.5 9.5c.4-.5.9-.5 1.3 0" strokeLinecap="round" />
      <path d="M13.2 9.5c.4-.5.9-.5 1.3 0" strokeLinecap="round" />
    </>
  ),
  content: (
    <>
      <path d="M9 15c1 1 2.4 1.6 4 1.6s3-.6 4-1.6" strokeLinecap="round" />
      <path d="M8.8 9.6c.9-.7 1.9-.7 2.2 0" strokeLinecap="round" />
      <path d="M13 9.6c.9-.7 1.9-.7 2.2 0" strokeLinecap="round" />
    </>
  ),
  neutral: (
    <>
      <path d="M9 15h8" strokeLinecap="round" />
      <path d="M9 10h2.4" strokeLinecap="round" />
      <path d="M12.6 10H15" strokeLinecap="round" />
    </>
  ),
  calm: (
    <>
      <path d="M9 15c1 .6 2.4 1 4 1s3-.4 4-1" strokeLinecap="round" />
      <path d="M8.8 10c.9-.6 1.9-.6 2.2 0" strokeLinecap="round" />
      <path d="M13 10c.9-.6 1.9-.6 2.2 0" strokeLinecap="round" />
    </>
  ),
  sad: (
    <>
      <path d="M9 16.4c1-1.1 2.4-1.7 4-1.7s3 .6 4 1.7" strokeLinecap="round" />
      <path d="M9.5 10.3c.4.5.9.5 1.3 0" strokeLinecap="round" />
      <path d="M13.2 10.3c.4.5.9.5 1.3 0" strokeLinecap="round" />
    </>
  ),
}

function MoodFace({ mood = 'neutral', size = 24, strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth={strokeWidth}>
        {MOOD_FACE_PATHS[mood] || MOOD_FACE_PATHS.neutral}
      </g>
    </svg>
  )
}

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

const DAY_MS = 86400000

// A rough valence scale just for plotting mood on a line — not a clinical
// measure, just enough to show "up" vs "down" days at a glance.
const MOOD_VALUE = { happy: 2, content: 1.2, calm: 0.5, neutral: 0, sad: -1.8 }

function moodLabel(id) {
  const match = moods?.find((m) => m.id === id)
  if (match?.label) return match.label
  return id ? id[0].toUpperCase() + id.slice(1) : 'Neutral'
}

function getWordCount(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

function computeWordStats(entries) {
  if (entries.length === 0) return { total: 0, avg: 0, longest: 0 }
  const counts = entries.map((e) => getWordCount(e.body))
  const total = counts.reduce((a, b) => a + b, 0)
  return { total, avg: Math.round(total / entries.length), longest: Math.max(...counts) }
}

function computeMoodTimeline(entries, limit = 10) {
  const withMood = entries.filter((e) => e.mood && MOOD_VALUE[e.mood] !== undefined)
  const sorted = withMood.slice().sort((a, b) => a.createdAt - b.createdAt)
  return sorted.slice(-limit).map((e) => ({
    id: e.id,
    createdAt: e.createdAt,
    mood: e.mood,
    value: MOOD_VALUE[e.mood],
  }))
}

function computeMoodMix(entries) {
  const counts = {}
  entries.forEach((e) => {
    if (!e.mood) return
    counts[e.mood] = (counts[e.mood] || 0) + 1
  })
  return Object.entries(counts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
}

const TAG_FALLBACK_COLORS = ['var(--sage-500)', 'var(--coral-dark)', 'var(--lavender-dark)', 'var(--butter-dark)', 'var(--sage-300)', 'var(--ink-faint)']

function computeTagBreakdown(entries, limit = 5) {
  const seenTint = {}
  const counts = {}
  entries.forEach((e) => {
    const tag = e.tag || 'Untagged'
    counts[tag] = (counts[tag] || 0) + 1
    if (!seenTint[tag]) seenTint[tag] = e.tint
  })
  const total = entries.length || 1
  return Object.entries(counts)
    .map(([tag, count], i) => ({
      tag,
      count,
      pct: Math.round((count / total) * 100),
      color: TINTS[seenTint[tag]] || TAG_FALLBACK_COLORS[i % TAG_FALLBACK_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

const TIME_BUCKETS = [
  { id: 'morning', label: 'Morning', icon: Sunrise, range: [5, 11] },
  { id: 'afternoon', label: 'Afternoon', icon: Sun, range: [12, 16] },
  { id: 'evening', label: 'Evening', icon: Sunset, range: [17, 21] },
  { id: 'night', label: 'Night', icon: Moon, range: [22, 4] },
]

function computeTimeOfDay(entries) {
  const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  entries.forEach((e) => {
    const hour = new Date(e.createdAt).getHours()
    const bucket = TIME_BUCKETS.find(({ range: [start, end] }) =>
      start <= end ? hour >= start && hour <= end : hour >= start || hour <= end
    )
    if (bucket) counts[bucket.id] += 1
  })
  const total = entries.length || 1
  return TIME_BUCKETS.map((b) => ({ ...b, count: counts[b.id], pct: Math.round((counts[b.id] / total) * 100) }))
}

function computeGapStats(entries) {
  if (entries.length === 0) return { daysSinceLast: null, longestGap: 0 }
  const sorted = entries.slice().sort((a, b) => a.createdAt - b.createdAt)
  let longestGap = 0
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round((sorted[i].createdAt - sorted[i - 1].createdAt) / DAY_MS)
    if (gap > longestGap) longestGap = gap
  }
  const daysSinceLast = Math.floor((Date.now() - sorted[sorted.length - 1].createdAt) / DAY_MS)
  return { daysSinceLast, longestGap }
}

function buildTips({ entries, streak, wordStats, moodMix, timeOfDay, tagBreakdown, gap }) {
  if (entries.length === 0) {
    return [{ icon: Sparkles, text: 'Write your first entry to start seeing your patterns here.' }]
  }

  const tips = []

  if (streak >= 3) {
    tips.push({ icon: Flame, text: `You're on a ${streak}-day streak — keep it going, even a short entry counts.` })
  }

  if (gap.daysSinceLast !== null && gap.daysSinceLast >= 4) {
    tips.push({
      icon: Clock,
      text: `It's been ${gap.daysSinceLast} days since your last entry. A couple of lines is enough to pick it back up.`,
    })
  }

  const topBucket = timeOfDay.slice().sort((a, b) => b.count - a.count)[0]
  if (topBucket && topBucket.count >= 2) {
    tips.push({
      icon: topBucket.icon,
      text: `You write most often in the ${topBucket.label.toLowerCase()} — that seems to be when reflection comes easiest for you.`,
    })
  }

  if (moodMix.length > 0) {
    const top = moodMix[0]
    if (['happy', 'content', 'calm'].includes(top.id) && top.count >= 2) {
      tips.push({
        icon: Sparkles,
        text: `Your mood check-ins have leaned ${moodLabel(top.id).toLowerCase()} lately — ${top.count} entries and counting.`,
      })
    } else if (top.id === 'sad' && top.count >= 2) {
      tips.push({
        icon: Heart,
        text: 'A few recent entries have felt heavier. Journaling helps — so does leaning on someone you trust.',
      })
    }
  }

  if (wordStats.avg > 0 && wordStats.avg < 25 && entries.length >= 3) {
    tips.push({
      icon: TypeIcon,
      text: 'Your entries tend to be short — try adding one more detail or feeling next time you write.',
    })
  }

  if (tagBreakdown.length > 0 && entries.length >= 4 && tagBreakdown[0].pct >= 60) {
    tips.push({
      icon: TagIcon,
      text: `Most entries are tagged "${tagBreakdown[0].tag}" — a guided prompt could be a nice change of pace.`,
    })
  }

  if (tips.length === 0) {
    tips.push({ icon: Sparkles, text: 'Keep journaling regularly to unlock more patterns and insights here.' })
  }

  return tips.slice(0, 4)
}

/* ============================== Mood line chart ============================== */

const CHART_W = 300
const CHART_H = 108
const PAD_X = 12
const PAD_Y = 16

function MoodChart({ timeline }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const points = useMemo(() => {
    const n = timeline.length
    if (n === 0) return []
    const usableW = CHART_W - PAD_X * 2
    const usableH = CHART_H - PAD_Y * 2
    return timeline.map((t, i) => {
      const x = n === 1 ? CHART_W / 2 : PAD_X + (usableW * i) / (n - 1)
      const norm = (t.value + 2) / 4 // domain -2..2 -> 0..1
      const y = PAD_Y + usableH * (1 - norm)
      return { ...t, x, y }
    })
  }, [timeline])

  if (points.length === 0) {
    return <p className="chart-card__hint">Add a mood to your entries and this will fill in with how you've been feeling over time.</p>
  }

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const effectiveIndex = activeIndex !== null && activeIndex < points.length ? activeIndex : points.length - 1
  const activePoint = points[effectiveIndex]

  return (
    <>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="mood-chart__svg">
        <line x1={PAD_X} y1={CHART_H / 2} x2={CHART_W - PAD_X} y2={CHART_H / 2} className="mood-chart__midline" />
        <motion.path
          d={pathD}
          fill="none"
          stroke="var(--sage-500)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        {points.map((p, i) => (
          <g
            key={p.id}
            className="mood-chart__point"
            onClick={() => setActiveIndex(i)}
            role="button"
            aria-label={`${moodLabel(p.mood)} on ${formatEntryDate(p.createdAt)}`}
          >
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={i === effectiveIndex ? 5.5 : 3.5}
              fill={i === effectiveIndex ? 'var(--coral-dark)' : 'var(--sage-600)'}
              stroke="var(--paper)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.35 + i * 0.03, duration: 0.25 }}
            />
          </g>
        ))}
      </svg>

      <div className="mood-chart__caption">
        <span className="mood-chart__caption-face" style={{ background: MOOD_TINTS[activePoint.mood] }}>
          <MoodFace mood={activePoint.mood} size={14} />
        </span>
        <span className="mood-chart__caption-text">
          <strong>{moodLabel(activePoint.mood)}</strong> · {formatEntryDate(activePoint.createdAt)}
        </span>
      </div>
    </>
  )
}

/* ================================== Insights ================================== */

export default function Insights({ entries }) {
  const [activeDayIndex, setActiveDayIndex] = useState(null)

  const streak = computeStreak(entries)
  const activity = weeklyActivity(entries)
  const maxCount = Math.max(1, ...activity.map((a) => a.count))
  const tag = topTag(entries)

  const wordStats = useMemo(() => computeWordStats(entries), [entries])
  const moodTimeline = useMemo(() => computeMoodTimeline(entries), [entries])
  const moodMix = useMemo(() => computeMoodMix(entries), [entries])
  const tagBreakdown = useMemo(() => computeTagBreakdown(entries), [entries])
  const timeOfDay = useMemo(() => computeTimeOfDay(entries), [entries])
  const gap = useMemo(() => computeGapStats(entries), [entries])
  const tips = useMemo(
    () => buildTips({ entries, streak, wordStats, moodMix, timeOfDay, tagBreakdown, gap }),
    [entries, streak, wordStats, moodMix, timeOfDay, tagBreakdown, gap]
  )

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
        <>
          <div className="stat-row">
            <div className="stat-card stat-card--butter">
              <span className="stat-card__num">{wordStats.total.toLocaleString()}</span>
              <span className="stat-card__label">words written</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__num">{wordStats.avg}</span>
              <span className="stat-card__label">avg words / entry</span>
            </div>
          </div>

          <div className="chart-card">
            <h3>Mood over time</h3>
            <MoodChart timeline={moodTimeline} />
            {moodMix.length > 0 && (
              <div className="mood-mix">
                {moodMix.map((m) => (
                  <div className="mood-mix__item" key={m.id}>
                    <span className="mood-mix__face" style={{ background: MOOD_TINTS[m.id] }}>
                      <MoodFace mood={m.id} size={13} />
                    </span>
                    <span className="mood-mix__count">{m.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chart-card">
            <h3>Writing activity this week</h3>
            <div className="chart">
              {activity.map((a, i) => {
                const isActive = activeDayIndex === i
                return (
                  <button
                    type="button"
                    className={`chart__col${isActive ? ' is-active' : ''}`}
                    key={a.day}
                    onClick={() => setActiveDayIndex(isActive ? null : i)}
                    aria-label={`${a.day}: ${a.count} ${a.count === 1 ? 'entry' : 'entries'}`}
                  >
                    {isActive && (
                      <motion.span
                        className="chart__tooltip"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {a.count} {a.count === 1 ? 'entry' : 'entries'}
                      </motion.span>
                    )}
                    <motion.div
                      className="chart__bar"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(6, (a.count / maxCount) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                    />
                    <span>{a.day}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="insights-grid">
            <div className="chart-card">
              <h3>Where your entries go</h3>
              <div className="tag-breakdown">
                {tagBreakdown.map((t, i) => (
                  <motion.div
                    className="tag-breakdown__row"
                    key={t.tag}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <div className="tag-breakdown__head">
                      <span className="tag-breakdown__name">{t.tag}</span>
                      <span className="tag-breakdown__pct">{t.pct}%</span>
                    </div>
                    <div className="tag-breakdown__track">
                      <motion.div
                        className="tag-breakdown__fill"
                        style={{ background: t.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${t.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.05 * i, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>When you write</h3>
              <div className="time-of-day">
                {timeOfDay.map((b, i) => (
                  <div className="time-of-day__row" key={b.id}>
                    <span className="time-of-day__icon">
                      <b.icon size={15} strokeWidth={1.7} />
                    </span>
                    <span className="time-of-day__label">{b.label}</span>
                    <div className="time-of-day__track">
                      <motion.div
                        className="time-of-day__fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.05 * i, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="time-of-day__count">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tips-card">
            <h3>
              <Lightbulb size={15} strokeWidth={1.8} /> Worth noticing
            </h3>
            <div className="tips-list">
              {tips.map((tipItem, i) => (
                <motion.div
                  className="tips-list__item"
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.3 }}
                >
                  <span className="tips-list__icon">
                    <tipItem.icon size={14} strokeWidth={1.8} />
                  </span>
                  <p>{tipItem.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
