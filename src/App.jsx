import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Home as HomeIcon,
  BookOpen,
  BarChart3,
  Hexagon,
  User,
  NotebookPen,
  Flame,
  Heart,
  Sparkles,
  X,
  Star,
  Image as ImageIcon,
  Tag,
  Mic,
  Square,
  Trash2,
  Check,
  ChevronDown,
} from 'lucide-react'

import Entries from './Entries.jsx'
import Insights from './Insights.jsx'
import Desires from './Desires.jsx'
import Settings from './Settings.jsx'
import Onboarding from './Onboarding.jsx'

import { useLocalStorage } from './storage.js'
import { getWeekDates, formatEntryDate } from './dates.js'
import { getTodaysQuote, freeformPreset, quickActions, guidedPrompts, moods, TINTS, MOOD_TINTS } from './copy.js'

import './App.css'

/* ============================== Shared bits ============================== */
/* These are used from more than one place inside this file (Home + the
   composer/detail sheets that float above every tab), so they live here
   rather than in a separate components folder. */

function CatMascot({ size = 32, tone = 'dark' }) {
  const bodyColor = tone === 'light' ? 'var(--cream)' : 'var(--ink)'
  const eyeColor = tone === 'light' ? 'var(--ink)' : 'var(--cream)'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 8 L14 16 L20 13 L26 16 L29 8 L27 20 C27 26 24 29 20 29 C16 29 13 26 13 20 Z"
        fill={bodyColor}
      />
      <circle cx="16.5" cy="19.5" r="1.1" fill={eyeColor} />
      <circle cx="23.5" cy="19.5" r="1.1" fill={eyeColor} />
      <path d="M18.3 22.5c.5.6 1 .6 1.5 0" stroke={eyeColor} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14 21.5l-3 .3M14 23l-3.2 1.3M26 21.5l3 .3M26 23l3.2 1.3" stroke={bodyColor} strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

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

export function MoodFace({ mood = 'neutral', size = 24, strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth={strokeWidth}>
        {MOOD_FACE_PATHS[mood] || MOOD_FACE_PATHS.neutral}
      </g>
    </svg>
  )
}

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
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
      {actionLabel && (
        <button className="empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

/** Entry list + cards — used on Home (preview) and reused on the Entries tab. */
export function EntryList({ entries, onOpen, title, onSeeAll, emptyTitle, emptySubtitle }) {
  return (
    <section className="recent">
      <div className="recent__head">
        <h3>{title}</h3>
        {onSeeAll && entries.length > 0 && (
          <button className="link-btn" onClick={onSeeAll}>See all</button>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={NotebookPen} title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        <div className="recent__list">
          {entries.map((entry, i) => (
            <motion.button
              key={entry.id}
              className="entry-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
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
      )}
    </section>
  )
}

function NavBar({ active, onChange }) {
  const TABS = [
    { id: 'home', icon: HomeIcon },
    { id: 'entries', icon: BookOpen },
    { id: 'insights', icon: BarChart3 },
    { id: 'desires', icon: Hexagon },
  ]
  return (
    <nav className="navbar">
      {TABS.map(({ id, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            className="navbar__btn"
            aria-label={id}
            aria-current={isActive}
            onClick={() => onChange(id)}
          >
            {isActive && (
              <motion.span
                layoutId="navbar-pill"
                className="navbar__indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <Icon
              size={19}
              strokeWidth={2}
              className="navbar__icon"
              style={{ color: isActive ? 'var(--ink)' : 'var(--cream)' }}
            />
          </button>
        )
      })}
    </nav>
  )
}

function QuoteCard({ quote }) {
  return (
    <motion.div
      className="quote-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <div className="quote-card__eyebrow">
        <CatMascot size={22} tone="light" />
        <span>Quote of the day</span>
      </div>
      <p className="quote-card__text">&ldquo;{quote.text}&rdquo;</p>
      <span className="quote-card__author">— {quote.author}</span>
    </motion.div>
  )
}

function MoodTracker({ week, onLog, onSeeHistory }) {
  const [pickerOpenFor, setPickerOpenFor] = useState(null)

  return (
    <section className="mood-tracker">
      <div className="mood-tracker__head">
        <h3>Daily Mood Tracker</h3>
        <button className="link-btn" onClick={onSeeHistory}>See history</button>
      </div>

      <div className="mood-tracker__row">
        {week.map((slot) => (
          <div key={slot.key} className="mood-tracker__col">
            <motion.button
              className="mood-tracker__face"
              disabled={!slot.isToday}
              style={{
                background: slot.mood ? MOOD_TINTS[slot.mood] : 'var(--paper)',
                borderStyle: slot.mood ? 'solid' : 'dashed',
                opacity: !slot.isToday && !slot.mood ? 0.4 : 1,
                outline: slot.isToday ? '2px solid var(--sage-500)' : 'none',
                outlineOffset: 2,
                cursor: slot.isToday ? 'pointer' : 'default',
              }}
              whileTap={slot.isToday ? { scale: 0.88 } : {}}
              whileHover={slot.isToday ? { scale: 1.06 } : {}}
              onClick={() => slot.isToday && setPickerOpenFor(pickerOpenFor === slot.key ? null : slot.key)}
              aria-label={slot.isToday ? `Log mood for ${slot.day}` : `${slot.day} — not editable`}
            >
              {slot.mood ? (
                <MoodFace mood={slot.mood} size={22} />
              ) : slot.isToday ? (
                <span className="mood-tracker__plus">+</span>
              ) : null}
            </motion.button>
            <span className="mood-tracker__day">{slot.day}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {pickerOpenFor && (
          <motion.div
            className="mood-picker"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mood-picker__row">
              {moods.map((m) => (
                <motion.button
                  key={m.id}
                  className="mood-picker__item"
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    onLog(pickerOpenFor, m.id)
                    setPickerOpenFor(null)
                  }}
                >
                  <span className="mood-picker__face" style={{ background: MOOD_TINTS[m.id] }}>
                    <MoodFace mood={m.id} size={20} />
                  </span>
                  <span className="mood-picker__label">{m.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function QuickActions({ onSelect }) {
  const ICONS = { notebook: NotebookPen, flame: Flame, heart: Heart, butterfly: Sparkles }
  return (
    <div className="quick-actions">
      {quickActions.map((action, i) => {
        const Icon = ICONS[action.icon]
        return (
          <motion.button
            key={action.id}
            className="quick-actions__card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * i }}
            whileHover={{ y: -3, boxShadow: 'var(--shadow-lift)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(action)}
          >
            <span className="quick-actions__icon">
              <Icon size={18} strokeWidth={1.8} color="var(--ink)" />
            </span>
            <span className="quick-actions__title">{action.title}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

/** Full-screen composer sheet: write freely / guided reflection + voice-note mock. */
function JournalEntry({ preset, onClose, onSave }) {
  const [tab, setTab] = useState('write')
  const [guidedIndex, setGuidedIndex] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [starred, setStarred] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [transcribe, setTranscribe] = useState(false)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  const prompt = tab === 'write'
    ? preset?.prompt || "Hey, I'm here. Want to share what's been on your mind today?"
    : guidedPrompts[guidedIndex]

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRecording])

  function startRecording() {
    setSeconds(0)
    setRecorded(false)
    setIsRecording(true)
  }

  function stopRecording() {
    setIsRecording(false)
    setRecorded(true)
  }

  function removeRecording() {
    setRecorded(false)
    setSeconds(0)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => {
      onSave({ title: title || 'Untitled entry', body: body || prompt })
    }, 650)
  }

  return (
    <motion.div
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__header">
          <button className="sheet__date">
            Today, 10:39 <ChevronDown size={15} />
          </button>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="sheet__tabs">
          <button className={`sheet__tab ${tab === 'write' ? 'is-active' : ''}`} onClick={() => setTab('write')}>
            Write freely
          </button>
          <button className={`sheet__tab ${tab === 'guided' ? 'is-active' : ''}`} onClick={() => setTab('guided')}>
            Guided reflection
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={prompt}
            className="sheet__prompt"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <span className="sheet__prompt-avatar"><CatMascot size={26} /></span>
            <p>{prompt}</p>
          </motion.div>
        </AnimatePresence>

        {tab === 'guided' && (
          <button className="link-btn sheet__next-prompt" onClick={() => setGuidedIndex((i) => (i + 1) % guidedPrompts.length)}>
            Try another prompt
          </button>
        )}

        <input
          className="sheet__title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="sheet__body"
          placeholder="Add your thoughts..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <AnimatePresence>
          {(isRecording || recorded) && (
            <motion.div
              className="voice-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {isRecording ? (
                <div className="voice-panel__recording">
                  <span className="voice-panel__dot" />
                  <span>Recording…</span>
                  <span className="voice-panel__time">{formatTime(seconds)}</span>
                </div>
              ) : (
                <>
                  <p className="voice-panel__label">Voice Note Recorded</p>
                  <div className="voice-panel__actions">
                    <button className="voice-panel__remove" onClick={removeRecording}>
                      <Trash2 size={15} /> Remove
                    </button>
                    <div className="voice-panel__stopdot" />
                    <button className="voice-panel__save" onClick={() => {}}>
                      <Check size={15} /> Save
                    </button>
                  </div>
                  <span className="voice-panel__duration">{formatTime(seconds)}</span>
                  <div className="voice-panel__transcribe">
                    <span>Transcribe</span>
                    <button
                      className={`toggle ${transcribe ? 'is-on' : ''}`}
                      onClick={() => setTranscribe((t) => !t)}
                      aria-label="Toggle transcription"
                    >
                      <motion.span layout className="toggle__knob" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sheet__toolbar">
          <div className="sheet__toolbar-icons">
            <button className={`icon-btn ${starred ? 'is-active' : ''}`} onClick={() => setStarred((s) => !s)} aria-label="Star entry">
              <Star size={17} fill={starred ? 'var(--butter-dark)' : 'none'} />
            </button>
            <button className="icon-btn" aria-label="Add image">
              <ImageIcon size={17} />
            </button>
            <button className="icon-btn" aria-label="Add tag">
              <Tag size={17} />
            </button>
            <button
              className={`icon-btn ${isRecording ? 'is-recording' : ''}`}
              aria-label="Record voice note"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square size={15} /> : <Mic size={17} />}
            </button>
          </div>
          <motion.button className="save-btn" whileTap={{ scale: 0.94 }} onClick={handleSave} disabled={saved}>
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={16} /> Saved
                </motion.span>
              ) : (
                <motion.span key="save" exit={{ opacity: 0 }}>Save</motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Read-only view of a saved entry, with delete. */
function EntryDetail({ entry, onClose, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <motion.div
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__header">
          <span className="sheet__date">{formatEntryDate(entry.createdAt)}</span>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="detail__tag-row">
          <span className="entry-card__tag" style={{ background: TINTS[entry.tint] }}>
            {entry.tag}
          </span>
          {entry.mood && (
            <span className="detail__mood" style={{ background: TINTS[entry.tint] }}>
              <MoodFace mood={entry.mood} size={16} />
            </span>
          )}
        </div>

        <h2 className="detail__title">{entry.title}</h2>
        <p className="detail__body">{entry.body}</p>

        <div className="detail__footer">
          {confirming ? (
            <div className="detail__confirm">
              <span>Delete this entry?</span>
              <button className="detail__confirm-yes" onClick={() => onDelete(entry.id)}>Delete</button>
              <button className="detail__confirm-no" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button className="detail__delete" onClick={() => setConfirming(true)}>
              <Trash2 size={15} /> Delete entry
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ================================ App root ================================ */

export default function App() {
  const [profile, setProfile] = useLocalStorage('solace_profile', { name: '', onboarded: false })
  const [entries, setEntries] = useLocalStorage('solace_entries', [])
  const [moods, setMoods] = useLocalStorage('solace_moods', {})
  const [desires, setDesires] = useLocalStorage('solace_desires', [])

  const [tab, setTab] = useState('home')
  const [composerPreset, setComposerPreset] = useState(null)
  const [viewingEntry, setViewingEntry] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!profile.onboarded) {
    return <Onboarding onComplete={(name) => setProfile({ name, onboarded: true })} />
  }

  const week = getWeekDates().map((d) => ({ ...d, mood: moods[d.key] || null }))
  const quote = getTodaysQuote()
  const greetingName = profile.name ? profile.name : 'there'

  function handleLogMood(dateKey, moodId) {
    setMoods((prev) => ({ ...prev, [dateKey]: moodId }))
  }

  function handleSaveEntry({ title, body }) {
    const entry = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      tag: composerPreset?.tag || 'Free write',
      tint: composerPreset?.tint || 'sage',
      mood: composerPreset?.mood || null,
      title,
      body,
    }
    setEntries((prev) => [entry, ...prev])
    setComposerPreset(null)
  }

  function handleDeleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setViewingEntry(null)
  }

  function handleResetData() {
    setEntries([])
    setMoods({})
    setDesires([])
    setSettingsOpen(false)
  }

  const screens = {
    home: (
      <div className="home-screen">
        <div className="home-hero">
          <div className="home-hero__inner">
            <motion.header
              className="home-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1>
                Hi, {greetingName} <span className="wave">👋</span>
              </h1>
              <button className="round-btn" aria-label="Account" onClick={() => setSettingsOpen(true)}>
                <User size={16} />
              </button>
            </motion.header>

            <div className="home-hero__divider" />

            <QuoteCard quote={quote} />
          </div>
        </div>

        <div className="home-body">
          <MoodTracker week={week} onLog={handleLogMood} onSeeHistory={() => setTab('insights')} />
          <QuickActions onSelect={setComposerPreset} />
          <EntryList
            entries={entries.slice(0, 3)}
            onOpen={setViewingEntry}
            onSeeAll={() => setTab('entries')}
            title="Recent Entries"
            emptyTitle="No entries yet"
            emptySubtitle="Use a quick action above to write your first one."
          />
        </div>
      </div>
    ),
    entries: (
      <Entries
        entries={entries}
        onOpen={setViewingEntry}
        onNew={() => setComposerPreset(freeformPreset)}
      />
    ),
    insights: <Insights entries={entries} moods={moods} />,
    desires: <Desires desires={desires} setDesires={setDesires} />,
  }

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="app-content"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {screens[tab]}
        </motion.div>
      </AnimatePresence>

      <NavBar active={tab} onChange={setTab} />

      <AnimatePresence>
        {composerPreset && (
          <JournalEntry preset={composerPreset} onClose={() => setComposerPreset(null)} onSave={handleSaveEntry} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingEntry && (
          <EntryDetail entry={viewingEntry} onClose={() => setViewingEntry(null)} onDelete={handleDeleteEntry} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <Settings
            profile={profile}
            setProfile={setProfile}
            onClose={() => setSettingsOpen(false)}
            onResetData={handleResetData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
