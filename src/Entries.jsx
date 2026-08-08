import { motion } from 'framer-motion'
import { Plus, NotebookPen } from 'lucide-react'
import { TINTS } from './copy.js'
import { formatEntryDate } from './dates.js'

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

export default function Entries({ entries, onOpen, onNew }) {
  return (
    <div className="screen">
      <header className="section-header">
        <div>
          <p className="home-header__eyebrow">Your journal</p>
          <h1>All Entries</h1>
        </div>
        <button className="round-btn round-btn--accent" onClick={onNew} aria-label="New entry">
          <Plus size={17} />
        </button>
      </header>

      {entries.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No entries yet"
          subtitle="Tap the + above to write your first one."
        />
      ) : (
        <section className="recent">
          <div className="recent__head">
            <h3>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</h3>
          </div>
          <div className="recent__list">
            {entries.map((entry, i) => (
              <motion.button
                key={entry.id}
                className="entry-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * i }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-lift)' }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onOpen(entry)}
              >
                <div className="entry-card__top">
                  <span className="entry-card__date">{formatEntryDate(entry.createdAt)}</span>
                  <span className="entry-card__tag" style={{ background: TINTS[entry.tint] }}>
                    {entry.tag}
                  </span>
                </div>
                <h4 className="entry-card__title">{entry.title}</h4>
                <p className="entry-card__body">{entry.body}</p>
                {entry.mood && (
                  <div className="entry-card__mood" style={{ background: TINTS[entry.tint] }}>
                    <MoodFace mood={entry.mood} size={16} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
