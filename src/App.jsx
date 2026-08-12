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
  Tag as TagIcon,
  Mic,
  Square,
  Trash2,
  Check,
  ChevronDown,
  Plus,
  FileText,
} from 'lucide-react'

import Entries from './Entries.jsx'
import Insights from './Insights.jsx'
import Desires from './Desires.jsx'
import Settings from './Settings.jsx'
import Onboarding from './Onboarding.jsx'

import { useLocalStorage } from './storage.js'
import {
  formatEntryDate,
  formatComposerDateTime,
  defaultEntryTitle,
  toDateTimeLocalValue,
  fromDateTimeLocalValue,
  sortEntriesForDisplay,
} from './dates.js'
import {
  getTodaysQuote,
  freeformPreset,
  quickActions,
  guidedPrompts,
  moods,
  MOOD_TINTS,
  presetTags,
  TINTS,
} from './copy.js'

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
                <span className="entry-card__date">
                  {entry.starred && <Star size={11} className="entry-card__star" fill="var(--butter-dark)" />}
                  {formatEntryDate(entry.createdAt)}
                </span>
                <span className="entry-card__tag" style={{ background: TINTS[entry.tint] }}>
                  {entry.tag}
                </span>
              </div>
              <h4 className="entry-card__title">{entry.title}</h4>
              <p className="entry-card__body">{entry.body}</p>

              {entry.tags?.length > 0 && (
                <div className="entry-card__tags">
                  {entry.tags.slice(0, 3).map((t) => (
                    <span key={t} className="tag-chip tag-chip--small">{t}</span>
                  ))}
                </div>
              )}

              {entry.mood && (
                <div
                  className="entry-card__mood"
                  style={{ background: MOOD_TINTS[entry.mood] || TINTS[entry.tint] }}
                >
                  <MoodFace mood={entry.mood} size={16} />
                </div>
              )}

              {(entry.attachments?.length > 0 || entry.voiceNote) && (
                <div className="entry-card__meta">
                  {entry.attachments?.length > 0 && (
                    <span className="entry-card__meta-item">
                      <ImageIcon size={11} /> {entry.attachments.length}
                    </span>
                  )}
                  {entry.voiceNote && (
                    <span className="entry-card__meta-item">
                      <Mic size={11} />
                    </span>
                  )}
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
              <Icon size={19} strokeWidth={1.8} color="var(--ink)" />
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

/** Full-screen composer sheet: editable date/time + mood, write freely / guided
    reflection, attachments, tags, and a real microphone-backed voice note. */
function JournalEntry({ preset, onClose, onSave, customTags, onAddCustomTag }) {
  const [tab, setTab] = useState('write')
  const [guidedIndex, setGuidedIndex] = useState(0)

  const [entryDate, setEntryDate] = useState(() => new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [mood, setMood] = useState(preset?.mood || 'neutral')
  const [moodPickerOpen, setMoodPickerOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [starred, setStarred] = useState(false)

  const [tags, setTags] = useState([])
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [newTagDraft, setNewTagDraft] = useState('')

  const [attachments, setAttachments] = useState([])

  const [isRecording, setIsRecording] = useState(false)
  const [voiceNote, setVoiceNote] = useState(null)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [micError, setMicError] = useState('')

  const [saved, setSaved] = useState(false)

  const titleRef = useRef(null)
  const bodyRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const micStreamRef = useRef(null)
  const timerRef = useRef(null)

  const prompt = tab === 'write'
    ? preset?.prompt || "Hey, I'm here. Want to share what's been on your mind today?"
    : guidedPrompts[guidedIndex]

  const smartTitle = defaultEntryTitle(entryDate)
  const allTags = [...presetTags, ...customTags.filter((t) => !presetTags.includes(t))]

  // Keyboard opens straight into the title field when the composer appears.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRecording])

  // Stop any in-progress mic stream if the composer closes mid-recording.
  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
      clearInterval(timerRef.current)
    }
  }, [])

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      bodyRef.current?.focus()
    }
  }

  function handleDateInputChange(e) {
    if (e.target.value) setEntryDate(fromDateTimeLocalValue(e.target.value))
  }

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: file.name, type: file.type, dataUrl: reader.result },
        ])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeAttachment(id) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function toggleTag(name) {
    setTags((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]))
  }

  function handleAddCustomTag() {
    const name = newTagDraft.trim()
    if (!name) return
    onAddCustomTag(name)
    setTags((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setNewTagDraft('')
  }

  function insertPromptIntoBody() {
    setBody((b) => (b.trim() ? b : `${prompt}\n\n`))
    bodyRef.current?.focus()
  }

  async function startRecording() {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          setVoiceNote({ dataUrl: reader.result, duration: recordSeconds })
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorderRef.current = recorder
      setRecordSeconds(0)
      setVoiceNote(null)
      recorder.start()
      setIsRecording(true)
    } catch (err) {
      setMicError("Couldn't access your microphone — check your browser's site permissions.")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  function removeVoiceNote() {
    setVoiceNote(null)
    setRecordSeconds(0)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => {
      onSave({
        title: title.trim() || smartTitle,
        body: body || prompt,
        createdAt: entryDate.getTime(),
        mood,
        starred,
        tags,
        attachments,
        voiceNote,
      })
    }, 500)
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
          <div className="sheet__header-left">
            <button
              className="sheet__date"
              onClick={() => {
                setDatePickerOpen((o) => !o)
                setMoodPickerOpen(false)
              }}
            >
              {formatComposerDateTime(entryDate)} <ChevronDown size={15} />
            </button>
            <button
              className="sheet__mood-btn"
              style={{ background: MOOD_TINTS[mood] }}
              onClick={() => {
                setMoodPickerOpen((o) => !o)
                setDatePickerOpen(false)
              }}
              aria-label="Change mood for this entry"
            >
              <MoodFace mood={mood} size={15} />
            </button>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <AnimatePresence>
          {datePickerOpen && (
            <motion.div
              className="sheet__popover"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="datetime-local"
                className="sheet__datetime-input"
                value={toDateTimeLocalValue(entryDate)}
                onChange={handleDateInputChange}
              />
              <button className="link-btn" onClick={() => setDatePickerOpen(false)}>Done</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {moodPickerOpen && (
            <motion.div
              className="sheet__popover"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mood-inline-row">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    className="mood-inline-item"
                    onClick={() => {
                      setMood(m.id)
                      setMoodPickerOpen(false)
                    }}
                  >
                    <span className="mood-inline-face" style={{ background: MOOD_TINTS[m.id] }}>
                      <MoodFace mood={m.id} size={17} />
                    </span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="sheet__guided-actions">
            <button className="link-btn" onClick={() => setGuidedIndex((i) => (i + 1) % guidedPrompts.length)}>
              Try another prompt
            </button>
            <button className="link-btn" onClick={insertPromptIntoBody}>
              Use this prompt
            </button>
          </div>
        )}

        <input
          ref={titleRef}
          className="sheet__title"
          placeholder={smartTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          enterKeyHint="next"
        />

        {attachments.length > 0 && (
          <div className="sheet__attachments">
            {attachments.map((a) => (
              <div key={a.id} className="attachment-chip">
                {a.type.startsWith('image/') ? (
                  <img src={a.dataUrl} alt={a.name} />
                ) : (
                  <span className="attachment-chip__file">
                    <FileText size={16} />
                    <span>{a.name}</span>
                  </span>
                )}
                <button
                  className="attachment-chip__remove"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Remove ${a.name}`}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="sheet__tags-row">
            {tags.map((t) => (
              <span key={t} className="tag-chip">{t}</span>
            ))}
          </div>
        )}

        <textarea
          ref={bodyRef}
          className="sheet__body"
          placeholder="Add your thoughts..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <AnimatePresence>
          {tagPickerOpen && (
            <motion.div
              className="sheet__popover sheet__popover--tags"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="tag-picker__list">
                {allTags.map((name) => (
                  <button
                    key={name}
                    className={`tag-picker__chip ${tags.includes(name) ? 'is-selected' : ''}`}
                    onClick={() => toggleTag(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="tag-picker__new">
                <input
                  className="tag-picker__input"
                  placeholder="Create a new tag…"
                  value={newTagDraft}
                  onChange={(e) => setNewTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomTag()
                    }
                  }}
                />
                <button className="tag-picker__add" onClick={handleAddCustomTag} aria-label="Add tag">
                  <Plus size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isRecording || voiceNote || micError) && (
            <motion.div
              className="voice-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {micError ? (
                <p className="voice-panel__error">{micError}</p>
              ) : isRecording ? (
                <div className="voice-panel__recording">
                  <span className="voice-panel__dot" />
                  <span>Recording…</span>
                  <span className="voice-panel__time">{formatTime(recordSeconds)}</span>
                </div>
              ) : (
                <>
                  <p className="voice-panel__label">Voice Note Recorded</p>
                  <audio className="voice-panel__player" controls src={voiceNote.dataUrl} />
                  <div className="voice-panel__actions">
                    <button className="voice-panel__remove" onClick={removeVoiceNote}>
                      <Trash2 size={15} /> Remove
                    </button>
                    <span className="voice-panel__duration">{formatTime(voiceNote.duration)}</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={handleFilesSelected}
        />

        <div className="sheet__toolbar">
          <div className="sheet__toolbar-icons">
            <button
              className={`icon-btn ${starred ? 'is-active' : ''}`}
              onClick={() => setStarred((s) => !s)}
              aria-label={starred ? 'Unstar entry' : 'Star entry'}
            >
              <Star size={17} fill={starred ? 'var(--butter-dark)' : 'none'} />
            </button>
            <button
              className={`icon-btn ${attachments.length ? 'is-active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add image or file"
            >
              <ImageIcon size={17} />
            </button>
            <button
              className={`icon-btn ${tags.length ? 'is-active' : ''}`}
              onClick={() => setTagPickerOpen((o) => !o)}
              aria-label="Add tag"
            >
              <TagIcon size={17} />
            </button>
            <button
              className={`icon-btn ${isRecording ? 'is-recording' : ''}`}
              aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
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
function EntryDetail({ entry, onClose, onDelete, onToggleStar }) {
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
          <div className="sheet__header-actions">
            <button
              className={`icon-btn ${entry.starred ? 'is-active' : ''}`}
              onClick={() => onToggleStar(entry.id)}
              aria-label={entry.starred ? 'Unstar entry' : 'Star entry'}
            >
              <Star size={16} fill={entry.starred ? 'var(--butter-dark)' : 'none'} />
            </button>
            <button className="sheet__close" onClick={onClose} aria-label="Close">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="detail__tag-row">
          <span className="entry-card__tag" style={{ background: TINTS[entry.tint] }}>
            {entry.tag}
          </span>
          {entry.mood && (
            <span className="detail__mood" style={{ background: MOOD_TINTS[entry.mood] || TINTS[entry.tint] }}>
              <MoodFace mood={entry.mood} size={16} />
            </span>
          )}
        </div>

        <h2 className="detail__title">{entry.title}</h2>

        {entry.tags?.length > 0 && (
          <div className="sheet__tags-row">
            {entry.tags.map((t) => (
              <span key={t} className="tag-chip">{t}</span>
            ))}
          </div>
        )}

        {entry.attachments?.length > 0 && (
          <div className="detail__attachments">
            {entry.attachments.map((a) => (
              a.type?.startsWith('image/') ? (
                <img key={a.id} src={a.dataUrl} alt={a.name} className="detail__attachment-image" />
              ) : (
                <a
                  key={a.id}
                  href={a.dataUrl}
                  download={a.name}
                  className="detail__attachment-file"
                >
                  <FileText size={16} /> {a.name}
                </a>
              )
            ))}
          </div>
        )}

        <p className="detail__body">{entry.body}</p>

        {entry.voiceNote && (
          <audio className="voice-panel__player" controls src={entry.voiceNote.dataUrl} />
        )}

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
  const [desires, setDesires] = useLocalStorage('solace_desires', [])
  const [customTags, setCustomTags] = useLocalStorage('solace_custom_tags', [])

  const [tab, setTab] = useState('home')
  const [composerPreset, setComposerPreset] = useState(null)
  const [viewingEntry, setViewingEntry] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const contentRef = useRef(null)

  // The scroll pane is stable across tab switches (it no longer remounts),
  // so scroll position has to be reset by hand when the tab changes.
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [tab])

  if (!profile.onboarded) {
    return <Onboarding onComplete={(name) => setProfile({ name, onboarded: true })} />
  }

  const quote = getTodaysQuote()
  const greetingName = profile.name ? profile.name : 'there'
  const sortedEntries = sortEntriesForDisplay(entries)

  function handleSaveEntry({ title, body, createdAt, mood, starred, tags, attachments, voiceNote }) {
    const entry = {
      id: crypto.randomUUID(),
      createdAt: createdAt || Date.now(),
      tag: composerPreset?.tag || 'Free write',
      tint: composerPreset?.tint || 'sage',
      mood: mood ?? composerPreset?.mood ?? null,
      title,
      body,
      starred: !!starred,
      tags: tags || [],
      attachments: attachments || [],
      voiceNote: voiceNote || null,
    }
    setEntries((prev) => [entry, ...prev])
    setComposerPreset(null)
  }

  function handleAddCustomTag(name) {
    setCustomTags((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }

  function handleDeleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setViewingEntry(null)
  }

  function handleToggleStar(id) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)))
    setViewingEntry((prev) => (prev && prev.id === id ? { ...prev, starred: !prev.starred } : prev))
  }

  function handleResetData() {
    setEntries([])
    setDesires([])
    setCustomTags([])
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
          <QuickActions onSelect={setComposerPreset} />
          <EntryList
            entries={sortedEntries.slice(0, 3)}
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
        entries={sortedEntries}
        onOpen={setViewingEntry}
        onNew={() => setComposerPreset(freeformPreset)}
      />
    ),
    insights: <Insights entries={entries} />,
    desires: <Desires desires={desires} setDesires={setDesires} />,
  }

  return (
    <div className="app-shell">
      <div className="app-content" ref={contentRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="tab-panel"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {screens[tab]}
          </motion.div>
        </AnimatePresence>
      </div>

      <NavBar active={tab} onChange={setTab} />

      <AnimatePresence>
        {composerPreset && (
          <JournalEntry
            preset={composerPreset}
            onClose={() => setComposerPreset(null)}
            onSave={handleSaveEntry}
            customTags={customTags}
            onAddCustomTag={handleAddCustomTag}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingEntry && (
          <EntryDetail
            entry={viewingEntry}
            onClose={() => setViewingEntry(null)}
            onDelete={handleDeleteEntry}
            onToggleStar={handleToggleStar}
          />
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
